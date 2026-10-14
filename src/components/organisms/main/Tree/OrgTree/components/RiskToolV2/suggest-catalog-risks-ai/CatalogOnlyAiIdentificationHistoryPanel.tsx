import { useEffect, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';

import { useFetchCatalogOnlyAiIdentificationHistory } from '@v2/services/security/characterization/characterization/catalog-only-ai-identification-history/hooks/useFetchCatalogOnlyAiIdentificationHistory';
import type {
  CatalogOnlyAiIdentificationEntityKind,
  CatalogOnlyAiIdentificationRunItem,
} from '@v2/services/security/characterization/characterization/catalog-only-ai-identification-history/service/catalog-only-ai-identification-history.types';

import { CATALOG_ONLY_HISTORY_PRIOR_LABEL } from './catalog-only-history-prior-label.constants';
import {
  filterCatalogOnlyHistoryIdsForLink,
  resolveCatalogOnlyHistoryItemLinkState,
} from './resolve-catalog-only-history-item-link-state.util';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  entityKind: CatalogOnlyAiIdentificationEntityKind;
  entityId: string;
  catalogIds: Set<string>;
  existingDirectRiskIds: Set<string>;
  catalogReady: boolean;
  linking?: boolean;
  /** Incrementado após análise bem-sucedida para refetch. */
  refreshToken?: number;
  onAddSelected: (riskIds: string[]) => Promise<void> | void;
};

function formatRunDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function historyItemStatusLabel(
  state: ReturnType<typeof resolveCatalogOnlyHistoryItemLinkState>,
  item: CatalogOnlyAiIdentificationRunItem,
): string {
  if (state === 'already_linked') {
    return 'Já vinculado atualmente — não pode ser incluído novamente';
  }
  if (state === 'unavailable') {
    return 'Indisponível ou inativo no catálogo permitido — inclusão bloqueada';
  }
  const eraLabel =
    item.classification === 'ALREADY_LINKED'
      ? 'já vinculado na época'
      : 'novo na época';
  return `${CATALOG_ONLY_HISTORY_PRIOR_LABEL} · ${eraLabel}`;
}

export function CatalogOnlyAiIdentificationHistoryPanel({
  open,
  companyId,
  workspaceId,
  entityKind,
  entityId,
  catalogIds,
  existingDirectRiskIds,
  catalogReady,
  linking = false,
  refreshToken = 0,
  onAddSelected,
}: Props) {
  const [page, setPage] = useState(1);
  /** Seleção explícita por consulta: runId → riskIds */
  const [selectedByRun, setSelectedByRun] = useState<
    Record<string, Set<string>>
  >({});
  const [addingRunId, setAddingRunId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setSelectedByRun({});
  }, [entityId, entityKind, companyId, workspaceId, refreshToken]);

  const historyQuery = useFetchCatalogOnlyAiIdentificationHistory(
    {
      companyId,
      workspaceId,
      entityKind,
      entityId,
      page,
    },
    {
      enabled: open && Boolean(companyId && workspaceId && entityId),
      refreshToken,
    },
  );

  // Ao atualizar vínculos atuais, remove da seleção o que deixou de ser elegível.
  useEffect(() => {
    setSelectedByRun((current) => {
      let changed = false;
      const next: Record<string, Set<string>> = {};
      for (const [runId, ids] of Object.entries(current)) {
        const kept = new Set<string>();
        for (const id of ids) {
          const state = resolveCatalogOnlyHistoryItemLinkState({
            item: { riskId: id },
            catalogIds,
            existingDirectRiskIds,
          });
          if (state === 'selectable') kept.add(id);
          else changed = true;
        }
        next[runId] = kept;
      }
      return changed ? next : current;
    });
  }, [catalogIds, existingDirectRiskIds]);

  const data = historyQuery.data;
  const results = data?.results || [];

  const toggleItem = (runId: string, riskId: string, checked: boolean) => {
    setSelectedByRun((current) => {
      const previous = current[runId] || new Set<string>();
      const nextSet = new Set(previous);
      if (checked) nextSet.add(riskId);
      else nextSet.delete(riskId);
      return { ...current, [runId]: nextSet };
    });
  };

  const handleAddFromRun = async (runId: string) => {
    const selected = [...(selectedByRun[runId] || [])];
    const filtered = filterCatalogOnlyHistoryIdsForLink({
      selectedRiskIds: selected,
      catalogIds,
      existingDirectRiskIds,
    });
    if (!filtered.linkableIds.length) return;

    setAddingRunId(runId);
    try {
      await onAddSelected(filtered.linkableIds);
      setSelectedByRun((current) => ({
        ...current,
        [runId]: new Set(),
      }));
    } finally {
      setAddingRunId(null);
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <HistoryOutlinedIcon fontSize="small" color="action" />
        <Typography variant="subtitle2">
          Histórico de consultas com IA
        </Typography>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1.5 }}
      >
        Referência técnica das consultas anteriores. Selecione fatores
        explicitamente para vincular — abrir o histórico ou analisar de novo
        nunca inclui automaticamente. Expressão:{' '}
        {CATALOG_ONLY_HISTORY_PRIOR_LABEL}.
      </Typography>

      {historyQuery.isLoading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Carregando histórico…
          </Typography>
        </Stack>
      )}

      {historyQuery.isError && (
        <Typography variant="body2" color="error">
          Não foi possível carregar o histórico.
        </Typography>
      )}

      {!historyQuery.isLoading && !historyQuery.isError && !results.length && (
        <Typography variant="body2" color="text.secondary">
          Nenhuma consulta concluída registrada para esta entidade.
        </Typography>
      )}

      <Stack spacing={1}>
        {results.map((run) => {
          const selected = selectedByRun[run.id] || new Set<string>();
          const selectableCount = run.items.filter(
            (item) =>
              resolveCatalogOnlyHistoryItemLinkState({
                item,
                catalogIds,
                existingDirectRiskIds,
              }) === 'selectable',
          ).length;
          const selectedLinkable = filterCatalogOnlyHistoryIdsForLink({
            selectedRiskIds: [...selected],
            catalogIds,
            existingDirectRiskIds,
          }).linkableIds.length;
          const busy = linking || addingRunId === run.id;

          return (
            <Accordion key={run.id} disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography variant="body2">
                    {formatRunDate(run.createdAt)} · {run.model}
                    {run.userGuidancePresent ? ' · com orientação' : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {run.items.length === 0
                      ? '0 fatores'
                      : `${run.items.length} fator(es)`}
                    {run.createdBy?.name
                      ? ` · ${run.createdBy.name}`
                      : run.createdBy?.email
                        ? ` · ${run.createdBy.email}`
                        : ''}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {!run.items.length ? (
                  <Typography variant="body2" color="text.secondary">
                    Consulta concluída sem fatores sugeridos.
                  </Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {run.items.map((item) => {
                      const state = resolveCatalogOnlyHistoryItemLinkState({
                        item,
                        catalogIds,
                        existingDirectRiskIds,
                      });
                      const selectable = state === 'selectable';
                      const checked = selected.has(item.riskId);

                      return (
                        <Box key={`${run.id}-${item.riskId}`}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={(_, value) =>
                                  toggleItem(run.id, item.riskId, value)
                                }
                                disabled={
                                  !selectable ||
                                  busy ||
                                  !catalogReady
                                }
                              />
                            }
                            label={
                              <Box>
                                <Typography
                                  variant="caption"
                                  color={
                                    state === 'unavailable'
                                      ? 'error'
                                      : state === 'already_linked'
                                        ? 'text.secondary'
                                        : 'primary'
                                  }
                                  sx={{
                                    fontWeight: 600,
                                    display: 'block',
                                    mb: 0.25,
                                  }}
                                >
                                  {historyItemStatusLabel(state, item)}
                                </Typography>
                                <Typography variant="subtitle2">
                                  {item.name}
                                  {item.type ? ` · ${item.type}` : ''}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {item.explanation || 'Sem justificativa.'}
                                </Typography>
                              </Box>
                            }
                            sx={{ alignItems: 'flex-start', m: 0 }}
                          />
                        </Box>
                      );
                    })}

                    <Box>
                      <Button
                        size="small"
                        variant={
                          selectedLinkable > 0 ? 'contained' : 'outlined'
                        }
                        color="primary"
                        disabled={
                          busy ||
                          !catalogReady ||
                          selectedLinkable === 0 ||
                          selectableCount === 0
                        }
                        startIcon={
                          busy && addingRunId === run.id ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : undefined
                        }
                        onClick={() => void handleAddFromRun(run.id)}
                      >
                        Adicionar fatores selecionados
                        {selectedLinkable > 0
                          ? ` (${selectedLinkable})`
                          : ''}
                      </Button>
                    </Box>
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>

      {data && (data.hasNextPage || page > 1) && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1.5 }}
          justifyContent="flex-end"
        >
          <Button
            size="small"
            disabled={page <= 1 || historyQuery.isFetching || linking}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ alignSelf: 'center' }}
          >
            Página {data.page} · {data.total} consulta(s)
          </Typography>
          <Button
            size="small"
            disabled={!data.hasNextPage || historyQuery.isFetching || linking}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </Stack>
      )}
    </Box>
  );
}
