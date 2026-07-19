import { SText } from '@v2/components/atoms/SText/SText';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { searchChemicalRiskFactors } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  AiCurationEvidence,
  AiCurationSuggestion,
  ChemicalAiCurationDecision,
  ChemicalAiCurationPendingItem,
  ChemicalRiskOption,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useSnackbar } from 'notistack';

import { ChemicalCurationCreateRiskDialog } from './ChemicalCurationCreateRiskDialog';
import {
  buildChemicalCurationCreateRiskPrefill,
  buildManualFactorDecision,
  canCreateChemicalRiskPermission,
  shouldShowCreateChemicalRiskButton,
  type ChemicalCurationPendingManualFactor,
} from './chemical-curation-create-risk.util';
import {
  CURATION_QUEUE_PAGE_SIZE,
  catalogLinkStatusLabel,
  countAppliedCurationDecisions,
  displayOfficialName,
  filterCurationQueueItems,
  formatCurationElapsedMs,
  formatCurationProcessingLabel,
  getActiveCurationPendingItems,
  getActiveSelectionIds,
  humanizeCurationWarning,
  identityStatusLabel,
  initialCurationFilter,
  isAppliedCurationDecision,
  isBatchConfirmEligible,
  paginateCurationQueueItems,
  partitionPubChemEvidences,
  pruneSelectionToActiveQueue,
  resolveCurationQueueFilter,
  slimEvidencesForExport,
  type ChemicalAiCurationProgress,
  type CurationFilter,
} from './chemical-ai-curation-ui.util';

export type { CurationFilter } from './chemical-ai-curation-ui.util';

export { isBatchConfirmEligible } from './chemical-ai-curation-ui.util';

const PAGE_SIZE = CURATION_QUEUE_PAGE_SIZE;

function typeLabel(type: string) {
  switch (type) {
    case 'EXISTING_RISK_MATCH':
      return 'Vínculo com catálogo SimpleSST';
    case 'CHEMICAL_IDENTITY':
      return 'Identidade química (sem fator no catálogo)';
    case 'SPLIT_COMPONENT':
      return 'Divisão em substâncias';
    case 'INSUFFICIENT_EVIDENCE':
      return 'Evidência insuficiente';
    default:
      return type;
  }
}

function classificationLabel(value: string | null | undefined) {
  if (value === 'SINGLE_CHEMICAL') return 'Substância única';
  if (value === 'MULTIPLE_CHEMICALS') return 'Múltiplas substâncias';
  if (value === 'GENERIC_CLASS') return 'Classe / mistura genérica';
  if (value === 'INSUFFICIENT_TEXT') return 'Texto insuficiente';
  return value || '—';
}

function variantSourceLabel(source: string) {
  switch (source) {
    case 'ORIGINAL_CLEAN':
      return 'original';
    case 'NORMALIZED':
      return 'normalizado';
    case 'HYPHEN_NORMALIZED':
      return 'hífen';
    case 'COMMON_NAME':
      return 'nome usual';
    case 'IUPAC_NAME':
      return 'IUPAC';
    case 'CHEMICAL_TRANSLATION':
      return 'tradução';
    case 'SPELLING_CORRECTION':
      return 'ortografia';
    case 'TRADE_NAME_SECONDARY':
      return 'nome comercial (secundário)';
    case 'CATALOG_CLASS_HINT':
      return 'dica de classe (catálogo)';
    default:
      return source;
  }
}

function attemptOutcomeLabel(outcome: string) {
  switch (outcome) {
    case 'NO_CID':
      return 'sem CID';
    case 'CID_FOUND':
      return 'CID encontrado';
    case 'CAS_WITH_PROVENANCE':
      return 'CAS com procedência';
    case 'CAS_WITHOUT_PROVENANCE':
      return 'CAS sem procedência';
    case 'PROVIDER_ERROR':
      return 'falha da fonte';
    case 'SKIPPED':
      return 'consulta omitida';
    default:
      return outcome;
  }
}

function confidenceLabel(confidence: string | null | undefined) {
  if (confidence === 'HIGH') return 'Alta';
  if (confidence === 'MEDIUM') return 'Média';
  if (confidence === 'LOW') return 'Baixa';
  return confidence || '—';
}

type Props = {
  pendingItems: ChemicalAiCurationPendingItem[];
  suggestions: AiCurationSuggestion[];
  decisions: Record<string, ChemicalAiCurationDecision>;
  failures: Array<{ sourceRowId: string; message: string }>;
  busy: boolean;
  aiProgress?: ChemicalAiCurationProgress | null;
  companyId?: string;
  workspaceId?: string;
  onStartAi: (sourceRowIds?: string[]) => void;
  onRetryFailures?: () => void;
  onCancelAi?: () => void;
  onDecision: (decision: ChemicalAiCurationDecision) => void;
  onBatchConfirm: (sourceRowIds: string[]) => void;
  /** Bloqueia fechamento do modal pai enquanto o cadastro QUI está aberto. */
  onNestedDialogOpenChange?: (open: boolean) => void;
};

export const ChemicalExcelAiCurationPanel = ({
  pendingItems,
  suggestions,
  decisions,
  failures,
  busy,
  aiProgress = null,
  companyId,
  workspaceId,
  onStartAi,
  onRetryFailures,
  onCancelAi,
  onDecision,
  onBatchConfirm,
  onNestedDialogOpenChange,
}: Props) => {
  const { isAuthSuccess } = useAuthShow();
  const { enqueueSnackbar } = useSnackbar();
  const canCreateRisk = canCreateChemicalRiskPermission({ isAuthSuccess });
  const [selectedPending, setSelectedPending] = useState<
    Record<string, boolean>
  >({});
  const [selectedBatch, setSelectedBatch] = useState<Record<string, boolean>>(
    {},
  );
  const [filter, setFilter] = useState<CurationFilter>(initialCurationFilter);
  const [headerOpen, setHeaderOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedDetails, setExpandedDetails] = useState<
    Record<string, boolean>
  >({});
  const [splitEdits, setSplitEdits] = useState<
    Record<
      string,
      Array<{ officialName: string; cas: string; include: boolean }>
    >
  >({});
  const [searchByItem, setSearchByItem] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<
    Record<string, ChemicalRiskOption[]>
  >({});
  const [searchBusy, setSearchBusy] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [createRiskSession, setCreateRiskSession] = useState<{
    sourceRowId: string;
    initialData: ReturnType<typeof buildChemicalCurationCreateRiskPrefill>;
  } | null>(null);
  const createRiskSourceRowIdRef = useRef<string | null>(null);
  const [pendingManualFactorByItem, setPendingManualFactorByItem] = useState<
    Record<string, ChemicalCurationPendingManualFactor>
  >({});

  useEffect(() => {
    if (!busy || !aiProgress?.startedAt) {
      setElapsedMs(0);
      return;
    }
    const tick = () => setElapsedMs(Date.now() - aiProgress.startedAt);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [busy, aiProgress?.startedAt]);

  const processingLabel =
    busy && aiProgress
      ? formatCurationProcessingLabel({ progress: aiProgress, elapsedMs })
      : busy
        ? `Processando — ${formatCurationElapsedMs(elapsedMs)} — não feche esta janela`
        : null;

  // Progresso real só por itens já concluídos em sublotes; durante o 1º lote = indeterminado.
  const completedRatio =
    aiProgress && aiProgress.total > 0
      ? Math.min(100, Math.round((aiProgress.done / aiProgress.total) * 100))
      : 0;
  const showDeterminateProgress = Boolean(
    aiProgress && aiProgress.chunkTotal > 1 && aiProgress.done > 0,
  );

  const suggestionById = useMemo(() => {
    const map = new Map<string, AiCurationSuggestion>();
    suggestions.forEach((s) => map.set(s.sourceRowId, s));
    return map;
  }, [suggestions]);

  useEffect(() => {
    createRiskSourceRowIdRef.current = createRiskSession?.sourceRowId ?? null;
    onNestedDialogOpenChange?.(Boolean(createRiskSession));
  }, [createRiskSession, onNestedDialogOpenChange]);

  const openCreateRiskDialog = (sourceRowId: string) => {
    if (!companyId) return;
    const pending = pendingItems.find((item) => item.sourceRowId === sourceRowId);
    if (!pending) return;
    setCreateRiskSession({
      sourceRowId,
      initialData: buildChemicalCurationCreateRiskPrefill({
        companyId,
        pending,
        suggestion: suggestionById.get(sourceRowId) || null,
      }),
    });
  };

  const closeCreateRiskDialog = () => {
    setCreateRiskSession(null);
  };

  const activePendingItems = useMemo(
    () =>
      getActiveCurationPendingItems({
        pendingItems,
        decisions,
      }),
    [pendingItems, decisions],
  );

  const activeSuggestionCount = useMemo(
    () =>
      activePendingItems.filter((item) =>
        suggestionById.has(item.sourceRowId),
      ).length,
    [activePendingItems, suggestionById],
  );

  const activeAwaitingCount = Math.max(
    0,
    activePendingItems.length - activeSuggestionCount,
  );

  const appliedDecisionCount = useMemo(
    () => countAppliedCurationDecisions(decisions),
    [decisions],
  );

  const prevActiveSuggestionCountRef = useRef(0);

  // Ao receber a primeira rodada (ou um novo lote) de sugestões na fila ativa → Processados.
  useEffect(() => {
    if (activeSuggestionCount > prevActiveSuggestionCountRef.current) {
      setFilter('PROCESSED');
      setPage(1);
    }
    prevActiveSuggestionCountRef.current = activeSuggestionCount;
  }, [activeSuggestionCount]);

  // Se Processados ficou vazio mas ainda há aguardando → volta para Aguardando.
  useEffect(() => {
    if (
      filter === 'PROCESSED' &&
      activeSuggestionCount === 0 &&
      activeAwaitingCount > 0
    ) {
      setFilter('AWAITING');
      setPage(1);
    }
    if (activePendingItems.length === 0 && suggestions.length === 0) {
      setFilter(initialCurationFilter());
    }
  }, [
    filter,
    activeSuggestionCount,
    activeAwaitingCount,
    activePendingItems.length,
    suggestions.length,
  ]);

  const effectiveFilter = useMemo(
    () =>
      resolveCurationQueueFilter({
        filter,
        suggestionsCount: activeSuggestionCount,
      }),
    [filter, activeSuggestionCount],
  );

  const confCounts = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0, INSUFFICIENT: 0 };
    for (const item of activePendingItems) {
      const s = suggestionById.get(item.sourceRowId);
      if (!s) continue;
      if (s.confidence === 'HIGH') counts.HIGH += 1;
      if (s.confidence === 'MEDIUM') counts.MEDIUM += 1;
      if (s.confidence === 'LOW') counts.LOW += 1;
      if (s.type === 'INSUFFICIENT_EVIDENCE') counts.INSUFFICIENT += 1;
    }
    return counts;
  }, [activePendingItems, suggestionById]);

  const statusCounts = useMemo(() => {
    const counts = {
      NO_MATCH: 0,
      REVIEW_REQUIRED: 0,
      INVALID_CAS: 0,
      EXISTING: 0,
      IDENTITY: 0,
      SPLIT: 0,
    };
    activePendingItems.forEach((item) => {
      if (item.matchStatus === 'NO_MATCH') counts.NO_MATCH += 1;
      if (item.matchStatus === 'REVIEW_REQUIRED') counts.REVIEW_REQUIRED += 1;
      if (item.matchStatus === 'INVALID_CAS') counts.INVALID_CAS += 1;
      const s = suggestionById.get(item.sourceRowId);
      if (s?.type === 'EXISTING_RISK_MATCH') counts.EXISTING += 1;
      if (s?.type === 'CHEMICAL_IDENTITY') counts.IDENTITY += 1;
      if (s?.type === 'SPLIT_COMPONENT') counts.SPLIT += 1;
    });
    return counts;
  }, [activePendingItems, suggestionById]);

  const batchEligibleIds = useMemo(
    () =>
      suggestions
        .filter(isBatchConfirmEligible)
        .filter((s) => !isAppliedCurationDecision(decisions[s.sourceRowId]))
        .map((s) => s.sourceRowId),
    [suggestions, decisions],
  );

  const filteredItems = useMemo(
    () =>
      filterCurationQueueItems({
        pendingItems,
        suggestionsById: suggestionById,
        decisions,
        filter: effectiveFilter,
      }),
    [pendingItems, suggestionById, decisions, effectiveFilter],
  );

  const { pageItems, pageCount, safePage } = useMemo(
    () =>
      paginateCurationQueueItems({
        items: filteredItems,
        page,
        pageSize: PAGE_SIZE,
      }),
    [filteredItems, page],
  );

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  // Decisões aplicadas saem da seleção ativa da rodada (não somam no botão).
  useEffect(() => {
    setSelectedPending((prev) =>
      pruneSelectionToActiveQueue({
        selection: prev,
        activePendingItems,
      }),
    );
    setSelectedBatch((prev) =>
      pruneSelectionToActiveQueue({
        selection: prev,
        activePendingItems,
      }),
    );
  }, [activePendingItems, decisions]);

  const selectedPendingIds = getActiveSelectionIds({
    selection: selectedPending,
    activePendingItems,
  });
  const selectedBatchIds = getActiveSelectionIds({
    selection: selectedBatch,
    activePendingItems,
  });

  const awaiting = activeAwaitingCount;
  const confirmedCount = appliedDecisionCount;
  // Analisadas na fila ativa ainda sem decisão aplicada.
  const analyzedWithoutDecision = activePendingItems.filter((item) =>
    suggestionById.has(item.sourceRowId),
  ).length;

  const selectAllVisible = (checked: boolean) => {
    if (!activeSuggestionCount) {
      setSelectedPending((prev) => {
        const next = { ...prev };
        pageItems.forEach((item) => {
          next[item.sourceRowId] = checked;
        });
        return next;
      });
      return;
    }
    setSelectedBatch((prev) => {
      const next = { ...prev };
      pageItems.forEach((item) => {
        const suggestion = suggestionById.get(item.sourceRowId);
        if (
          suggestion &&
          isBatchConfirmEligible(suggestion) &&
          !isAppliedCurationDecision(decisions[item.sourceRowId])
        ) {
          next[item.sourceRowId] = checked;
        }
      });
      return next;
    });
  };

  const selectByCurrentFilter = () => {
    if (!activeSuggestionCount) {
      const next: Record<string, boolean> = {};
      filteredItems.forEach((item) => {
        next[item.sourceRowId] = true;
      });
      setSelectedPending(next);
      return;
    }
    const next: Record<string, boolean> = {};
    filteredItems.forEach((item) => {
      const suggestion = suggestionById.get(item.sourceRowId);
      if (
        suggestion &&
        isBatchConfirmEligible(suggestion) &&
        !isAppliedCurationDecision(decisions[item.sourceRowId])
      ) {
        next[item.sourceRowId] = true;
      }
    });
    setSelectedBatch(next);
  };

  const clearSelection = () => {
    setSelectedPending({});
    setSelectedBatch({});
  };

  const handleSearchFactor = async (sourceRowId: string) => {
    if (!companyId || !workspaceId) return;
    const query = (searchByItem[sourceRowId] || '').trim();
    if (query.length < 2) return;
    setSearchBusy(sourceRowId);
    try {
      const rows = await searchChemicalRiskFactors({
        companyId,
        workspaceId,
        search: query,
      });
      setSearchResults((prev) => ({
        ...prev,
        [sourceRowId]: rows.slice(0, 8),
      }));
    } catch {
      setSearchResults((prev) => ({ ...prev, [sourceRowId]: [] }));
    } finally {
      setSearchBusy(null);
    }
  };

  const selectionCount = activeSuggestionCount
    ? selectedBatchIds.length
    : selectedPendingIds.length;

  const handleDecisionAndDeselect = (decision: ChemicalAiCurationDecision) => {
    setSelectedPending((prev) => {
      if (!prev[decision.sourceRowId]) return prev;
      const next = { ...prev };
      delete next[decision.sourceRowId];
      return next;
    });
    setSelectedBatch((prev) => {
      if (!prev[decision.sourceRowId]) return prev;
      const next = { ...prev };
      delete next[decision.sourceRowId];
      return next;
    });
    setPendingManualFactorByItem((prev) => {
      if (!prev[decision.sourceRowId]) return prev;
      const next = { ...prev };
      delete next[decision.sourceRowId];
      return next;
    });
    onDecision(decision);
  };

  const setPendingManualFactor = (
    sourceRowId: string,
    factor: ChemicalCurationPendingManualFactor,
    options?: { fromCurationCreate?: boolean },
  ) => {
    setPendingManualFactorByItem((prev) => ({
      ...prev,
      [sourceRowId]: factor,
    }));
    setSearchResults((prev) => ({ ...prev, [sourceRowId]: [] }));
    setSearchByItem((prev) => ({ ...prev, [sourceRowId]: '' }));
    if (options?.fromCurationCreate) {
      enqueueSnackbar(
        'Fator químico criado com sucesso. O vínculo foi preparado e aguarda sua confirmação.',
        { variant: 'success' },
      );
    }
  };

  const clearPendingManualFactor = (sourceRowId: string) => {
    setPendingManualFactorByItem((prev) => {
      if (!prev[sourceRowId]) return prev;
      const next = { ...prev };
      delete next[sourceRowId];
      return next;
    });
  };

  const confirmPendingManualFactor = (sourceRowId: string) => {
    const pendingFactor = pendingManualFactorByItem[sourceRowId];
    if (!pendingFactor) return;
    const suggestion = suggestionById.get(sourceRowId);
    handleDecisionAndDeselect(
      buildManualFactorDecision({
        sourceRowId,
        createdRisk: {
          id: pendingFactor.riskFactorId,
          name: pendingFactor.officialName,
          cas: pendingFactor.cas,
        },
        confirmedCas: pendingFactor.cas,
        suggestionType: suggestion?.type || null,
        confidence: suggestion?.confidence || null,
      }),
    );
  };

  const applyCreatedRiskToCuration = (
    sourceRowId: string,
    created: IRiskFactors | ChemicalRiskOption,
    confirmedCas?: string | null,
    options?: { fromCurationCreate?: boolean },
  ) => {
    setPendingManualFactor(
      sourceRowId,
      {
        riskFactorId: created.id,
        officialName: created.name,
        cas: created.cas ?? confirmedCas ?? null,
      },
      options,
    );
    closeCreateRiskDialog();
  };

  return (
    <Stack spacing={2}>
      <Accordion
        expanded={headerOpen}
        onChange={(_, open) => setHeaderOpen(open)}
        disableGutters
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack spacing={0.25}>
            <SText fontWeight={700} fontSize={18}>
              Fila de Curadoria Assistida por IA
            </SText>
            <SText fontSize={12} color="text.secondary">
              {activePendingItems.length} restantes na fila ativa ·{' '}
              {confirmedCount} decisões aplicadas · {selectionCount}{' '}
              selecionados nesta rodada
              {analyzedWithoutDecision
                ? ` · ${analyzedWithoutDecision} analisadas sem decisão`
                : ''}
            </SText>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <SText fontSize={13} color="text.secondary" mb={1}>
            Itens com decisão aplicada saem da fila ativa desta preparação. CAS
            preferencial só aparece se confirmado por fonte externa. Números de
            registro (xrefs/RN) ficam recolhidos e não são tratados como CAS
            oficial.
          </SText>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              color="warning"
              label={`Fila ativa restante: ${activePendingItems.length}`}
            />
            <Chip
              color="success"
              label={`Decisões aplicadas: ${confirmedCount}`}
            />
            <Chip
              color="info"
              label={`Seleção desta rodada: ${selectionCount}`}
            />
            <Chip
              label={`Analisadas sem decisão: ${analyzedWithoutDecision}`}
            />
            <Chip label={`Aguardando análise: ${awaiting}`} />
            <Chip label={`Falhas: ${failures.length}`} />
            <Chip color="success" label={`Alta: ${confCounts.HIGH}`} />
            <Chip color="warning" label={`Média: ${confCounts.MEDIUM}`} />
            <Chip label={`Baixa: ${confCounts.LOW}`} />
            <Chip
              label={`Evidência insuficiente: ${confCounts.INSUFFICIENT}`}
            />
            <Chip label={`Sem correspondência: ${statusCounts.NO_MATCH}`} />
            <Chip
              label={`Revisão necessária: ${statusCounts.REVIEW_REQUIRED}`}
            />
            <Chip label={`CAS inválido: ${statusCounts.INVALID_CAS}`} />
            <Chip label={`Catálogo SimpleSST: ${statusCounts.EXISTING}`} />
            <Chip label={`Identidade química: ${statusCounts.IDENTITY}`} />
            <Chip label={`Divisão: ${statusCounts.SPLIT}`} />
            <Chip
              color="success"
              label={`Elegíveis ao lote: ${batchEligibleIds.length}`}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {busy || processingLabel ? (
        <Alert
          severity="warning"
          icon={<CircularProgress size={18} color="inherit" />}
          action={
            onCancelAi && aiProgress && aiProgress.chunkTotal > 1 ? (
              <Button color="inherit" size="small" onClick={onCancelAi}>
                Cancelar próximos lotes
              </Button>
            ) : undefined
          }
        >
          <Stack spacing={1}>
            <SText fontSize={13} fontWeight={600}>
              {processingLabel ||
                'Processando curadoria assistida — não feche esta janela'}
            </SText>
            <LinearProgress
              variant={showDeterminateProgress ? 'determinate' : 'indeterminate'}
              value={showDeterminateProgress ? completedRatio : undefined}
            />
            {aiProgress ? (
              <SText fontSize={12} color="text.secondary">
                Sublote {Math.max(1, aiProgress.currentChunk)}/
                {aiProgress.chunkTotal}
                {aiProgress.done
                  ? ` · ${aiProgress.done}/${aiProgress.total} itens concluídos neste envio`
                  : ` · ${aiProgress.total} itens neste envio`}
                {aiProgress.cancelled
                  ? ' · cancelamento solicitado (resultados já recebidos preservados)'
                  : ''}
              </SText>
            ) : null}
          </Stack>
        </Alert>
      ) : null}

      {failures.length && !busy ? (
        <Alert
          severity="error"
          action={
            onRetryFailures ? (
              <Button color="inherit" size="small" onClick={onRetryFailures}>
                Tentar novamente
              </Button>
            ) : undefined
          }
        >
          Falha em {failures.length} item(ns). Decisões já aplicadas foram
          preservadas. Você pode tentar novamente só as falhas.
        </Alert>
      ) : null}

      {!activeSuggestionCount ? (
        <>
          <Alert severity="info">
            Selecione uma amostra (recomendado: até 20 itens por rodada) ou
            deixe sem seleção para processar toda a fila ativa restante.
            Processamento em lotes de até 12. Após confirmar, volte ao resumo e
            continue pelos restantes.
          </Alert>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            flexWrap="wrap"
            useFlexGap
          >
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Filtro</InputLabel>
              <Select
                label="Filtro"
                value={effectiveFilter}
                onChange={(e) => {
                  setFilter(e.target.value as CurationFilter);
                  setPage(1);
                }}
              >
                <MenuItem value="AWAITING">Aguardando</MenuItem>
                <MenuItem value="ALL">Todos da fila ativa</MenuItem>
                <MenuItem value="NO_MATCH">Sem correspondência</MenuItem>
                <MenuItem value="REVIEW_REQUIRED">Revisão necessária</MenuItem>
                <MenuItem value="INVALID_CAS">CAS inválido</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" onClick={() => selectAllVisible(true)}>
              Selecionar todos os visíveis
            </Button>
            <Button size="small" onClick={selectByCurrentFilter}>
              Selecionar por filtro
            </Button>
            <Button size="small" onClick={clearSelection}>
              Limpar seleção
            </Button>
            <Chip
              size="small"
              label={`${selectedPendingIds.length} selecionados nesta rodada`}
            />
            <Chip size="small" label={`${filteredItems.length} na lista`} />
          </Stack>
          <Stack spacing={1}>
            {pageItems.map((item) => (
              <Box
                key={item.sourceRowId}
                sx={{
                  width: '100%',
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(selectedPending[item.sourceRowId])}
                      onChange={(e) =>
                        setSelectedPending((prev) => ({
                          ...prev,
                          [item.sourceRowId]: e.target.checked,
                        }))
                      }
                    />
                  }
                  label={
                    <Stack spacing={0.25}>
                      <SText fontSize={13} fontWeight={600}>
                        L{item.sourceRow}: {item.tradeName}
                      </SText>
                      <SText fontSize={12}>
                        {item.componentOriginal} · {item.matchStatus}
                      </SText>
                    </Stack>
                  }
                />
              </Box>
            ))}
            {!activePendingItems.length ? (
              <Alert severity="success">
                Fila ativa vazia nesta preparação. Volte ao resumo para baixar a
                planilha preparada.
              </Alert>
            ) : null}
            {activePendingItems.length && !filteredItems.length ? (
              <Alert severity="info">
                Nenhum item neste filtro. Troque para &quot;Aguardando&quot; ou
                &quot;Todos da fila ativa&quot;.
              </Alert>
            ) : null}
          </Stack>
          {pageCount > 1 ? (
            <Pagination
              count={pageCount}
              page={safePage}
              onChange={(_, p) => setPage(p)}
              size="small"
            />
          ) : null}
          <Button
            variant="contained"
            color="warning"
            disabled={busy}
            startIcon={
              busy ? <CircularProgress size={16} color="inherit" /> : undefined
            }
            onClick={() =>
              onStartAi(
                selectedPendingIds.length ? selectedPendingIds : undefined,
              )
            }
          >
            {busy
              ? processingLabel || 'Processando…'
              : selectedPendingIds.length
                ? `Iniciar curadoria assistida — ${selectedPendingIds.length} itens`
                : `Iniciar curadoria assistida — fila ativa (${activePendingItems.length})`}
          </Button>
        </>
      ) : (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            flexWrap="wrap"
            useFlexGap
          >
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Filtro</InputLabel>
              <Select
                label="Filtro"
                value={effectiveFilter}
                onChange={(e) => {
                  setFilter(e.target.value as CurationFilter);
                  setPage(1);
                }}
              >
                <MenuItem value="PROCESSED">Processados nesta rodada</MenuItem>
                <MenuItem value="AWAITING">Aguardando</MenuItem>
                <MenuItem value="ALL">Todos da fila ativa</MenuItem>
                <MenuItem value="NO_MATCH">Sem correspondência</MenuItem>
                <MenuItem value="REVIEW_REQUIRED">Revisão necessária</MenuItem>
                <MenuItem value="INVALID_CAS">CAS inválido</MenuItem>
                <MenuItem value="HIGH">Confiança alta</MenuItem>
                <MenuItem value="MEDIUM">Confiança média</MenuItem>
                <MenuItem value="LOW">Confiança baixa</MenuItem>
                <MenuItem value="INSUFFICIENT">Evidência insuficiente</MenuItem>
                <MenuItem value="EXISTING">Catálogo SimpleSST</MenuItem>
                <MenuItem value="IDENTITY">Identidade química</MenuItem>
                <MenuItem value="SPLIT">Divisão</MenuItem>
                <MenuItem value="REJECTED">Rejeitadas (histórico)</MenuItem>
                <MenuItem value="CONFIRMED">Decisões aplicadas (histórico)</MenuItem>
                <MenuItem value="PENDING">Pendentes de decisão</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" onClick={() => selectAllVisible(true)}>
              Selecionar todos os visíveis
            </Button>
            <Button size="small" onClick={selectByCurrentFilter}>
              Selecionar por filtro
            </Button>
            <Button size="small" onClick={clearSelection}>
              Limpar seleção
            </Button>
            <Chip
              size="small"
              label={`${selectedBatchIds.length} selecionados nesta rodada`}
            />
          </Stack>

          {batchEligibleIds.length ? (
            <Alert severity="success">
              {batchEligibleIds.length} item(ns) com identidade alta e CAS
              confirmado pela fonte. Confiança média/baixa e CAS não confirmado
              ficam fora do lote.
            </Alert>
          ) : null}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant="contained"
              disabled={busy || !selectedBatchIds.length}
              onClick={() => onBatchConfirm(selectedBatchIds)}
            >
              Confirmar selecionados ({selectedBatchIds.length})
            </Button>
            <Button
              size="small"
              disabled={busy}
              startIcon={
                busy ? <CircularProgress size={14} color="inherit" /> : undefined
              }
              onClick={() => onStartAi(undefined)}
            >
              {busy ? 'Processando…' : 'Nova análise (todos)'}
            </Button>
            {failures.length && onRetryFailures ? (
              <Button
                size="small"
                color="warning"
                disabled={busy}
                onClick={onRetryFailures}
              >
                Tentar novamente falhas ({failures.length})
              </Button>
            ) : null}
          </Stack>

          <Stack spacing={2}>
            {pageItems.map((item) => {
              const suggestion = suggestionById.get(item.sourceRowId);
              const decision = decisions[item.sourceRowId];
              const batchOk = suggestion && isBatchConfirmEligible(suggestion);
              const top = suggestion?.candidates?.[0];
              const pubchemParts = partitionPubChemEvidences(
                top?.evidences || [],
              );
              const internalEvidences = (top?.evidences || []).filter(
                (e) => e.sourceType === 'INTERNAL_CATALOG',
              );
              const aiEvidences = (top?.evidences || []).filter(
                (e) => e.sourceType === 'AI_REASONING',
              );
              const diagnostics = suggestion?.diagnostics;
              const detailsOpen = Boolean(expandedDetails[item.sourceRowId]);
              const splits =
                splitEdits[item.sourceRowId] ||
                (suggestion?.splitCandidates || []).map((c) => ({
                  officialName: c.officialName || '',
                  cas: c.cas || '',
                  include: true,
                }));
              const failure = failures.find(
                (f) => f.sourceRowId === item.sourceRowId,
              );
              const preferredCas =
                item.externalIdentity?.preferredCas ||
                pubchemParts.confirmedCas[0]?.value ||
                top?.cas ||
                null;
              const hasConfirmedCas = pubchemParts.confirmedCas.length > 0;
              const classWarning =
                (item.externalIdentity?.classMatchWarnings || []).length > 0 ||
                (top?.warnings || []).some((w) =>
                  /fator interno mais amplo|classe|agrupamento/i.test(w),
                );
              const pendingManualFactor =
                pendingManualFactorByItem[item.sourceRowId] || null;

              return (
                <Box
                  key={item.sourceRowId}
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: 1,
                    bgcolor: decision ? 'action.hover' : 'background.paper',
                    border: '2px solid',
                    borderColor: 'grey.400',
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                      justifyContent="space-between"
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        flex={1}
                      >
                        {batchOk && !decision ? (
                          <Checkbox
                            size="small"
                            checked={Boolean(selectedBatch[item.sourceRowId])}
                            onChange={(e) =>
                              setSelectedBatch((prev) => ({
                                ...prev,
                                [item.sourceRowId]: e.target.checked,
                              }))
                            }
                          />
                        ) : null}
                        <Box flex={1}>
                          <SText fontSize={12} color="text.secondary">
                            Nome comercial do produto
                          </SText>
                          <SText fontWeight={700} fontSize={15}>
                            {item.tradeName}
                          </SText>
                          <SText fontSize={12} color="text.secondary" mt={0.5}>
                            Fabricante
                          </SText>
                          <SText fontSize={13}>
                            {item.manufacturer || '—'}
                          </SText>
                          <SText fontSize={12} color="text.secondary" mt={0.5}>
                            Texto químico analisado
                          </SText>
                          <SText fontSize={13}>
                            <strong>{item.componentOriginal}</strong>
                          </SText>
                          <Chip
                            size="small"
                            sx={{ mt: 0.75 }}
                            color="info"
                            variant="outlined"
                            label={`Pesquisa realizada com: ${
                              item.chemicalQueryText ||
                              item.externalIdentity?.chemicalQueryText ||
                              item.componentOriginal
                            }`}
                          />
                          {(item.textClassification ||
                            item.externalIdentity?.classification) && (
                            <Chip
                              size="small"
                              sx={{ mt: 0.75, ml: 0.5 }}
                              label={
                                item.textClassification ||
                                item.externalIdentity?.classification
                              }
                            />
                          )}
                          <SText fontSize={12} color="text.secondary" mt={0.5}>
                            Aba {item.sourceSheet} · Linha {item.sourceRow} ·{' '}
                            {item.matchStatus}
                          </SText>
                        </Box>
                      </Stack>
                      {suggestion ? (
                        <Stack
                          direction="row"
                          spacing={0.75}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Chip
                            size="small"
                            label={typeLabel(suggestion.type)}
                          />
                          <Chip
                            size="small"
                            color={
                              suggestion.confidence === 'HIGH'
                                ? 'success'
                                : suggestion.confidence === 'MEDIUM'
                                  ? 'warning'
                                  : 'default'
                            }
                            label={confidenceLabel(suggestion.confidence)}
                          />
                        </Stack>
                      ) : null}
                    </Stack>

                    {failure ? (
                      <Alert severity="warning" sx={{ py: 0 }}>
                        Falha: {failure.message}
                      </Alert>
                    ) : null}

                    {suggestion ? (
                      <>
                        <SText fontSize={13}>
                          {humanizeCurationWarning(suggestion.rationale)}
                        </SText>
                        <Stack spacing={1}>
                          <Box>
                            <SText fontSize={12} fontWeight={600} mb={0.5}>
                              Identidade química
                            </SText>
                            <SText fontSize={11} color="text.secondary" mb={0.5}>
                              Substância reconhecida por fontes externas (ex.:
                              PubChem). Independente do vínculo com o catálogo.
                            </SText>
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              <Chip
                                size="small"
                                color={
                                  suggestion.identityStatus === 'confirmed'
                                    ? 'success'
                                    : suggestion.identityStatus === 'probable'
                                      ? 'warning'
                                      : 'default'
                                }
                                label={identityStatusLabel(
                                  suggestion.identityStatus,
                                )}
                              />
                              {hasConfirmedCas && preferredCas ? (
                                <Chip
                                  size="small"
                                  color="success"
                                  label={`CAS: ${preferredCas}`}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  color="warning"
                                  label="CAS não confirmado"
                                />
                              )}
                              {displayOfficialName(top?.officialName) ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Nome oficial: ${displayOfficialName(top?.officialName)}`}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label="Nome oficial não informado"
                                />
                              )}
                              {suggestion.identityConfidence ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Confiança: ${confidenceLabel(suggestion.identityConfidence)}`}
                                />
                              ) : null}
                              {suggestion.identityCacheHit ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label="Identidade reaproveitada nesta execução"
                                />
                              ) : null}
                            </Stack>
                          </Box>
                          <Box>
                            <SText fontSize={12} fontWeight={600} mb={0.5}>
                              Catálogo SimpleSST
                            </SText>
                            <SText fontSize={11} color="text.secondary" mb={0.5}>
                              Vínculo com fator interno do sistema. Pode existir
                              identidade química sem fator correspondente.
                            </SText>
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              <Chip
                                size="small"
                                color={
                                  suggestion.catalogLinkStatus === 'exact'
                                    ? 'success'
                                    : suggestion.catalogLinkStatus === 'class'
                                      ? 'warning'
                                      : 'default'
                                }
                                label={catalogLinkStatusLabel(
                                  suggestion.catalogLinkStatus,
                                )}
                              />
                              {top?.riskFactorId &&
                              (displayOfficialName(top.officialName) ||
                                item.deterministicCandidates.find(
                                  (c) => c.riskFactorId === top.riskFactorId,
                                )?.riskFactorName) ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Fator: ${
                                    displayOfficialName(top.officialName) ||
                                    item.deterministicCandidates.find(
                                      (c) =>
                                        c.riskFactorId === top.riskFactorId,
                                    )?.riskFactorName
                                  }`}
                                />
                              ) : null}
                              {suggestion.catalogLinkConfidence ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Vínculo: ${confidenceLabel(suggestion.catalogLinkConfidence)}`}
                                />
                              ) : null}
                              {classWarning ? (
                                <Chip
                                  size="small"
                                  color="warning"
                                  label="Fator interno mais amplo"
                                />
                              ) : null}
                            </Stack>
                          </Box>
                        </Stack>

                        {top?.warnings?.length ? (
                          <Alert severity="warning" sx={{ py: 0 }}>
                            {top.warnings
                              .map(humanizeCurationWarning)
                              .filter(Boolean)
                              .join(' · ')}
                          </Alert>
                        ) : null}

                        <Button
                          size="small"
                          onClick={() =>
                            setExpandedDetails((prev) => ({
                              ...prev,
                              [item.sourceRowId]: !detailsOpen,
                            }))
                          }
                        >
                          {detailsOpen
                            ? 'Ocultar detalhes'
                            : 'Ver detalhes / evidências'}
                        </Button>

                        <Collapse in={detailsOpen}>
                          <Stack spacing={1}>
                            {diagnostics ? (
                              <Box
                                sx={{
                                  p: 1.25,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                }}
                              >
                                <SText fontSize={12} fontWeight={600}>
                                  Diagnóstico da identificação
                                </SText>
                                <SText fontSize={11} color="text.secondary">
                                  Texto / query principal:{' '}
                                  {diagnostics.query || 'não informado'}
                                </SText>
                                <SText fontSize={11} color="text.secondary">
                                  Classificação:{' '}
                                  {classificationLabel(diagnostics.classification)}{' '}
                                  · Resultado: {diagnostics.finalReason}
                                </SText>
                                <SText fontSize={11} color="text.secondary">
                                  Variantes:{' '}
                                  {diagnostics.variants.length
                                    ? diagnostics.variants
                                        .map(
                                          (variant) =>
                                            `${variant.value} (${variantSourceLabel(variant.source)})`,
                                        )
                                        .join(' · ')
                                    : 'nenhuma'}
                                </SText>
                                {diagnostics.secondaryTradeHypothesis ? (
                                  <SText fontSize={11} color="text.secondary">
                                    Hipótese pelo nome comercial:{' '}
                                    {diagnostics.secondaryTradeHypothesis
                                      .cleanedTradeName || '—'}{' '}
                                    (
                                    {diagnostics.secondaryTradeHypothesis.accepted
                                      ? 'aceita como secundária'
                                      : 'ignorada'}
                                    ) —{' '}
                                    {diagnostics.secondaryTradeHypothesis.reason}
                                  </SText>
                                ) : null}
                                <Stack spacing={0.25} mt={0.5}>
                                  {diagnostics.attempts.length ? (
                                    diagnostics.attempts.map(
                                      (attempt, index) => (
                                        <SText
                                          key={`${attempt.query}-${index}`}
                                          fontSize={11}
                                          color="text.secondary"
                                        >
                                          Tentativa: {attempt.query} ·{' '}
                                          {attemptOutcomeLabel(attempt.outcome)}
                                          {attempt.cids.length
                                            ? ` · CID ${attempt.cids.slice(0, 3).join(', ')}`
                                            : ''}
                                          {attempt.preferredCas
                                            ? ` · CAS preferencial ${attempt.preferredCas}`
                                            : ''}
                                          {attempt.reason
                                            ? ` — ${humanizeCurationWarning(attempt.reason)}`
                                            : ''}
                                        </SText>
                                      ),
                                    )
                                  ) : (
                                    <SText fontSize={11} color="text.secondary">
                                      Fonte externa não consultada (classe,
                                      insuficiente ou cache).
                                    </SText>
                                  )}
                                </Stack>
                                {diagnostics.internalMatches?.length ? (
                                  <Stack spacing={0.25} mt={0.5}>
                                    {diagnostics.internalMatches.map(
                                      (match, index) => (
                                        <SText
                                          key={`${match.riskFactorName}-${index}`}
                                          fontSize={11}
                                          color="text.secondary"
                                        >
                                          {match.matchKind === 'exact'
                                            ? 'Fator exato'
                                            : 'Fator mais amplo'}
                                          {' · '}
                                          {match.matchedBy === 'cas'
                                            ? 'CAS'
                                            : match.matchedBy === 'synonym'
                                              ? 'sinônimo'
                                              : 'nome'}
                                          : {match.riskFactorName}
                                        </SText>
                                      ),
                                    )}
                                  </Stack>
                                ) : (
                                  <SText fontSize={11} color="text.secondary">
                                    Nenhum fator correspondente no catálogo
                                    SimpleSST.
                                  </SText>
                                )}
                                {diagnostics.candidateDiscards.map(
                                  (discard, index) => (
                                    <SText
                                      key={`${discard.candidate}-${index}`}
                                      fontSize={11}
                                      color="warning.main"
                                    >
                                      Candidato descartado: {discard.candidate}
                                      {discard.reason
                                        ? ` — ${humanizeCurationWarning(discard.reason)}`
                                        : ''}
                                    </SText>
                                  ),
                                )}
                              </Box>
                            ) : null}
                            <EvidenceSection
                              title="CAS confirmado pela fonte"
                              evidences={pubchemParts.confirmedCas}
                              empty="CAS não confirmado — sem procedência suficiente na fonte externa."
                            />
                            <Accordion disableGutters>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <SText fontSize={12} fontWeight={600}>
                                  Outros números de registro (
                                  {pubchemParts.registryNumbers.length ||
                                    item.externalIdentity?.registryNumbers
                                      ?.length ||
                                    0}
                                  )
                                </SText>
                              </AccordionSummary>
                              <AccordionDetails>
                                {pubchemParts.registryNumbers.length
                                  ? pubchemParts.registryNumbers.map(
                                      (ev, idx) => (
                                        <SText
                                          key={idx}
                                          fontSize={11}
                                          color="text.secondary"
                                        >
                                          {ev.value}
                                          {ev.excerpt ? ` · ${ev.excerpt}` : ''}
                                        </SText>
                                      ),
                                    )
                                  : (
                                      item.externalIdentity?.registryNumbers ||
                                      []
                                    ).map((rn, idx) => (
                                      <SText
                                        key={idx}
                                        fontSize={11}
                                        color="text.secondary"
                                      >
                                        {rn.value} ·{' '}
                                        {rn.sourceName || rn.source}
                                      </SText>
                                    ))}
                                {!pubchemParts.registryNumbers.length &&
                                !(item.externalIdentity?.registryNumbers || [])
                                  .length ? (
                                  <SText fontSize={11} color="text.secondary">
                                    Nenhum outro número de registro.
                                  </SText>
                                ) : null}
                              </AccordionDetails>
                            </Accordion>

                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                  xs: '1fr',
                                  md: '1fr 1fr',
                                },
                                gap: 1,
                              }}
                            >
                              <EvidenceSection
                                title="Evidências internas (catálogo)"
                                evidences={internalEvidences}
                                empty="Sem evidência interna."
                              />
                              <EvidenceSection
                                title="Identidade química (CID / nome / fórmula)"
                                evidences={pubchemParts.other}
                                empty="Sem metadados PubChem adicionais."
                              />
                            </Box>

                            {aiEvidences.length || suggestion.rationale ? (
                              <EvidenceSection
                                title="Inferência da IA"
                                evidences={
                                  aiEvidences.length
                                    ? aiEvidences
                                    : [
                                        {
                                          sourceType: 'AI_REASONING',
                                          sourceName: 'IA',
                                          field: 'rationale',
                                          value: suggestion.rationale,
                                        },
                                      ]
                                }
                                empty=""
                              />
                            ) : null}

                            {item.deterministicCandidates.length ? (
                              <SText fontSize={11} color="text.secondary">
                                Candidatos internos:{' '}
                                {item.deterministicCandidates
                                  .slice(0, 6)
                                  .map(
                                    (c) =>
                                      `${c.riskFactorName}${
                                        c.officialCas
                                          ? ` [${c.officialCas}]`
                                          : ''
                                      }`,
                                  )
                                  .join(' | ')}
                              </SText>
                            ) : null}
                          </Stack>
                        </Collapse>
                      </>
                    ) : (
                      <SText fontSize={12} color="text.secondary">
                        Sem sugestão IA ainda.
                      </SText>
                    )}

                    {decision ? (
                      <Chip
                        size="small"
                        color="success"
                        label={`Decisão humana: ${decision.action}`}
                      />
                    ) : null}

                    {suggestion?.type === 'SPLIT_COMPONENT' && !decision ? (
                      <Stack spacing={0.75}>
                        <Alert severity="info" sx={{ py: 0 }}>
                          Cada parte tem identidade/CAS isolados. Concentração
                          da mistura não será repartida.
                        </Alert>
                        {splits.map((part, idx) => (
                          <Stack
                            key={idx}
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            alignItems={{ sm: 'center' }}
                          >
                            <Checkbox
                              size="small"
                              checked={part.include}
                              onChange={(e) => {
                                const next = [...splits];
                                next[idx] = {
                                  ...part,
                                  include: e.target.checked,
                                };
                                setSplitEdits((prev) => ({
                                  ...prev,
                                  [item.sourceRowId]: next,
                                }));
                              }}
                            />
                            <TextField
                              size="small"
                              fullWidth
                              label={`Substância ${idx + 1}`}
                              value={part.officialName}
                              onChange={(e) => {
                                const next = [...splits];
                                next[idx] = {
                                  ...part,
                                  officialName: e.target.value,
                                };
                                setSplitEdits((prev) => ({
                                  ...prev,
                                  [item.sourceRowId]: next,
                                }));
                              }}
                            />
                            <TextField
                              size="small"
                              label="CAS"
                              value={part.cas}
                              onChange={(e) => {
                                const next = [...splits];
                                next[idx] = {
                                  ...part,
                                  cas: e.target.value,
                                };
                                setSplitEdits((prev) => ({
                                  ...prev,
                                  [item.sourceRowId]: next,
                                }));
                              }}
                            />
                          </Stack>
                        ))}
                      </Stack>
                    ) : null}

                    {!decision && suggestion && companyId && workspaceId ? (
                      <Stack spacing={0.75}>
                        {pendingManualFactor ? (
                          <Alert
                            severity="success"
                            action={
                              <Button
                                color="inherit"
                                size="small"
                                onClick={() =>
                                  clearPendingManualFactor(item.sourceRowId)
                                }
                              >
                                Trocar fator
                              </Button>
                            }
                          >
                            Fator selecionado: <strong>{pendingManualFactor.officialName}</strong>
                            {pendingManualFactor.cas
                              ? ` · CAS ${pendingManualFactor.cas}`
                              : ''}
                            . Confirme o vínculo para aplicar à planilha.
                          </Alert>
                        ) : (
                          <>
                            <Stack direction="row" spacing={1}>
                              <TextField
                                size="small"
                                label="Buscar fator"
                                value={searchByItem[item.sourceRowId] || ''}
                                onChange={(e) =>
                                  setSearchByItem((prev) => ({
                                    ...prev,
                                    [item.sourceRowId]: e.target.value,
                                  }))
                                }
                              />
                              <Button
                                size="small"
                                disabled={
                                  busy || searchBusy === item.sourceRowId
                                }
                                onClick={() =>
                                  handleSearchFactor(item.sourceRowId)
                                }
                              >
                                Buscar
                              </Button>
                            </Stack>
                            {(searchResults[item.sourceRowId] || []).map(
                              (risk) => (
                                <Button
                                  key={risk.id}
                                  size="small"
                                  variant="outlined"
                                  onClick={() =>
                                    setPendingManualFactor(item.sourceRowId, {
                                      riskFactorId: risk.id,
                                      officialName: risk.name,
                                      cas: risk.cas ?? null,
                                    })
                                  }
                                >
                                  Escolher: {risk.name}
                                  {risk.cas ? ` [${risk.cas}]` : ''}
                                </Button>
                              ),
                            )}
                            {shouldShowCreateChemicalRiskButton({
                              canCreateRisk,
                              pending: item,
                              suggestion,
                              hasAppliedDecision: Boolean(decision),
                              hasPendingManualFactor: false,
                            }) ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                disabled={busy}
                                onClick={() =>
                                  openCreateRiskDialog(item.sourceRowId)
                                }
                              >
                                Cadastrar fator químico
                              </Button>
                            ) : null}
                          </>
                        )}
                      </Stack>
                    ) : null}

                    {!decision && suggestion ? (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {pendingManualFactor ? (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={busy}
                            onClick={() =>
                              confirmPendingManualFactor(item.sourceRowId)
                            }
                          >
                            Confirmar vínculo
                          </Button>
                        ) : null}
                        {!pendingManualFactor &&
                        suggestion.type === 'EXISTING_RISK_MATCH' &&
                        top?.riskFactorId ? (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={busy}
                            onClick={() =>
                              handleDecisionAndDeselect({
                                sourceRowId: item.sourceRowId,
                                action: 'CONFIRM_EXISTING',
                                riskFactorId: top.riskFactorId,
                                officialName: top.officialName,
                                cas: top.cas,
                                confidence: suggestion.confidence,
                                suggestionType: suggestion.type,
                                rationale: suggestion.rationale,
                                evidences: slimEvidencesForExport(top.evidences),
                              })
                            }
                          >
                            Confirmar vínculo
                          </Button>
                        ) : null}
                        {!pendingManualFactor &&
                        suggestion.type === 'CHEMICAL_IDENTITY' ? (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={busy}
                            onClick={() =>
                              handleDecisionAndDeselect({
                                sourceRowId: item.sourceRowId,
                                action: 'CONFIRM_EXISTING',
                                riskFactorId: null,
                                officialName:
                                  displayOfficialName(top?.officialName) ||
                                  item.componentOriginal,
                                cas: top?.cas || null,
                                confidence: suggestion.confidence,
                                suggestionType: suggestion.type,
                                rationale: suggestion.rationale,
                                evidences: slimEvidencesForExport(top?.evidences),
                              })
                            }
                          >
                            Confirmar identidade para a planilha
                          </Button>
                        ) : null}
                        {suggestion.type === 'SPLIT_COMPONENT' ? (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={busy}
                            onClick={() =>
                              handleDecisionAndDeselect({
                                sourceRowId: item.sourceRowId,
                                action: 'CONFIRM_SPLIT',
                                split: splits
                                  .filter(
                                    (p) => p.include && p.officialName.trim(),
                                  )
                                  .map((p) => ({
                                    officialName: p.officialName.trim(),
                                    cas: p.cas.trim() || null,
                                  })),
                                confidence: suggestion.confidence,
                                suggestionType: suggestion.type,
                                rationale: suggestion.rationale,
                              })
                            }
                          >
                            Aceitar divisão
                          </Button>
                        ) : null}
                        <Button
                          size="small"
                          disabled={busy}
                          onClick={() =>
                            handleDecisionAndDeselect({
                              sourceRowId: item.sourceRowId,
                              action: 'REJECT',
                              suggestionType: suggestion.type,
                              confidence: suggestion.confidence,
                            })
                          }
                        >
                          Rejeitar sugestão
                        </Button>
                        <Button
                          size="small"
                          disabled={busy}
                          onClick={() =>
                            handleDecisionAndDeselect({
                              sourceRowId: item.sourceRowId,
                              action: 'KEEP_UNLINKED',
                              officialName:
                                displayOfficialName(top?.officialName) ||
                                item.componentOriginal,
                              cas: top?.cas || null,
                              suggestionType: suggestion.type,
                              confidence: suggestion.confidence,
                              evidences: slimEvidencesForExport(top?.evidences),
                            })
                          }
                        >
                          Manter sem vínculo
                        </Button>
                      </Stack>
                    ) : null}
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          {pageCount > 1 ? (
            <Pagination
              count={pageCount}
              page={safePage}
              onChange={(_, p) => setPage(p)}
              size="small"
            />
          ) : null}
        </>
      )}

      {createRiskSession && companyId && workspaceId ? (
        <ChemicalCurationCreateRiskDialog
          open={Boolean(createRiskSession)}
          companyId={companyId}
          workspaceId={workspaceId}
          initialData={createRiskSession.initialData}
          onClose={closeCreateRiskDialog}
          onCreated={(risk) => {
            const sourceRowId =
              createRiskSourceRowIdRef.current || createRiskSession.sourceRowId;
            if (!sourceRowId) return;
            applyCreatedRiskToCuration(
              sourceRowId,
              risk,
              createRiskSession.initialData.cas || null,
              { fromCurationCreate: true },
            );
          }}
          onSelectExisting={(risk) => {
            const sourceRowId =
              createRiskSourceRowIdRef.current || createRiskSession.sourceRowId;
            if (!sourceRowId) return;
            applyCreatedRiskToCuration(
              sourceRowId,
              risk,
              createRiskSession.initialData.cas || null,
            );
          }}
        />
      ) : null}
    </Stack>
  );
};

function EvidenceSection({
  title,
  evidences,
  empty,
}: {
  title: string;
  evidences: AiCurationEvidence[];
  empty: string;
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <SText fontSize={12} fontWeight={700} mb={0.5}>
        {title}
      </SText>
      {evidences.length ? (
        evidences.slice(0, 8).map((ev, idx) => (
          <SText key={idx} fontSize={11} color="text.secondary">
            {ev.field}={ev.value || '—'}
            {ev.excerpt ? ` · ${ev.excerpt}` : ''}
            {ev.sourceReference ? ` · ${ev.sourceReference}` : ''}
          </SText>
        ))
      ) : (
        <SText fontSize={11} color="text.secondary">
          {empty}
        </SText>
      )}
    </Box>
  );
}
