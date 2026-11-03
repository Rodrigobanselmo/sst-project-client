import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useSstAccess } from './access';
import { useAuth } from 'core/contexts/AuthContext';
import { sstEditSession } from './edit-session';
import { SstDateField, useSstDateValidity } from './SstDateField';
import { messageOf, sstGet, sstPost } from './api';
import { invalidateGhoAndHierarchyFamilies } from 'core/services/hooks/mutations/checklist/gho/invalidate-gho-queries.util';
import { queryClient as legacyQueryClient } from 'core/services/queryClient';
import { v2QueryClient } from '@v2/services/query-client';
import { QueryEnum } from 'core/enums/query.enums';
import { SstMutationCancelledError } from './mutation-decision';
import type { StructuralDecisionRequest } from './structural-decision';
import {
  requireStructuralPeriods,
  structuralEmploymentCount,
  structuralFields,
  structuralIntent,
  structuralLabels,
  structuralMetadataDraft,
  structuralMetadataPatch,
  type StructuralAction,
  type StructuralContext,
  type StructuralPeriod,
  type StructuralTarget,
} from './structural-review-model';

const route = '/sst-operational/structure';
const dateLabel = (value?: string) =>
  value?.slice(0, 10).split('-').reverse().join('/') || 'Em aberto';

export function StructuralRevisionDialog({
  companyId,
  target,
  action: initialAction = 'METADATA',
  effectiveFrom: initialFrom,
  onClose,
  onApplied,
}: {
  companyId: string;
  target: StructuralTarget;
  action?: StructuralAction;
  effectiveFrom?: string;
  onClose: () => void;
  onApplied: (result: any) => void;
}) {
  const access = useSstAccess();
  const { user } = useAuth();
  const ownerUserId = useRef(user?.id);
  const currentUserId = useRef(user?.id);
  currentUserId.current = user?.id;
  const editSession = sstEditSession.peek(user?.id, companyId);
  const client = useQueryClient();
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const context = useQuery<StructuralContext>(
    ['sst-structural-context', companyId, target.table, target.id],
    () =>
      sstGet(
        companyId,
        `${route}/context?table=${target.table}&id=${encodeURIComponent(target.id)}`,
      ),
    { retry: false, refetchOnWindowFocus: false },
  );
  const [action, setAction] = useState<StructuralAction>(initialAction);
  const [from, setFrom] = useState(
    initialFrom ||
      (structuralIntent(initialAction) === 'NEW_CONDITION'
        ? editSession?.effectiveFrom
        : '') ||
      '',
  );
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [baseline, setBaseline] = useState<Record<string, unknown>>({});
  const [relationKey, setRelationKey] = useState('');
  const [periods, setPeriods] = useState<StructuralPeriod[]>([]);
  const [reason, setReason] = useState(
    structuralIntent(initialAction) === 'NEW_CONDITION'
      ? editSession?.reason || ''
      : '',
  );
  const [preview, setPreview] = useState<{
    key: string;
    input: Record<string, unknown>;
    context: StructuralContext;
  }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stale, setStale] = useState(false);
  const hydrated = useRef(false);
  const attempt = useRef<{ key: string; operationId: string } | null>(null);
  const read = context.data;
  const relation = read?.relations?.find(
    (item) => `${item.to.table}:${item.to.id}` === relationKey,
  );
  const allowedFields = read?.allowedFields || [];
  const choosePeriod = (date: string, current = read) => {
    const period = current?.periods.find((item) => item.effectiveFrom === date);
    const values = period?.values || current?.current || {};
    setFrom(date);
    setBaseline(values);
    setMetadata(structuralMetadataDraft(values, current?.allowedFields || []));
    setPreview(undefined);
  };
  useEffect(() => {
    if (!read || hydrated.current) return;
    hydrated.current = true;
    if (initialAction === 'METADATA')
      choosePeriod(
        initialFrom ||
          read.selectedPeriod?.effectiveFrom ||
          read.periods.at(-1)?.effectiveFrom ||
          '',
        read,
      );
    else {
      setBaseline(read.current);
      setMetadata(structuralMetadataDraft(read.current, read.allowedFields));
    }
  }, [read]);
  const chooseAction = (next: StructuralAction) => {
    setAction(next);
    setPreview(undefined);
    setError('');
    setStale(false);
    attempt.current = null;
    if (next === 'METADATA')
      choosePeriod(
        read?.selectedPeriod?.effectiveFrom ||
          read?.periods.at(-1)?.effectiveFrom ||
          '',
      );
    else setFrom('');
  };
  const input = () => {
    if (!from)
      throw new Error(
        'Informe a data que representa a alteração ou selecione um período existente.',
      );
    return {
      target,
      action,
      intent: structuralIntent(action),
      effectiveFrom: from,
      ...(action === 'METADATA'
        ? { patch: structuralMetadataPatch(baseline, metadata, allowedFields) }
        : {}),
      ...(action === 'RELATION_PERIODS'
        ? {
            relation: relation
              ? {
                  to: relation.to,
                  expectedRevisionId: relation.expectedRevisionId,
                  periods: requireStructuralPeriods(
                    periods,
                    relation.physicallyPresent,
                  ),
                }
              : (() => {
                  throw new Error(
                    'Selecione a participação que precisa corrigir.',
                  );
                })(),
          }
        : {}),
    };
  };
  const analyze = async () => {
    if (ownerUserId.current !== currentUserId.current) return;
    setError('');
    let body: ReturnType<typeof input>;
    try {
      body = input();
    } catch (failure) {
      setError(messageOf(failure));
      return;
    }
    setBusy(true);
    try {
      const checked = await sstPost(companyId, `${route}/preview`, body);
      if (ownerUserId.current !== currentUserId.current) return;
      setPreview({ key: JSON.stringify(body), input: body, context: checked });
      setStale(false);
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };
  const apply = async () => {
    if (ownerUserId.current !== currentUserId.current) return;
    if (!preview || !reason.trim() || busy) return;
    let body: ReturnType<typeof input>;
    try {
      body = input();
    } catch (failure) {
      setError(messageOf(failure));
      return;
    }
    if (preview.key !== JSON.stringify(body)) {
      setError(
        'As informações mudaram. Confira uma nova prévia antes de aplicar.',
      );
      return;
    }
    const payload = {
      ...body,
      expectedHead: preview.context.expectedHead,
      impactHash: preview.context.impactHash,
      reason: reason.trim(),
    };
    const key = JSON.stringify(payload);
    if (attempt.current?.key !== key)
      attempt.current = { key, operationId: crypto.randomUUID() };
    setBusy(true);
    setError('');
    try {
      const result = await sstPost(companyId, `${route}/apply`, {
        ...payload,
        operationId: attempt.current.operationId,
      });
      if (ownerUserId.current !== currentUserId.current) return;
      await Promise.all([
        invalidateGhoAndHierarchyFamilies(companyId),
        legacyQueryClient.invalidateQueries([
          QueryEnum.CHARACTERIZATIONS,
          companyId,
        ]),
        legacyQueryClient.invalidateQueries([
          QueryEnum.CHARACTERIZATION,
          companyId,
        ]),
        legacyQueryClient.invalidateQueries([QueryEnum.RISK_DATA, companyId]),
        legacyQueryClient.invalidateQueries([QueryEnum.COMPANY]),
        v2QueryClient.invalidateQueries({ queryKey: ['characterizations'] }),
        client.invalidateQueries(['sst-source-history', companyId]),
        client.invalidateQueries(['sst-structural-context', companyId]),
        client.invalidateQueries(['sst-pending', companyId]),
        client.invalidateQueries(['sst-declarations', companyId]),
      ]);
      onApplied(result);
    } catch (failure: any) {
      setError(messageOf(failure));
      if (
        /REVISION_CONFLICT|SOURCE_CHANGED|STATE_CONFLICT/.test(
          failure.response?.data?.code || '',
        )
      ) {
        setStale(true);
        setPreview(undefined);
        // Refresh only the concurrency baseline. Hydration runs once, so all
        // fields and relation dates entered by the reviewer stay intact.
        await context.refetch();
      }
    } finally {
      setBusy(false);
    }
  };
  const changePeriods = (index: number, patch: Partial<StructuralPeriod>) => {
    setPeriods((current) =>
      current.map((period, itemIndex) =>
        itemIndex === index ? { ...period, ...patch } : period,
      ),
    );
    setPreview(undefined);
  };
  return (
    <Dialog
      open
      onClose={() => !busy && onClose()}
      fullWidth
      maxWidth="md"
      aria-labelledby="structural-review-title"
      PaperProps={{ sx: { maxHeight: 'calc(100% - 32px)' } }}
    >
      <DialogTitle id="structural-review-title" sx={{ p: '24px', pb: '16px' }}>
        {structuralLabels[action]}
      </DialogTitle>
      <DialogContent sx={{ px: '24px', py: '8px' }}>
        <Stack spacing={8} useFlexGap>
          {context.isLoading && (
            <CircularProgress
              size={24}
              aria-label="Carregando períodos do cadastro"
            />
          )}
          {context.isError && (
            <Alert severity="error">
              Não foi possível consultar esta origem. Nenhum dado foi alterado.{' '}
              <Button onClick={() => context.refetch()}>
                Tentar novamente
              </Button>
            </Alert>
          )}
          {read && (
            <>
              <Typography variant="subtitle1">{read.label}</Typography>
              <Alert severity="info">
                A identidade do cadastro, os períodos anteriores e os XMLs e
                recibos enviados serão preservados. Esta revisão não transmite
                eventos automaticamente.
              </Alert>
              <TextField
                select
                label="O que precisa fazer?"
                value={action}
                disabled={busy}
                onChange={(e) =>
                  chooseAction(e.target.value as StructuralAction)
                }
              >
                <MenuItem value={read.archived ? 'RESTORE' : 'ARCHIVE'}>
                  {structuralLabels[read.archived ? 'RESTORE' : 'ARCHIVE']}
                </MenuItem>
                <MenuItem
                  value="METADATA"
                  disabled={!access.canConfigure || !read.periods.length}
                >
                  {structuralLabels.METADATA}
                </MenuItem>
                <MenuItem
                  value="RELATION_PERIODS"
                  disabled={!access.canConfigure || !read.relations?.length}
                >
                  {structuralLabels.RELATION_PERIODS}
                </MenuItem>
              </TextField>
              {action === 'METADATA' ? (
                <>
                  <Alert severity="info">
                    Esta correção altera os dados do período escolhido. Um
                    período encerrado não substitui os dados atuais. Para uma
                    mudança real a partir de outra data, use a edição normal do
                    cadastro.
                  </Alert>
                  <TextField
                    select
                    label="Período que estava incorreto"
                    value={from}
                    disabled={busy}
                    onChange={(e) => choosePeriod(e.target.value)}
                  >
                    {read.periods.map((period) => (
                      <MenuItem
                        value={period.effectiveFrom}
                        key={period.effectiveFrom}
                      >
                        {dateLabel(period.effectiveFrom)} até{' '}
                        {dateLabel(period.effectiveTo)}
                      </MenuItem>
                    ))}
                  </TextField>
                  {allowedFields
                    .filter((field) => structuralFields[field])
                    .map((field) =>
                      structuralFields[field].type === 'boolean' ? (
                        <TextField
                          key={field}
                          select
                          fullWidth
                          label={structuralFields[field].label}
                          value={metadata[field] || ''}
                          disabled={busy}
                          onChange={(e) => {
                            setMetadata((current) => ({
                              ...current,
                              [field]: e.target.value,
                            }));
                            setPreview(undefined);
                          }}
                        >
                          <MenuItem value="true">Sim</MenuItem>
                          <MenuItem value="false">Não</MenuItem>
                        </TextField>
                      ) : (
                        <TextField
                          key={field}
                          fullWidth
                          label={structuralFields[field].label}
                          value={metadata[field] || ''}
                          disabled={busy}
                          multiline={field !== 'name' && field !== 'cnpj'}
                          minRows={
                            structuralFields[field].type === 'list'
                              ? 3
                              : undefined
                          }
                          helperText={
                            structuralFields[field].type === 'list'
                              ? 'Uma entrada por linha. Os dados não alterados permanecem preservados.'
                              : undefined
                          }
                          onChange={(e) => {
                            setMetadata((current) => ({
                              ...current,
                              [field]: e.target.value,
                            }));
                            setPreview(undefined);
                          }}
                        />
                      ),
                    )}
                </>
              ) : action === 'RELATION_PERIODS' ? (
                <>
                  <Alert severity="info">
                    A correção revisa a linha do tempo desta participação. Ela
                    mantém a associação atual ao setor ou estabelecimento. Uma
                    entrada ou saída real deve ser feita pelo cadastro, com a
                    data da mudança.
                  </Alert>
                  <TextField
                    select
                    label="Participação a corrigir"
                    value={relationKey}
                    disabled={busy}
                    onChange={(e) => {
                      const selected = read.relations?.find(
                        (item) =>
                          `${item.to.table}:${item.to.id}` === e.target.value,
                      );
                      setRelationKey(e.target.value);
                      setPeriods(
                        selected?.periods.map((period) => ({
                          effectiveFrom: period.effectiveFrom,
                          effectiveTo: period.effectiveTo,
                        })) || [],
                      );
                      setFrom(selected?.periods[0]?.effectiveFrom || '');
                      setPreview(undefined);
                    }}
                  >
                    {read.relations?.map((item) => (
                      <MenuItem
                        key={`${item.to.table}:${item.to.id}`}
                        value={`${item.to.table}:${item.to.id}`}
                      >
                        {item.label} —{' '}
                        {item.physicallyPresent
                          ? 'participação atual'
                          : 'participação encerrada'}
                      </MenuItem>
                    ))}
                  </TextField>
                  {periods.map((period, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: '16px',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={8} useFlexGap>
                        <Typography variant="subtitle2">
                          Período {index + 1}
                        </Typography>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={8}
                          useFlexGap
                        >
                          <SstDateField
                            fullWidth
                            label={`Início da participação ${index + 1}`}
                            value={period.effectiveFrom}
                            disabled={busy}
                            onValidityChange={dateFieldValidity(
                              `start-${index}`,
                            )}
                            onChange={(value) => {
                              changePeriods(index, {
                                effectiveFrom: value,
                              });
                              if (index === 0) setFrom(value);
                            }}
                          />
                          <SstDateField
                            fullWidth
                            label={`Fim da participação ${index + 1}`}
                            value={period.effectiveTo || ''}
                            disabled={busy}
                            helperText="Vazio somente para a participação atual."
                            onValidityChange={dateFieldValidity(`end-${index}`)}
                            onChange={(value) =>
                              changePeriods(index, {
                                effectiveTo: value || undefined,
                              })
                            }
                          />
                        </Stack>
                        <Button
                          disabled={busy}
                          onClick={() => {
                            setPeriods((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            );
                            setPreview(undefined);
                          }}
                        >
                          Remover este período da correção
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                  {relation && (
                    <Button
                      disabled={busy || periods.length >= 200}
                      onClick={() => {
                        setPeriods((current) => [
                          ...current,
                          { effectiveFrom: '' },
                        ]);
                        setPreview(undefined);
                      }}
                    >
                      Adicionar período à correção
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Alert severity="warning">
                    {action === 'ARCHIVE'
                      ? 'O encerramento preserva o cadastro e fecha suas participações a partir da data informada. Dependências ativas precisam ser transferidas ou encerradas antes. A ausência de exposição exige revisão explícita.'
                      : 'A restauração cria uma nova participação a partir da data informada. Os períodos antigos continuam encerrados; nenhum intervalo será reaberto automaticamente.'}
                  </Alert>
                  <SstDateField
                    label={
                      action === 'ARCHIVE'
                        ? 'Desde quando o cadastro deixou de valer?'
                        : 'Início da nova participação'
                    }
                    value={from}
                    disabled={busy}
                    onValidityChange={dateFieldValidity('from')}
                    onChange={(value) => {
                      setFrom(value);
                      setPreview(undefined);
                    }}
                  />
                </>
              )}
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Motivo desta revisão"
                value={reason}
                disabled={busy}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button
                variant="outlined"
                disabled={busy || !from || !datesValid}
                onClick={() => void analyze()}
              >
                Conferir impacto desta alteração
              </Button>
              {preview && (
                <Box
                  role="region"
                  aria-label="Impacto da revisão do cadastro"
                  sx={{
                    p: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Stack spacing={8} useFlexGap>
                    <Typography variant="subtitle1">
                      Confira antes de aplicar
                    </Typography>
                    <Typography>
                      {structuralLabels[action]} · {preview.context.label} ·
                      desde {dateLabel(from)}
                    </Typography>
                    <Typography>
                      {structuralEmploymentCount(preview.context)} vínculo(s) de
                      empregado serão conferidos. XMLs e recibos existentes
                      permanecem preservados.
                    </Typography>
                    {preview.context.blockers.map((blocker) => (
                      <Alert severity="warning" key={blocker.code}>
                        {blocker.message}
                      </Alert>
                    ))}
                    {!preview.context.blockers.length && (
                      <Alert severity="info">
                        A prévia não encontrou impedimentos. Aplicar altera o
                        cadastro e as pendências locais; o envio ao eSocial
                        permanece uma ação separada.
                      </Alert>
                    )}
                  </Stack>
                </Box>
              )}
            </>
          )}
          {stale && (
            <Alert severity="warning">
              O cadastro ou suas participações mudaram durante a revisão. Seus
              campos foram mantidos. Confira uma nova prévia antes de aplicar.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{ p: '24px', gap: '16px', flexWrap: 'wrap' }}
      >
        <Button disabled={busy} onClick={onClose}>
          Voltar ao cadastro
        </Button>
        <Button
          variant="contained"
          disabled={
            busy ||
            !datesValid ||
            !preview ||
            !!preview.context.blockers.length ||
            !reason.trim()
          }
          onClick={() => void apply()}
        >
          Confirmar alteração no cadastro
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function StructuralDecisionDialog() {
  const { user } = useAuth();
  const [pending, setPending] = useState<StructuralDecisionRequest>();
  const queue = useRef<StructuralDecisionRequest[]>([]);
  const active = useRef<StructuralDecisionRequest | undefined>(undefined);
  const [generation, setGeneration] = useState(0);
  const finish = () => {
    active.current = queue.current.shift();
    setGeneration((value) => value + 1);
    setPending(active.current);
  };
  useEffect(() => {
    setPending(undefined);
    active.current = undefined;
    queue.current = [];
    const listener = (event: Event) => {
      const request = (event as CustomEvent<StructuralDecisionRequest>).detail;
      if (active.current) queue.current.push(request);
      else {
        active.current = request;
        setPending(request);
      }
    };
    window.addEventListener('sst-structural-decision', listener);
    return () => {
      window.removeEventListener('sst-structural-decision', listener);
      for (const request of [active.current, ...queue.current].filter(Boolean))
        request!.reject(new SstMutationCancelledError());
    };
  }, [user?.id]);
  return pending ? (
    <StructuralRevisionDialog
      key={`${generation}:${pending.companyId}:${pending.target.table}:${pending.target.id}`}
      {...pending}
      onClose={() => {
        pending.reject(new SstMutationCancelledError());
        finish();
      }}
      onApplied={(result) => {
        pending.resolve(result);
        finish();
      }}
    />
  ) : null;
}
