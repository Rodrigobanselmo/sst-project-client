import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from 'core/contexts/AuthContext';
import { SstMutationCancelledError } from './mutation-decision';
import { sstEditSession } from './edit-session';
import { SstDateField, useSstDateValidity } from './SstDateField';
import { SstEditContextNotice } from './SstEditContextNotice';
import {
  browserEditStorage,
  clearSstEditContext,
  localCivilToday,
  readSstEditContext,
  saveSstEditContext,
  sstEditSuggestion,
} from './edit-context';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
export function MutationDecisionDialog() {
  const { user } = useAuth();
  const intentControlId = `sst-mutation-intent-${useId()}`;
  const userId = useRef(user?.id);
  userId.current = user?.id;
  const dateInput = useRef<HTMLInputElement | null>(null);
  const [needsRenewal, setNeedsRenewal] = useState(false);
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const [pending, setPending] = useState<any>();
  const [reuse, setReuse] = useState(false);
  const [contextError, setContextError] = useState('');
  const [intent, setIntent] = useState(''),
    [date, setDate] = useState(''),
    [reason, setReason] = useState('');
  useEffect(() => {
    setPending(undefined);
    const requests: any[] = [];
    let current: any;
    const show = () => {
      // Drain automatic answers synchronously. A queued microtask could erase
      // a manual request that arrived between two automatic responses.
      while (!current && requests.length) {
        const candidate = requests.shift();
        const automatic = sstEditSession.resolve(
          userId.current,
          candidate.companyId,
          candidate.expectedHead,
        );
        if (automatic) candidate.resolve(automatic);
        else {
          current = candidate;
          break;
        }
      }
      if (!current) {
        setPending(undefined);
        return;
      }
      setPending(current);
      const active = sstEditSession.peek(userId.current, current.companyId);
      const suggestion = sstEditSuggestion(
        readSstEditContext(
          browserEditStorage(),
          userId.current,
          current?.companyId,
        ),
      );
      setIntent('NEW_CONDITION');
      setDate(active?.effectiveFrom || suggestion.effectiveFrom);
      setNeedsRenewal(!active && suggestion.needsRenewal);
      setReason(active?.reason || '');
      setReuse(false);
      setContextError('');
    };
    const listener = (event: any) => {
      requests.push({
        ...event.detail,
        ownerUserId: userId.current,
        complete: () => {
          current = undefined;
          show();
        },
      });
      if (!current) show();
    };
    window.addEventListener('sst-condition-decision', listener);
    return () => {
      window.removeEventListener('sst-condition-decision', listener);
      for (const r of [current, ...requests].filter(Boolean))
        r.reject(
          new Error('Edição interrompida; seus dados não foram aplicados.'),
        );
    };
  }, [user?.id]);
  const cancel = () => {
    pending.reject(new SstMutationCancelledError());
    pending.complete();
  };
  return (
    <Dialog
      open={!!pending}
      onClose={cancel}
      fullWidth
      PaperProps={{ sx: { maxHeight: 'calc(100% - 32px)' } }}
      aria-labelledby="sst-decision-title"
    >
      <DialogTitle id="sst-decision-title" sx={{ px: 12, pt: 12, pb: 6 }}>
        Como esta alteração afeta o período?
      </DialogTitle>
      <DialogContent sx={{ px: 12, py: 4 }}>
        <Stack spacing={8} useFlexGap>
          <Alert severity="info">
            {pending?.message ||
              'Esta alteração alcança uma condição já declarada ao eSocial.'}{' '}
            A gravação só será aplicada depois desta escolha. O envio será
            conferido no painel do eSocial.
          </Alert>
          {!!pending?.affectedEmployments && (
            <Typography>
              {pending.affectedEmployments} vínculo(s) de empregado afetado(s).
            </Typography>
          )}
          <TextField
            id={intentControlId}
            SelectProps={{
              SelectDisplayProps: {
                'aria-labelledby': `${intentControlId}-label`,
              },
            }}
            select
            label="Natureza da alteração"
            value={intent}
            onChange={(e) => {
              setIntent(e.target.value);
              setDate(
                e.target.value === 'NEW_CONDITION' ? localCivilToday() : '',
              );
              setNeedsRenewal(false);
              setReuse(false);
            }}
          >
            <MenuItem value="CORRECTION">
              Corrigir informação deste período
            </MenuItem>
            <MenuItem value="NEW_CONDITION">
              Registrar mudança nas condições
            </MenuItem>
          </TextField>
          {intent && (
            <Typography variant="body2">
              {intent === 'CORRECTION'
                ? 'Use quando a informação daquele período estava incorreta. A revisão anterior é preservada e, se o conteúdo declarado mudar, será preparada a retificação do evento correspondente.'
                : 'Use quando as condições realmente mudaram. Informe desde quando: o período anterior será preservado e será preparada a nova condição quando houver diferença declaratória.'}
            </Typography>
          )}
          {intent === 'NEW_CONDITION' && (
            <SstEditContextNotice
              date={date}
              needsRenewal={needsRenewal}
              onRenew={() => setNeedsRenewal(false)}
              onToday={() => {
                setDate(localCivilToday());
                setNeedsRenewal(false);
              }}
              onChange={() => dateInput.current?.focus()}
              onClear={() => {
                clearSstEditContext(
                  browserEditStorage(),
                  userId.current,
                  pending?.companyId,
                );
                setDate(localCivilToday());
                setNeedsRenewal(false);
              }}
            />
          )}
          <SstDateField
            inputRef={dateInput}
            label={
              intent === 'CORRECTION'
                ? 'Data dentro do período a corrigir'
                : 'Início da nova condição'
            }
            value={date}
            onChange={(value) => {
              setDate(value);
              setNeedsRenewal(false);
            }}
            onValidityChange={dateFieldValidity('date')}
          />
          <TextField
            label="Motivo da alteração"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            inputProps={{ maxLength: 2000 }}
          />
          {intent === 'NEW_CONDITION' && pending?.companyId && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={reuse}
                  onChange={(event) => setReuse(event.target.checked)}
                />
              }
              label="Usar esta data e motivo nas próximas alterações desta empresa por 2 horas"
            />
          )}
          {reuse && (
            <Alert severity="info">
              As próximas alterações comuns desta empresa usarão nova condição,
              esta data e este motivo nesta aba. Você pode conferir uma exceção
              ou encerrar pelo aviso visível. Propostas da IA ainda precisam da
              sua confirmação.
            </Alert>
          )}
          {contextError && <Alert severity="error">{contextError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{ px: 12, pt: 8, pb: 12, gap: 4, flexWrap: 'wrap' }}
      >
        <Button onClick={cancel}>Voltar ao cadastro</Button>
        <Button
          disabled={
            !intent ||
            !date ||
            !reason.trim() ||
            !datesValid ||
            needsRenewal ||
            pending?.ownerUserId !== user?.id
          }
          onClick={() => {
            if (pending?.ownerUserId !== userId.current) return;
            if (reuse && intent === 'NEW_CONDITION') {
              try {
                sstEditSession.activate({
                  userId: userId.current!,
                  companyId: pending.companyId,
                  effectiveFrom: date,
                  reason,
                });
              } catch (failure) {
                setContextError(
                  failure instanceof Error
                    ? failure.message
                    : 'Confira os dados.',
                );
                return;
              }
            }
            if (intent === 'NEW_CONDITION')
              saveSstEditContext(
                browserEditStorage(),
                userId.current,
                pending?.companyId,
                date,
              );
            pending.resolve({
              intent,
              effectiveFrom: date,
              reason,
              expectedHead: pending.expectedHead,
            });
            pending.complete();
          }}
        >
          Confirmar e salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
