import { FC, useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useExportAcgihBeiComparison } from '@v2/services/medicine/acgih-bei-comparison/hooks/useAcgihBeiComparisonExport';
import { useFetchBrowseAcgihBeiComparison } from '@v2/services/medicine/acgih-bei-comparison/hooks/useFetchBrowseAcgihBeiComparison';
import { useMutateApplyAcgihReference } from '@v2/services/medicine/acgih-bei-comparison/hooks/useMutateApplyAcgihReference';
import {
  useMutateRemoveComparisonReview,
  useMutateUpsertComparisonReview,
} from '@v2/services/medicine/acgih-bei-comparison/hooks/useMutateComparisonReview';
import {
  AcgihBeiComparisonDecisionEnum,
  AcgihBeiComparisonStatusEnum,
  AcgihBeiOperationalStatusEnum,
  AcgihBeiSuggestedActionEnum,
  IAcgihBeiComparisonRow,
  IAcgihBeiComparisonTotals,
} from '@v2/services/medicine/acgih-bei-comparison/service/acgih-bei-comparison.types';
import { AcgihBeiIndicatorConfidenceEnum } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  comparisonDecisionLabels,
  comparisonStatusLabels,
  suggestedActionLabels,
} from './acgih-bei-comparison-labels';
import { AcgihBeiAddReferenceDialog } from './components/AcgihBeiAddReferenceDialog';
import { AcgihBeiComparisonReviewDialog } from './components/AcgihBeiComparisonReviewDialog';
import { AcgihBeiComparisonTable } from './components/AcgihBeiComparisonTable';
import { acgihBeiConfidenceLabels } from '../acgih-bei-indicators/acgih-bei-indicator-labels';

const ALL = 'ALL';

const totalsConfig: Array<{
  key: keyof IAcgihBeiComparisonTotals;
  label: string;
}> = [
  { key: 'total', label: 'Total' },
  { key: 'alreadyCovered', label: 'Já coberto' },
  { key: 'divergent', label: 'Divergente' },
  { key: 'resolvedEquivalence', label: 'Resolvido (equiv.)' },
  { key: 'needsReview', label: 'Requer revisão' },
  { key: 'newCandidate', label: 'Candidato novo' },
  { key: 'lowConfidenceReview', label: 'Baixa confiança' },
];

export const AcgihBeiComparisonListPage: FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [comparisonStatus, setComparisonStatus] = useState<
    AcgihBeiComparisonStatusEnum | typeof ALL
  >(ALL);
  // 4O.3 — filtro pelo status operacional/efetivo (Divergentes operacionais,
  // Resolvidos por equivalência).
  const [operationalStatus, setOperationalStatus] = useState<
    AcgihBeiOperationalStatusEnum | typeof ALL
  >(ALL);
  const [suggestedAction, setSuggestedAction] = useState<
    AcgihBeiSuggestedActionEnum | typeof ALL
  >(ALL);
  const [confidence, setConfidence] = useState<
    AcgihBeiIndicatorConfidenceEnum | typeof ALL
  >(ALL);
  const [reviewDecision, setReviewDecision] = useState<
    AcgihBeiComparisonDecisionEnum | typeof ALL
  >(ALL);
  const [hasReview, setHasReview] = useState<'true' | 'false' | typeof ALL>(ALL);

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_ACGIH_BEI_COMPARISON);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const activeFilters = {
    search: search.trim() || undefined,
    comparisonStatus:
      comparisonStatus === ALL ? undefined : comparisonStatus,
    operationalStatus:
      operationalStatus === ALL ? undefined : operationalStatus,
    suggestedAction: suggestedAction === ALL ? undefined : suggestedAction,
    confidence: confidence === ALL ? undefined : confidence,
    reviewDecision: reviewDecision === ALL ? undefined : reviewDecision,
    hasReview: hasReview === ALL ? undefined : hasReview,
  };

  const { data, isLoading } = useFetchBrowseAcgihBeiComparison({
    page,
    limit: pageLimit,
    ...activeFilters,
  });

  const exportMutation = useExportAcgihBeiComparison();

  const [referenceTarget, setReferenceTarget] =
    useState<IAcgihBeiComparisonRow | null>(null);
  const applyReferenceMutation = useMutateApplyAcgihReference();

  const handleConfirmReference = () => {
    if (!referenceTarget || applyReferenceMutation.isPending) return;
    applyReferenceMutation.mutate(
      { acgihBeiIndicatorId: referenceTarget.acgihBeiId },
      { onSuccess: () => setReferenceTarget(null) },
    );
  };

  // 4O.1 — decisão técnica de curadoria.
  const [reviewTarget, setReviewTarget] =
    useState<IAcgihBeiComparisonRow | null>(null);
  const [clearTarget, setClearTarget] =
    useState<IAcgihBeiComparisonRow | null>(null);
  const upsertReviewMutation = useMutateUpsertComparisonReview();
  const removeReviewMutation = useMutateRemoveComparisonReview();

  const handleConfirmReview = (params: {
    decision: AcgihBeiComparisonDecisionEnum;
    technicalNote: string;
  }) => {
    if (!reviewTarget || upsertReviewMutation.isPending) return;
    upsertReviewMutation.mutate(
      { acgihBeiIndicatorId: reviewTarget.acgihBeiId, ...params },
      { onSuccess: () => setReviewTarget(null) },
    );
  };

  const handleConfirmClear = () => {
    if (!clearTarget || removeReviewMutation.isPending) return;
    removeReviewMutation.mutate(clearTarget.acgihBeiId, {
      onSuccess: () => setClearTarget(null),
    });
  };

  const toggleHasReview = (value: 'true' | 'false') => {
    setHasReview((prev) => (prev === value ? ALL : value));
    setReviewDecision(ALL);
    setPage(1);
  };

  const toggleReviewDecision = (value: AcgihBeiComparisonDecisionEnum) => {
    setReviewDecision((prev) => (prev === value ? ALL : value));
    setHasReview(ALL);
    setPage(1);
  };

  const decisionQuickFilters: Array<{
    key: string;
    label: string;
    active: boolean;
    color: 'warning' | 'error' | 'info' | 'success' | 'primary';
    onToggle: () => void;
  }> = [
    {
      key: 'no-decision',
      label: 'Sem decisão',
      active: hasReview === 'false',
      color: 'primary',
      onToggle: () => toggleHasReview('false'),
    },
    {
      key: 'with-decision',
      label: 'Com decisão',
      active: hasReview === 'true',
      color: 'success',
      onToggle: () => toggleHasReview('true'),
    },
    {
      key: 'false-divergence',
      label: 'Falso divergente / equivalência',
      active:
        reviewDecision ===
        AcgihBeiComparisonDecisionEnum.FALSE_DIVERGENCE_EQUIVALENT,
      color: 'success',
      onToggle: () =>
        toggleReviewDecision(
          AcgihBeiComparisonDecisionEnum.FALSE_DIVERGENCE_EQUIVALENT,
        ),
    },
    {
      key: 'real-divergence',
      label: 'Divergência real',
      active: reviewDecision === AcgihBeiComparisonDecisionEnum.REAL_DIVERGENCE,
      color: 'error',
      onToggle: () =>
        toggleReviewDecision(AcgihBeiComparisonDecisionEnum.REAL_DIVERGENCE),
    },
    {
      key: 'acgih-error',
      label: 'Erro ACGIH',
      active: reviewDecision === AcgihBeiComparisonDecisionEnum.SOURCE_ACGIH_ERROR,
      color: 'warning',
      onToggle: () =>
        toggleReviewDecision(AcgihBeiComparisonDecisionEnum.SOURCE_ACGIH_ERROR),
    },
    {
      key: 'nr7-error',
      label: 'Erro NR-7',
      active: reviewDecision === AcgihBeiComparisonDecisionEnum.SOURCE_NR7_ERROR,
      color: 'warning',
      onToggle: () =>
        toggleReviewDecision(AcgihBeiComparisonDecisionEnum.SOURCE_NR7_ERROR),
    },
    {
      key: 'pending',
      label: 'Pendente',
      active:
        reviewDecision === AcgihBeiComparisonDecisionEnum.NEEDS_FURTHER_REVIEW,
      color: 'info',
      onToggle: () =>
        toggleReviewDecision(
          AcgihBeiComparisonDecisionEnum.NEEDS_FURTHER_REVIEW,
        ),
    },
  ];

  // 4L.1b — filtros rápidos reaproveitando os filtros server-side existentes
  // (comparisonStatus, suggestedAction, confidence). Não quebram paginação/contagem.
  const toggleComparisonStatus = (value: AcgihBeiComparisonStatusEnum) => {
    setComparisonStatus((prev) => (prev === value ? ALL : value));
    setOperationalStatus(ALL);
    setPage(1);
  };

  // 4O.3 — quick filters baseados no status operacional/efetivo.
  const toggleOperationalStatus = (value: AcgihBeiOperationalStatusEnum) => {
    setOperationalStatus((prev) => (prev === value ? ALL : value));
    setComparisonStatus(ALL);
    setPage(1);
  };

  const toggleLowConfidence = () => {
    setConfidence((prev) =>
      prev === AcgihBeiIndicatorConfidenceEnum.LOW
        ? ALL
        : AcgihBeiIndicatorConfidenceEnum.LOW,
    );
    setPage(1);
  };

  const toggleEligibleReference = () => {
    setSuggestedAction((prev) =>
      prev === AcgihBeiSuggestedActionEnum.ADD_REFERENCE_ONLY
        ? ALL
        : AcgihBeiSuggestedActionEnum.ADD_REFERENCE_ONLY,
    );
    setPage(1);
  };

  const quickFilters: Array<{
    key: string;
    label: string;
    active: boolean;
    color: 'warning' | 'error' | 'info' | 'success' | 'primary';
    tooltip: string;
    onToggle: () => void;
  }> = [
    {
      key: 'low',
      label: 'Baixa confiança',
      active: confidence === AcgihBeiIndicatorConfidenceEnum.LOW,
      color: 'error',
      tooltip: 'Transcrição ACGIH/BEI com baixa confiança; revisar fonte antes de usar.',
      onToggle: toggleLowConfidence,
    },
    {
      key: 'divergent',
      label: 'Divergentes',
      active: operationalStatus === AcgihBeiOperationalStatusEnum.DIVERGENT,
      color: 'warning',
      tooltip:
        'Divergência técnica ainda em aberto (status operacional). Itens resolvidos por equivalência técnica não aparecem aqui.',
      onToggle: () =>
        toggleOperationalStatus(AcgihBeiOperationalStatusEnum.DIVERGENT),
    },
    {
      key: 'resolved-equivalence',
      label: 'Resolvidos por equivalência',
      active:
        operationalStatus ===
        AcgihBeiOperationalStatusEnum.RESOLVED_EQUIVALENCE,
      color: 'success',
      tooltip:
        'Divergências resolvidas por decisão técnica humana (equivalência / falso divergente). O status bruto calculado permanece preservado.',
      onToggle: () =>
        toggleOperationalStatus(
          AcgihBeiOperationalStatusEnum.RESOLVED_EQUIVALENCE,
        ),
    },
    {
      key: 'review',
      label: 'Requer revisão',
      active: operationalStatus === AcgihBeiOperationalStatusEnum.NEEDS_REVIEW,
      color: 'info',
      tooltip:
        'Pendentes de decisão técnica humana (status operacional). Itens que já receberam decisão saem desta fila e aparecem pelos filtros de decisão técnica.',
      onToggle: () =>
        toggleOperationalStatus(AcgihBeiOperationalStatusEnum.NEEDS_REVIEW),
    },
    {
      key: 'candidate',
      label: 'Candidatos novos',
      active: comparisonStatus === AcgihBeiComparisonStatusEnum.NEW_CANDIDATE,
      color: 'primary',
      tooltip: 'Sem equivalência clara; possível candidato para fase futura.',
      onToggle: () =>
        toggleComparisonStatus(AcgihBeiComparisonStatusEnum.NEW_CANDIDATE),
    },
    {
      key: 'covered',
      label: 'Já cobertos',
      active: comparisonStatus === AcgihBeiComparisonStatusEnum.ALREADY_COVERED,
      color: 'success',
      tooltip: 'ACGIH/BEI confirma item já coberto pela NR-7/Biblioteca.',
      onToggle: () =>
        toggleComparisonStatus(AcgihBeiComparisonStatusEnum.ALREADY_COVERED),
    },
    {
      key: 'eligible',
      label: 'Elegíveis p/ fonte complementar',
      active: suggestedAction === AcgihBeiSuggestedActionEnum.ADD_REFERENCE_ONLY,
      color: 'success',
      tooltip:
        'Itens com sugestão de fonte complementar. A elegibilidade final ainda exige uma regra vinculada (o botão Adicionar permanece desabilitado quando não houver regra).',
      onToggle: toggleEligibleReference,
    },
  ];

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h5">ACGIH/BEI × NR-7 × Regras</Typography>
            <Typography variant="body2" color="text.secondary">
              Análise diagnóstica e somente leitura entre a base ACGIH/BEI, a base
              NR-7 e a Biblioteca Risco × Exame. Identifica itens já cobertos,
              divergentes, candidatos novos e sugestões de fonte complementar, sem
              criar ou alterar regras automaticamente.
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={0.5}>
              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() =>
                  router.push(RoutesEnum.DATABASE_ACGIH_BEI_INDICATORS)
                }
                sx={{ px: 0 }}
              >
                Voltar à base ACGIH/BEI
              </Button>
              <Button
                variant="text"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push(RoutesEnum.DATABASE_EXAM_RISK_RULES)}
                sx={{ px: 0 }}
              >
                Abrir Biblioteca Risco × Exame
              </Button>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate(activeFilters)}
          >
            Exportar Excel
          </Button>
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          {totalsConfig.map((item) => (
            <Paper
              key={item.key}
              sx={{ px: 2, py: 1, minWidth: 120, textAlign: 'center' }}
            >
              <Typography variant="h6">
                {data?.totals?.[item.key] ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Filtros rápidos:
            </Typography>
            {quickFilters.map((filter) => (
              <Tooltip key={filter.key} title={filter.tooltip}>
                <Button
                  size="small"
                  variant={filter.active ? 'contained' : 'outlined'}
                  color={filter.active ? filter.color : 'inherit'}
                  onClick={filter.onToggle}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {filter.label}
                </Button>
              </Tooltip>
            ))}
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap" mb={2} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Decisão técnica:
            </Typography>
            {decisionQuickFilters.map((filter) => (
              <Button
                key={filter.key}
                size="small"
                variant={filter.active ? 'contained' : 'outlined'}
                color={filter.active ? filter.color : 'inherit'}
                onClick={filter.onToggle}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {filter.label}
              </Button>
            ))}
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
            <TextField
              label="Buscar (substância, CAS ou determinante)"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 280 }}
            />
            <TextField
              select
              label="Classificação"
              value={comparisonStatus}
              onChange={(event) => {
                setComparisonStatus(
                  event.target.value as
                    | AcgihBeiComparisonStatusEnum
                    | typeof ALL,
                );
                setOperationalStatus(ALL);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(AcgihBeiComparisonStatusEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {comparisonStatusLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Ação sugerida"
              value={suggestedAction}
              onChange={(event) => {
                setSuggestedAction(
                  event.target.value as
                    | AcgihBeiSuggestedActionEnum
                    | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(AcgihBeiSuggestedActionEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {suggestedActionLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Confiança"
              value={confidence}
              onChange={(event) => {
                setConfidence(
                  event.target.value as
                    | AcgihBeiIndicatorConfidenceEnum
                    | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(AcgihBeiIndicatorConfidenceEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {acgihBeiConfidenceLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Decisão técnica"
              value={reviewDecision}
              onChange={(event) => {
                setReviewDecision(
                  event.target.value as
                    | AcgihBeiComparisonDecisionEnum
                    | typeof ALL,
                );
                setHasReview(ALL);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(AcgihBeiComparisonDecisionEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {comparisonDecisionLabels[value]}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <AcgihBeiComparisonTable
            data={data?.data ?? []}
            isLoading={isLoading}
            pagination={{
              total: data?.count ?? 0,
              limit: pageLimit,
              page,
            }}
            setPage={setPage}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
            onAddReference={setReferenceTarget}
            applyingId={
              applyReferenceMutation.isPending
                ? referenceTarget?.acgihBeiId
                : null
            }
            onRegisterDecision={setReviewTarget}
            onClearDecision={setClearTarget}
            clearingId={
              removeReviewMutation.isPending ? clearTarget?.acgihBeiId : null
            }
          />
        </Paper>
      </Box>

      <AcgihBeiAddReferenceDialog
        row={referenceTarget}
        isApplying={applyReferenceMutation.isPending}
        onClose={() => {
          if (!applyReferenceMutation.isPending) setReferenceTarget(null);
        }}
        onConfirm={handleConfirmReference}
      />

      <AcgihBeiComparisonReviewDialog
        row={reviewTarget}
        isSaving={upsertReviewMutation.isPending}
        onClose={() => {
          if (!upsertReviewMutation.isPending) setReviewTarget(null);
        }}
        onConfirm={handleConfirmReview}
      />

      <Dialog
        open={Boolean(clearTarget)}
        onClose={() => {
          if (!removeReviewMutation.isPending) setClearTarget(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Limpar decisão técnica</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remover a decisão técnica registrada para{' '}
            <strong>{clearTarget?.substanceName}</strong>? A linha volta a ficar
            sem decisão. Isso não altera a classificação calculada nem as bases
            de origem.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setClearTarget(null)}
            disabled={removeReviewMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmClear}
            disabled={removeReviewMutation.isPending}
          >
            Limpar decisão
          </Button>
        </DialogActions>
      </Dialog>
    </SAuthShow>
  );
};
