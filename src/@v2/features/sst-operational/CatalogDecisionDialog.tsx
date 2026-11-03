import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from 'core/contexts/AuthContext';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { CatalogDecisionRequest } from './catalog-decision';
import { SstDateField, useSstDateValidity } from './SstDateField';
import { SstEditContextNotice } from './SstEditContextNotice';
import { sstEditSession } from './edit-session';
import {
  browserEditStorage,
  clearSstEditContext,
  localCivilToday,
  readSstEditContext,
  saveSstEditContext,
  sstEditSuggestion,
} from './edit-context';
import {
  catalogAssessmentIssue,
  catalogFieldLabel,
  catalogSelectionIssue,
  catalogValueLabel,
  type CatalogIntent,
} from './catalog-review-model';

type PendingRequest = CatalogDecisionRequest & {
  complete: () => void;
  ownerUserId?: number;
};
const periodDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
};

export function CatalogDecisionDialog() {
  const { user } = useAuth();
  const intentControlId = `sst-catalog-intent-${useId()}`;
  const userId = useRef(user?.id);
  userId.current = user?.id;
  const dateInput = useRef<HTMLInputElement | null>(null);
  const [needsRenewal, setNeedsRenewal] = useState(false);
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const [pending, setPending] = useState<PendingRequest>();
  const [intent, setIntent] = useState<CatalogIntent | ''>('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setPending(undefined);
    const requests: PendingRequest[] = [];
    let current: PendingRequest | undefined;
    const show = () => {
      current = requests.shift();
      setPending(current);
      const active = sstEditSession.peek(userId.current, current?.companyId);
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
      setSelected([]);
      setError('');
      setSaving(false);
    };
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<CatalogDecisionRequest>).detail;
      requests.push({
        ...detail,
        ownerUserId: userId.current,
        complete: () => {
          current = undefined;
          show();
        },
      });
      if (!current) show();
    };
    window.addEventListener('sst-catalog-decision', listener);
    return () => {
      window.removeEventListener('sst-catalog-decision', listener);
      for (const request of [current, ...requests])
        request?.reject(
          new Error('Revisão interrompida. Confira o cadastro novamente.'),
        );
    };
  }, [user?.id]);
  const cancel = () => {
    if (!pending || saving) return;
    pending.reject(
      new Error('Revisão cancelada. A alteração não foi aplicada.'),
    );
    pending.complete();
  };
  const preview = pending?.preview;
  const selectionIssue = preview
    ? catalogSelectionIssue(preview, selected, intent, date)
    : undefined;
  const eligible =
    preview?.assessments.filter(
      (row) => !catalogAssessmentIssue(row, intent, date),
    ) || [];
  const confirm = async () => {
    if (
      !pending ||
      pending.ownerUserId !== userId.current ||
      !intent ||
      !date ||
      !reason.trim() ||
      selectionIssue ||
      needsRenewal ||
      saving
    )
      return;
    setSaving(true);
    setError('');
    try {
      const result = await pending.apply({
        intent,
        effectiveFrom: date,
        reason: reason.trim(),
        assessmentIds: selected,
      });
      if (pending.ownerUserId !== userId.current) return;
      if (intent === 'NEW_CONDITION')
        saveSstEditContext(
          browserEditStorage(),
          userId.current,
          pending.companyId,
          date,
        );
      pending.resolve(result);
      pending.complete();
    } catch (failure) {
      if (pending.ownerUserId !== userId.current) return;
      const response = failure as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const message = response.response?.data?.message || response.message;
      setError(
        (Array.isArray(message) ? message.join(' ') : message) ||
          'Não foi possível salvar. Volte ao cadastro e confira a prévia novamente.',
      );
      setSaving(false);
    }
  };
  return (
    <Dialog
      open={!!pending}
      onClose={cancel}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { maxHeight: 'calc(100% - 32px)' } }}
      aria-labelledby="sst-catalog-decision-title"
    >
      <DialogTitle
        id="sst-catalog-decision-title"
        sx={{ px: 12, pt: 12, pb: 6 }}
      >
        Conferir alteração do catálogo
      </DialogTitle>
      <DialogContent sx={{ px: 12, py: 4 }}>
        {preview && (
          <Stack spacing={8} useFlexGap>
            <Typography fontWeight={600}>{preview.catalogName}</Typography>
            <Alert severity="info">
              {preview.mode === 'COMPANY_USES_ONLY'
                ? 'O catálogo global de EPI permanece igual. A alteração será aplicada somente às avaliações selecionadas desta empresa.'
                : 'O cadastro base será atualizado. Somente as avaliações selecionadas receberão esta alteração; os demais períodos e usos serão preservados.'}{' '}
              Salvar não transmite eventos ao eSocial.
            </Alert>
            <Stack spacing={4} aria-label="Campos alterados">
              {preview.changes.map((change) => (
                <Box key={change.field} sx={{ overflowWrap: 'anywhere' }}>
                  <Typography fontWeight={600} variant="body2">
                    {catalogFieldLabel(change.field)}
                  </Typography>
                  <Typography variant="body2">
                    Antes: {catalogValueLabel(change.before, change.field)}
                  </Typography>
                  <Typography variant="body2">
                    Depois: {catalogValueLabel(change.after, change.field)}
                  </Typography>
                </Box>
              ))}
            </Stack>
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
              onChange={(event) => {
                setIntent(event.target.value as CatalogIntent);
                setDate(
                  event.target.value === 'NEW_CONDITION'
                    ? localCivilToday()
                    : '',
                );
                setNeedsRenewal(false);
              }}
              disabled={saving}
            >
              <MenuItem value="CORRECTION">
                Corrigir informação deste período
              </MenuItem>
              <MenuItem value="NEW_CONDITION">
                Registrar mudança nas condições
              </MenuItem>
            </TextField>
            {intent === 'NEW_CONDITION' && (
              <SstEditContextNotice
                disabled={saving}
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
            {intent && (
              <Typography variant="body2">
                {intent === 'CORRECTION'
                  ? 'Corrige os períodos selecionados, preservando a revisão anterior. Se o conteúdo declarado mudar, será preparada a retificação correspondente.'
                  : 'Preserva a condição anterior e cria outra a partir da data informada, somente nas avaliações selecionadas.'}
              </Typography>
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
              disabled={saving}
            />
            <TextField
              label="Motivo da alteração"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              multiline
              minRows={2}
              disabled={saving}
            />
            <Box>
              <Typography component="h3" fontWeight={600}>
                Escolha as avaliações e os períodos
              </Typography>
              <Typography variant="body2">
                {preview.summary.totalAssessments} avaliação(ões) e{' '}
                {preview.summary.totalWorkers} vínculo(s) de empregado no
                levantamento. Selecionadas: {selected.length} de até{' '}
                {preview.limits.selection}.
              </Typography>
              <Button
                size="small"
                disabled={
                  saving ||
                  !intent ||
                  !date ||
                  !eligible.length ||
                  eligible.length > preview.limits.selection
                }
                onClick={() => setSelected(eligible.map((row) => row.id))}
              >
                Selecionar avaliações compatíveis com a data
              </Button>
              <Button
                size="small"
                disabled={saving || !selected.length}
                onClick={() => setSelected([])}
              >
                Limpar seleção
              </Button>
            </Box>
            <Stack spacing={4} role="group" aria-label="Avaliações afetadas">
              {preview.assessments.map((row) => {
                const issue = catalogAssessmentIssue(row, intent, date);
                const name = `${row.sourceName} — ${row.riskName}`;
                const period = `${row.startDate ? periodDate(row.startDate) : 'Sem data inicial'} até ${row.endDate ? periodDate(row.endDate) : 'em aberto'}`;
                return (
                  <Box
                    key={row.id}
                    sx={{
                      p: 6,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <FormControlLabel
                      sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
                      control={
                        <Checkbox
                          checked={selected.includes(row.id)}
                          disabled={
                            saving || (!!issue && !selected.includes(row.id))
                          }
                          onChange={(_, checked) =>
                            setSelected((old) =>
                              checked
                                ? [...old, row.id]
                                : old.filter((id) => id !== row.id),
                            )
                          }
                          inputProps={{ 'aria-label': `${name}, ${period}` }}
                        />
                      }
                      label={
                        <Box sx={{ pt: 4, overflowWrap: 'anywhere' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {name}
                          </Typography>
                          <Typography variant="body2">{period}</Typography>
                          <Typography variant="body2">
                            {row.workerCount} vínculo(s),{' '}
                            {row.protectedWorkerCount} com histórico de envio.
                          </Typography>
                        </Box>
                      }
                    />
                    {issue && (
                      <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        {issue}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
            {selectionIssue && (
              <Alert severity="warning">{selectionIssue}</Alert>
            )}
            {error && (
              <Alert severity="error" role="alert">
                {error}
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{ px: 12, pt: 8, pb: 12, gap: 4, flexWrap: 'wrap' }}
      >
        <Button disabled={saving} onClick={cancel}>
          Voltar ao cadastro
        </Button>
        <Button
          variant="contained"
          disabled={
            saving ||
            !intent ||
            !date ||
            !reason.trim() ||
            !!selectionIssue ||
            needsRenewal ||
            !datesValid
          }
          onClick={confirm}
        >
          {saving ? 'Salvando…' : 'Confirmar e salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
