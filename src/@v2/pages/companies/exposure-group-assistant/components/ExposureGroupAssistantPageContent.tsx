import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useFetchExposureGroupDiagnosis } from '@v2/services/security/exposure-group-assistant/hooks/useFetchExposureGroupDiagnosis';
import {
  useMutateBulkJustifyIntegrityReview,
  useMutateJustifyIntegrityReview,
  useMutatePreviewBulkJustifyIntegrityReview,
  useMutateReopenIntegrityReview,
} from '@v2/services/security/exposure-group-assistant/hooks/useMutateIntegrityReview';
import type {
  BulkJustifyPreviewResponse,
  InterpretedRecommendation,
  NarrativeStance,
  StructureAttentionLevel,
  StructureFindingCategory,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';
import {
  INTEGRITY_JUSTIFY_REASON_SUGGESTION,
  UNREACHED_ELEMENT_FINDING_KIND,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import { STabs } from 'components/molecules/STabs';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';

import {
  COMPANY_SST_PATHNAME,
  COMPANY_SST_STAGE,
  getAssistenteGseNavStep,
  getCharacterizationAiProfilesHref,
  getCharacterizationSubareaNavItems,
  getChemicalProductsHref,
} from 'core/constants/characterization-navigation.constants';
import { CharacterizationSummarySection } from 'components/organisms/main/CompanyFlow/CharacterizationSummarySection';
import { useAccess } from 'core/hooks/useAccess';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import {
  enrichPickableWorkspaces,
  pickDefaultWorkspace,
} from 'core/utils/helpers/pick-default-workspace.util';

import {
  ATTENTION_LEVEL_LABEL_PT,
  FINDING_CATEGORY_LABEL_PT,
  FINDING_CATEGORY_ORDER,
  STANCE_LABEL_PT,
  formatDateTime,
  formatPercent,
  maturityLabel,
} from './diagnosis-labels';
import { RecommendationDetailDialog } from './FindingDetailDialog';

type OperationalView = 'PENDING' | 'INFORMATIONAL';

type Filters = {
  category: StructureFindingCategory | 'ALL';
  attentionLevel: StructureAttentionLevel | 'ALL';
  stance: NarrativeStance | 'ALL';
  entityQuery: string;
  existingGseOnly: boolean;
};

const DEFAULT_FILTERS: Filters = {
  category: 'ALL',
  attentionLevel: 'ALL',
  stance: 'ALL',
  entityQuery: '',
  existingGseOnly: false,
};

function recommendationBucket(
  rec: InterpretedRecommendation,
): 'PENDING' | 'INFORMATIONAL' {
  if (rec.operationalBucket) return rec.operationalBucket;
  if (rec.operationalReviewStatus === 'JUSTIFIED_VALID') return 'INFORMATIONAL';
  if (rec.operationalReviewStatus === 'JUSTIFIED_STALE') return 'PENDING';
  if (rec.stance === 'EXPECTED_SITUATION' || rec.stance === 'OPPORTUNITY') {
    return 'INFORMATIONAL';
  }
  if (
    rec.stance === 'REVIEW_RECOMMENDED' ||
    rec.stance === 'INTERVENTION_LIKELY' ||
    rec.stance === 'ATTENTION_POINT'
  ) {
    return 'PENDING';
  }
  if (rec.attentionLevel === 'INFORMATIONAL') return 'INFORMATIONAL';
  return 'PENDING';
}

function isJustifiedValid(rec: InterpretedRecommendation): boolean {
  return rec.operationalReviewStatus === 'JUSTIFIED_VALID';
}

function isOperationallyPendingRec(rec: InterpretedRecommendation): boolean {
  return recommendationBucket(rec) === 'PENDING';
}

export function ExposureGroupAssistantPageContent({
  companyId,
}: {
  companyId: string;
}) {
  const router = useRouter();
  const { data: company, isLoading: isLoadingCompany } =
    useQueryCompany(companyId);
  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
  }>();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [operationalView, setOperationalView] =
    useState<OperationalView>('PENDING');
  const [selected, setSelected] = useState<InterpretedRecommendation | null>(
    null,
  );
  /** Session-only: intro summary starts expanded; not persisted. */
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const { isMaster } = useAccess();
  const canReview = isMaster;
  const { enqueueSnackbar } = useSnackbar();
  const justifyMutation = useMutateJustifyIntegrityReview();
  const reopenMutation = useMutateReopenIntegrityReview();
  const previewBulkMutation = useMutatePreviewBulkJustifyIntegrityReview();
  const bulkJustifyMutation = useMutateBulkJustifyIntegrityReview();
  const [justifyTarget, setJustifyTarget] =
    useState<InterpretedRecommendation | null>(null);
  const [justifyReason, setJustifyReason] = useState(
    INTEGRITY_JUSTIFY_REASON_SUGGESTION,
  );
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkReason, setBulkReason] = useState(INTEGRITY_JUSTIFY_REASON_SUGGESTION);
  const [bulkPreview, setBulkPreview] = useState<BulkJustifyPreviewResponse | null>(
    null,
  );
  const [bulkPreviewError, setBulkPreviewError] = useState<string | null>(null);
  const [bulkFilterSnapshot, setBulkFilterSnapshot] = useState<Filters | null>(null);

  const navItems = useMemo(
    () => getCharacterizationSubareaNavItems({ showAiProfiles: isMaster }),
    [isMaster],
  );
  const activeStep = getAssistenteGseNavStep();

  const defaultWorkspaceId = useMemo(() => {
    const pickable = enrichPickableWorkspaces(
      workspaces?.results,
      company?.workspace,
    );
    return pickDefaultWorkspace(pickable) || '';
  }, [company?.workspace, workspaces?.results]);

  useEffect(() => {
    if (isLoadingAllWorkspaces || isLoadingCompany || !defaultWorkspaceId) {
      return;
    }
    if (queryParams.tabWorkspaceId) return;
    setQueryParams({ tabWorkspaceId: defaultWorkspaceId });
  }, [
    defaultWorkspaceId,
    isLoadingAllWorkspaces,
    isLoadingCompany,
    queryParams.tabWorkspaceId,
    setQueryParams,
  ]);

  const workspaceId = queryParams.tabWorkspaceId || '';

  const { data, isLoading, isError, error, refetch, isFetching } =
    useFetchExposureGroupDiagnosis(
      { companyId, workspaceId },
      Boolean(companyId && workspaceId),
    );

  const narrative = data?.narrative;
  const recommendations = narrative?.recommendations ?? [];
  const operationalTotals = data?.truncation?.operationalTotals;

  const visibleCategoryCards = useMemo(() => {
    const cards = narrative?.categoryConclusions ?? [];
    if (operationalView === 'PENDING') {
      return cards.filter(
        (c) => (c.pendingCount ?? c.recommendationCount ?? 0) > 0,
      );
    }
    return cards.filter((c) => (c.informationalCount ?? 0) > 0);
  }, [narrative?.categoryConclusions, operationalView]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
      if (recommendationBucket(r) !== operationalView) return false;
      if (filters.category !== 'ALL' && r.category !== filters.category) return false;
      if (
        filters.attentionLevel !== 'ALL' &&
        r.attentionLevel !== filters.attentionLevel
      ) {
        return false;
      }
      if (filters.stance !== 'ALL' && r.stance !== filters.stance) return false;
      if (filters.existingGseOnly && r.category !== 'EXISTING_GSE_REVIEW') return false;

      if (filters.entityQuery.trim()) {
        const q = filters.entityQuery.trim().toLowerCase();
        const hit = r.affectedEntities.some((e) => {
          const label = (e.label || '').toLowerCase();
          return (
            label.includes(q) ||
            String(e.entityId).toLowerCase().includes(q)
          );
        });
        if (
          !hit &&
          !r.title.toLowerCase().includes(q) &&
          !r.listSummary.toLowerCase().includes(q) &&
          !(r.primaryEntityName || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [recommendations, filters, operationalView]);

  const unreachedKindStat = useMemo(() => {
    return data?.truncation?.kindStats?.find(
      (k) => k.kind === UNREACHED_ELEMENT_FINDING_KIND,
    );
  }, [data?.truncation?.kindStats]);

  const truncationCaption = useMemo(() => {
    if (!operationalTotals) return '';
    if (operationalView === 'PENDING' && operationalTotals.pendingTotal > operationalTotals.displayedPendingTotal) {
      return `${operationalTotals.pendingTotal} pendências identificadas; ${operationalTotals.displayedPendingTotal} exibidas.`;
    }
    if (
      operationalView === 'INFORMATIONAL' &&
      operationalTotals.informationalTotal > operationalTotals.displayedInformationalTotal
    ) {
      return `${operationalTotals.informationalTotal} registros informativos; ${operationalTotals.displayedInformationalTotal} exibidos.`;
    }
    if (unreachedKindStat?.pendingTruncated && operationalView === 'PENDING') {
      return `${unreachedKindStat.pendingTotal} pendências identificadas; ${unreachedKindStat.displayedPendingTotal} exibidas.`;
    }
    if (unreachedKindStat?.informationalTruncated && operationalView === 'INFORMATIONAL') {
      return `${unreachedKindStat.informationalTotal} registros informativos; ${unreachedKindStat.displayedInformationalTotal} exibidos.`;
    }
    return '';
  }, [operationalTotals, operationalView, unreachedKindStat]);

  const busyReview =
    justifyMutation.isPending ||
    reopenMutation.isPending ||
    previewBulkMutation.isPending ||
    bulkJustifyMutation.isPending;

  const closeBulkModal = () => {
    setBulkOpen(false);
    setBulkPreview(null);
    setBulkPreviewError(null);
    setBulkFilterSnapshot(null);
  };

  useEffect(() => {
    if (!bulkOpen || !bulkFilterSnapshot) return;
    const filtersChanged =
      filters.category !== bulkFilterSnapshot.category ||
      filters.attentionLevel !== bulkFilterSnapshot.attentionLevel ||
      filters.stance !== bulkFilterSnapshot.stance ||
      filters.entityQuery !== bulkFilterSnapshot.entityQuery ||
      filters.existingGseOnly !== bulkFilterSnapshot.existingGseOnly ||
      operationalView !== 'PENDING';
    if (!filtersChanged) return;
    closeBulkModal();
    enqueueSnackbar(
      'Os filtros mudaram. O preview em massa foi cancelado — abra novamente para recalcular.',
      { variant: 'info' },
    );
  }, [bulkOpen, bulkFilterSnapshot, filters, operationalView, enqueueSnackbar]);

  const openJustify = (rec: InterpretedRecommendation) => {
    setJustifyTarget(rec);
    setJustifyReason(INTEGRITY_JUSTIFY_REASON_SUGGESTION);
  };

  const openBulkJustify = async () => {
    if (!workspaceId || operationalView !== 'PENDING') return;
    const snapshot: Filters = { ...filters };
    setBulkOpen(true);
    setBulkReason(INTEGRITY_JUSTIFY_REASON_SUGGESTION);
    setBulkPreview(null);
    setBulkPreviewError(null);
    setBulkFilterSnapshot(snapshot);
    try {
      const preview = await previewBulkMutation.mutateAsync({
        companyId,
        workspaceId,
        operationalBucket: 'PENDING',
        category: snapshot.category,
        attentionLevel: snapshot.attentionLevel,
        stance: snapshot.stance,
        entityQuery: snapshot.entityQuery,
        existingGseOnly: snapshot.existingGseOnly,
      });
      setBulkPreview(preview);
    } catch (err) {
      setBulkPreviewError(
        err instanceof Error
          ? err.message
          : 'Não foi possível obter a quantidade filtrada.',
      );
    }
  };

  const submitBulkJustify = async () => {
    if (!workspaceId || !bulkPreview || !bulkFilterSnapshot) return;
    const reason = bulkReason.trim();
    if (!reason) {
      enqueueSnackbar('Informe a justificativa técnica.', { variant: 'warning' });
      return;
    }
    if (bulkPreview.confirmableCount <= 0) {
      enqueueSnackbar('Nenhum item elegível para marcar como analisado.', {
        variant: 'info',
      });
      return;
    }
    try {
      const result = await bulkJustifyMutation.mutateAsync({
        companyId,
        workspaceId,
        reason,
        operationalBucket: bulkPreview.filtersSnapshot.operationalBucket,
        category: bulkPreview.filtersSnapshot.category,
        attentionLevel: bulkPreview.filtersSnapshot.attentionLevel,
        stance: bulkPreview.filtersSnapshot.stance,
        entityQuery: bulkPreview.filtersSnapshot.entityQuery,
        existingGseOnly: bulkPreview.filtersSnapshot.existingGseOnly,
        eligibleElementIds: bulkPreview.eligibleElementIds,
        selectionFingerprint: bulkPreview.selectionFingerprint,
      });
      enqueueSnackbar(
        `${result.processedCount} pendências foram marcadas como analisadas.`,
        { variant: 'success' },
      );
      if (result.ignoredCount > 0) {
        enqueueSnackbar(
          `${result.ignoredCount} item(ns) ignorado(s) (inelegível, concorrência ou alteração de dados).`,
          { variant: 'info' },
        );
      }
      closeBulkModal();
      void refetch();
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : 'Falha na análise em massa.',
        { variant: 'error' },
      );
    }
  };

  const submitJustify = async () => {
    if (!justifyTarget || !workspaceId) return;
    const elementId = String(
      justifyTarget.primaryEntityId ??
        justifyTarget.affectedEntities[0]?.entityId ??
        '',
    );
    if (!elementId) return;
    const reason = justifyReason.trim();
    if (!reason) {
      enqueueSnackbar('Informe a justificativa técnica.', { variant: 'warning' });
      return;
    }
    try {
      await justifyMutation.mutateAsync({
        companyId,
        workspaceId,
        elementId,
        reason,
        findingKind: UNREACHED_ELEMENT_FINDING_KIND,
      });
      enqueueSnackbar('Análise registrada (justificado).', { variant: 'success' });
      setJustifyTarget(null);
      void refetch();
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : 'Falha ao justificar.',
        { variant: 'error' },
      );
    }
  };

  const handleReopen = async (rec: InterpretedRecommendation) => {
    if (!workspaceId) return;
    const elementId = String(
      rec.primaryEntityId ?? rec.affectedEntities[0]?.entityId ?? '',
    );
    if (!elementId) return;
    try {
      await reopenMutation.mutateAsync({
        companyId,
        workspaceId,
        elementId,
        findingKind: UNREACHED_ELEMENT_FINDING_KIND,
      });
      enqueueSnackbar('Análise reaberta.', { variant: 'success' });
      void refetch();
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : 'Falha ao reabrir.',
        { variant: 'error' },
      );
    }
  };

  return (
    <Box>
      <CharacterizationSummarySection />
      <CompanyFlowStickySubheader>
        <STabs
          shadow
          value={activeStep >= 0 ? activeStep : 0}
          options={navItems.map((item) => ({ label: item.label }))}
          onChange={(_, step) => {
            const item = navItems[step];
            if (!item) return;
            if (item.kind === 'external' && item.id === 'assistente-gse') return;
            if (item.kind === 'external' && item.id === 'chemical-products') {
              void router.push(
                getChemicalProductsHref({
                  companyId,
                  tabWorkspaceId: workspaceId || undefined,
                }),
              );
              return;
            }
            if (
              item.kind === 'external' &&
              item.id === 'characterization-ai-profiles'
            ) {
              void router.push(
                getCharacterizationAiProfilesHref({
                  companyId,
                  tabWorkspaceId: workspaceId || undefined,
                }),
              );
              return;
            }
            if (item.kind === 'tab') {
              void router.push({
                pathname: COMPANY_SST_PATHNAME,
                query: {
                  companyId,
                  stage: COMPANY_SST_STAGE,
                  active: String(item.tab),
                  ...(workspaceId ? { tabWorkspaceId: workspaceId } : {}),
                },
              });
            }
          }}
        />
      </CompanyFlowStickySubheader>

      <Stack spacing={2.5} sx={{ mt: 2, px: { xs: 1, md: 0 }, pb: 4 }}>
        <SAccordion
          title="Assistente de Grupos Similares de Exposição"
          subtitle="Parecer estrutural para apoiar a formação e revisão dos Grupos Similares de Exposição."
          fontWeight="600"
          expanded={summaryExpanded}
          onChange={(_event, nextExpanded) => setSummaryExpanded(nextExpanded)}
          accordionProps={{
            disableGutters: true,
            elevation: 0,
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              '&::before': { display: 'none' },
              '& .MuiAccordionSummary-root': {
                px: 0,
                minHeight: 0,
                '& .MuiAccordionSummary-content': {
                  my: 0.5,
                },
              },
              '& .MuiAccordionDetails-root': {
                px: 0,
              },
            },
          }}
        >
          <Stack spacing={2.5}>
            {!workspaceId ? (
              <Alert severity="warning">
                Selecione um estabelecimento no seletor do cabeçalho para gerar
                o parecer.
              </Alert>
            ) : null}

            {isLoading || isFetching ? (
              <SFlex gap={2} direction="column">
                <SSkeleton height={80} />
                <SSkeleton height={160} />
              </SFlex>
            ) : null}

            {isError ? (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => refetch()}
                  >
                    Tentar novamente
                  </Button>
                }
              >
                Não foi possível carregar o parecer
                {error instanceof Error ? `: ${error.message}` : '.'}
              </Alert>
            ) : null}

            {data && narrative ? (
              <>
                <Alert severity="info">{narrative.opening}</Alert>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`Estabelecimento: ${data.workspace.name}${
                      company?.name ? ` · ${company.name}` : ''
                    }`}
                  />
                  <Chip
                    color="primary"
                    variant="outlined"
                    label={`Maturidade dos dados: ${maturityLabel(data.maturity)}`}
                  />
                  <Chip label={`Análise: ${formatDateTime(data.generatedAt)}`} />
                  <Chip label={`Empregados: ${data.metrics.employees}`} />
                  <Chip label={`Cargos: ${data.metrics.roles}`} />
                  <Chip label={`Funções: ${data.metrics.functions}`} />
                  <Chip label={`Setores: ${data.metrics.sectors}`} />
                  <Chip
                    label={`Elementos: ${data.metrics.characterizableElements}`}
                  />
                  <Chip
                    label={`Cobertura ocupacional direta: ${data.metrics.elementsWithDirectRiskCoverage ?? 0}`}
                  />
                  <Chip
                    label={`Cobertura ocupacional indireta: ${data.metrics.elementsWithIndirectWorkerCoverage ?? 0}`}
                  />
                  <Chip
                    label={`Cobertura ocupacional parcial: ${data.metrics.elementsWithPartialWorkerCoverage ?? 0}`}
                  />
                  <Chip
                    label={`Lacunas de cobertura ocupacional (elementos): ${data.metrics.elementsWithCoverageGap ?? 0}`}
                  />
                  <Chip
                    label={`Cargos sem cobertura ocupacional: ${
                      data.summary.findingsByKind
                        ?.ROLE_WITHOUT_CHARACTERIZATION_COVERAGE ?? 0
                    }`}
                  />
                  <Chip
                    label={`Agrupamentos: ${data.metrics.existingExposureGroups}`}
                  />
                  <Chip
                    label={`Cobertura ampla (empregados): ${formatPercent(data.metrics.coverageBroad)}`}
                  />
                  <Chip
                    label={`Cobertura estrita (empregados): ${formatPercent(data.metrics.coverageStrict)}`}
                  />
                  <Chip
                    label={`Processamento: ${data.processingTimeMs} ms`}
                    variant="outlined"
                  />
                </Stack>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Princípios desta análise
                  </Typography>
                  {narrative.principles.map((p) => (
                    <Typography key={p} variant="body2" color="text.secondary">
                      • {p}
                    </Typography>
                  ))}
                </Box>
              </>
            ) : null}
          </Stack>
        </SAccordion>

        {data && narrative ? (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button
                variant={operationalView === 'PENDING' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  setOperationalView('PENDING');
                  setFilters((f) => ({ ...f, category: 'ALL' }));
                }}
              >
                Pendências
                {operationalTotals
                  ? ` (${operationalTotals.pendingTotal})`
                  : ''}
              </Button>
              <Button
                variant={
                  operationalView === 'INFORMATIONAL' ? 'contained' : 'outlined'
                }
                size="small"
                onClick={() => {
                  setOperationalView('INFORMATIONAL');
                  setFilters((f) => ({ ...f, category: 'ALL' }));
                }}
              >
                Informativos
                {operationalTotals
                  ? ` (${operationalTotals.informationalTotal})`
                  : ''}
              </Button>
            </Stack>

            {operationalTotals ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Condição técnica: {operationalTotals.technicalTotal}
                {' · '}
                Pendências: {operationalTotals.pendingTotal}
                {' · '}
                Informativos: {operationalTotals.informationalTotal}
                {operationalTotals.justifiedValidTotal
                  ? ` · Justificados: ${operationalTotals.justifiedValidTotal}`
                  : ''}
              </Typography>
            ) : null}

            <Box>
              <Typography variant="h6" gutterBottom>
                Conclusões por dimensão
              </Typography>
              <SText fontSize={13} color="text.secondary" sx={{ mb: 1.5 }}>
                {operationalView === 'PENDING'
                  ? 'Dimensões com pendências operacionais — o que ainda exige análise ou correção.'
                  : 'Dimensões com registros informativos — situações esperadas, justificadas ou de contexto.'}
              </SText>
              {visibleCategoryCards.length === 0 ? (
                <Alert severity={operationalView === 'PENDING' ? 'success' : 'info'}>
                  {operationalView === 'PENDING'
                    ? 'Não há pendências operacionais nesta visão. Consulte Informativos para o contexto técnico.'
                    : 'Não há registros informativos para exibir com os filtros atuais.'}
                </Alert>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: '1fr 1fr',
                      lg: '1fr 1fr 1fr',
                    },
                  }}
                >
                  {visibleCategoryCards.map((card) => {
                    const count =
                      operationalView === 'PENDING'
                        ? card.pendingCount ?? card.recommendationCount
                        : card.informationalCount ?? 0;
                    return (
                      <Card
                        key={card.category}
                        variant="outlined"
                        sx={{
                          borderColor:
                            filters.category === card.category
                              ? 'primary.main'
                              : undefined,
                        }}
                      >
                        <CardActionArea
                          onClick={() =>
                            setFilters((f) => ({
                              ...f,
                              category:
                                f.category === card.category
                                  ? 'ALL'
                                  : card.category,
                            }))
                          }
                        >
                          <CardContent>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Typography variant="subtitle1">
                                {card.title}
                              </Typography>
                              <Chip
                                size="small"
                                label={STANCE_LABEL_PT[card.stance]}
                              />
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 1.25 }}>
                              {card.conclusion}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mt: 1.25 }}
                            >
                              {operationalView === 'PENDING'
                                ? `${count} pendência(s)`
                                : `${count} informativo(s)`}
                              {card.technicalRecommendationCount != null
                                ? ` · ${card.technicalRecommendationCount} ocorrência(s) técnicas na dimensão`
                                : ''}
                              {card.justifiedValidCount
                                ? ` · ${card.justifiedValidCount} justificado(s)`
                                : ''}
                              {card.highestAttentionLevel
                                ? ` · prioridade máx.: ${ATTENTION_LEVEL_LABEL_PT[card.highestAttentionLevel]}`
                                : ''}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                {operationalView === 'PENDING'
                  ? 'Pendências para revisão'
                  : 'Considerações e informativos'}
              </Typography>
              <SText fontSize={13} color="text.secondary" sx={{ mb: 1.5 }}>
                {operationalView === 'PENDING'
                  ? 'Itens que ainda exigem análise, decisão ou correção.'
                  : 'Situações esperadas, justificadas ou mantidas para contextualização técnica.'}
              </SText>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                alignItems={{ md: 'center' }}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 1.5 }}
              >
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Dimensão</InputLabel>
                  <Select
                    label="Dimensão"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        category: e.target.value as Filters['category'],
                      }))
                    }
                  >
                    <MenuItem value="ALL">Todas</MenuItem>
                    {FINDING_CATEGORY_ORDER.map((c) => (
                      <MenuItem key={c} value={c}>
                        {FINDING_CATEGORY_LABEL_PT[c]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Prioridade de revisão</InputLabel>
                  <Select
                    label="Prioridade de revisão"
                    value={filters.attentionLevel}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        attentionLevel: e.target
                          .value as Filters['attentionLevel'],
                      }))
                    }
                  >
                    <MenuItem value="ALL">Todas</MenuItem>
                    {(
                      Object.keys(
                        ATTENTION_LEVEL_LABEL_PT,
                      ) as StructureAttentionLevel[]
                    ).map((level) => (
                      <MenuItem key={level} value={level}>
                        {ATTENTION_LEVEL_LABEL_PT[level]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Natureza</InputLabel>
                  <Select
                    label="Natureza"
                    value={filters.stance}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        stance: e.target.value as Filters['stance'],
                      }))
                    }
                  >
                    <MenuItem value="ALL">Todas</MenuItem>
                    {(Object.keys(STANCE_LABEL_PT) as NarrativeStance[]).map(
                      (s) => (
                        <MenuItem key={s} value={s}>
                          {STANCE_LABEL_PT[s]}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Buscar"
                  value={filters.entityQuery}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, entityQuery: e.target.value }))
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.existingGseOnly}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          existingGseOnly: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Só agrupamentos existentes"
                />
                <Button size="small" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Limpar filtros
                </Button>
                {canReview && operationalView === 'PENDING' ? (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={busyReview || !workspaceId}
                    onClick={() => void openBulkJustify()}
                  >
                    Marcar todos os itens filtrados como analisados
                  </Button>
                ) : null}
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {filteredRecommendations.length}{' '}
                {operationalView === 'PENDING' ? 'pendência(s)' : 'informativo(s)'}
                {truncationCaption ? ` · ${truncationCaption}` : ''}
              </Typography>

              {filteredRecommendations.length === 0 ? (
                <Alert severity="info">
                  {operationalView === 'PENDING'
                    ? 'Nenhuma pendência com os filtros atuais.'
                    : 'Nenhum informativo com os filtros atuais.'}
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {filteredRecommendations.slice(0, 80).map((rec) => (
                    <Card key={rec.id} variant="outlined">
                      <CardActionArea onClick={() => setSelected(rec)}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box>
                              <Typography variant="subtitle2">
                                {rec.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {rec.entityKindLabel
                                  ? `${rec.entityKindLabel}: `
                                  : ''}
                                {rec.primaryEntityName || rec.listSummary}
                              </Typography>
                              {rec.hierarchyPathLotacao ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  title={rec.hierarchyPathDisplay}
                                >
                                  Lotação: {rec.hierarchyPathLotacao}
                                </Typography>
                              ) : null}
                              {rec.workerCoverageStats &&
                              rec.workerCoverageStats.totalWorkers > 0 ? (
                                <Typography variant="caption" color="text.secondary">
                                  Trabalhadores:{' '}
                                  {rec.workerCoverageStats.coveredDirectly +
                                    rec.workerCoverageStats.coveredIndirectly}
                                  /{rec.workerCoverageStats.totalWorkers}
                                  {rec.peerCoverageSources?.[0]?.label &&
                                  rec.peerCoverageSources[0].relationKind !==
                                    'CO_MEMBERSHIP_ONLY' &&
                                  rec.workerRiskCoverage !== 'UNKNOWN'
                                    ? ` · via ${rec.peerCoverageSources[0].label}`
                                    : ''}
                                </Typography>
                              ) : null}
                              {rec.integrityReview &&
                              (rec.operationalReviewStatus === 'JUSTIFIED_VALID' ||
                                rec.operationalReviewStatus ===
                                  'JUSTIFIED_STALE') ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{ mt: 0.5 }}
                                >
                                  {rec.integrityReview.reason.length > 160
                                    ? `${rec.integrityReview.reason.slice(0, 160)}…`
                                    : rec.integrityReview.reason}
                                  {rec.integrityReview.reviewedByName
                                    ? ` · ${rec.integrityReview.reviewedByName}`
                                    : ''}
                                  {rec.integrityReview.reviewedAt
                                    ? ` · ${formatDateTime(rec.integrityReview.reviewedAt)}`
                                    : ''}
                                </Typography>
                              ) : null}
                            </Box>
                            <Stack spacing={0.75} alignItems={{ sm: 'flex-end' }}>
                              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                {rec.operationalReviewStatus ===
                                'JUSTIFIED_VALID' ? (
                                  <Chip size="small" color="success" label="Justificado" />
                                ) : null}
                                {rec.operationalReviewStatus ===
                                'JUSTIFIED_STALE' ? (
                                  <Chip
                                    size="small"
                                    color="warning"
                                    label="Justificativa desatualizada"
                                  />
                                ) : null}
                                <Chip
                                  size="small"
                                  label={STANCE_LABEL_PT[rec.stance]}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={ATTENTION_LEVEL_LABEL_PT[rec.attentionLevel]}
                                />
                              </Stack>
                              {canReview &&
                              rec.kind === UNREACHED_ELEMENT_FINDING_KIND &&
                              isOperationallyPendingRec(rec) ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={busyReview}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    openJustify(rec);
                                  }}
                                >
                                  Marcar como analisado
                                </Button>
                              ) : null}
                              {canReview &&
                              rec.kind === UNREACHED_ELEMENT_FINDING_KIND &&
                              isJustifiedValid(rec) ? (
                                <Button
                                  size="small"
                                  variant="text"
                                  disabled={busyReview}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    void handleReopen(rec);
                                  }}
                                >
                                  Reabrir análise
                                </Button>
                              ) : null}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                  {filteredRecommendations.length > 80 ? (
                    <Typography variant="caption" color="text.secondary">
                      Exibindo 80 de {filteredRecommendations.length}. Refine os
                      filtros para navegar volumes maiores.
                    </Typography>
                  ) : null}
                </Stack>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              {narrative.closing}
            </Typography>
          </>
        ) : null}
      </Stack>

      <RecommendationDetailDialog
        recommendation={selected}
        companyId={companyId}
        workspaceId={workspaceId || undefined}
        onClose={() => setSelected(null)}
        onDevelopedRoleDeleted={() => {
          void refetch();
        }}
      />

      <Dialog
        open={!!justifyTarget}
        onClose={() => !busyReview && setJustifyTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Marcar como analisado — justificativa técnica</DialogTitle>
        <DialogContent dividers>
          {justifyTarget ? (
            <Stack spacing={1.5}>
              <Typography fontWeight={700}>
                {justifyTarget.primaryEntityName || justifyTarget.listSummary}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A condição técnica do detector permanece. Esta ação apenas
                registra que a ausência de alcance foi analisada e justificada
                tecnicamente, retirando o item das pendências operacionais.
              </Typography>
              <TextField
                label="Justificativa técnica"
                required
                multiline
                minRows={4}
                fullWidth
                value={justifyReason}
                onChange={(e) => setJustifyReason(e.target.value)}
                disabled={busyReview}
                helperText="Sugestão editável — revise antes de confirmar. Não grave texto vazio."
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button disabled={busyReview} onClick={() => setJustifyTarget(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={busyReview || !justifyReason.trim()}
            onClick={() => void submitJustify()}
          >
            Confirmar análise
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkOpen}
        onClose={() => {
          if (busyReview) return;
          closeBulkModal();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Marcar itens filtrados como analisados</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {previewBulkMutation.isPending ? (
              <Typography variant="body2" color="text.secondary">
                Calculando quantidade no servidor…
              </Typography>
            ) : null}
            {bulkPreviewError ? (
              <Alert severity="error">{bulkPreviewError}</Alert>
            ) : null}
            {bulkPreview ? (
              <>
                <Typography>
                  Encontrados: <strong>{bulkPreview.foundCount}</strong>
                </Typography>
                <Typography>
                  Elegíveis para análise:{' '}
                  <strong>{bulkPreview.eligibleCount}</strong>
                </Typography>
                <Typography>
                  Não elegíveis: <strong>{bulkPreview.ignoredCount}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Serão registrados como analisados{' '}
                  <strong>{bulkPreview.confirmableCount}</strong> pendências.
                  Esta ação remove esses itens de Pendências e os move para
                  Informativos. O conjunto confirmado é o snapshot deste preview
                  (não depende da paginação/exibição).
                </Typography>
                {bulkPreview.ineligibilitySummary?.length ? (
                  <Alert severity="info">
                    {bulkPreview.ineligibilitySummary.map((g) => (
                      <Typography key={g.code} variant="body2" component="div">
                        {g.message}
                      </Typography>
                    ))}
                  </Alert>
                ) : null}
                {bulkPreview.foundCount === 0 ? (
                  <Alert severity="info">
                    Nenhum item corresponde aos filtros deste preview.
                  </Alert>
                ) : null}
              </>
            ) : null}
            <TextField
              label="Justificativa técnica"
              required
              multiline
              minRows={4}
              fullWidth
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              disabled={busyReview || previewBulkMutation.isPending}
              helperText="Uma única justificativa será aplicada a todos os itens elegíveis deste preview."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busyReview} onClick={closeBulkModal}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={
              busyReview ||
              previewBulkMutation.isPending ||
              !bulkPreview ||
              bulkPreview.confirmableCount <= 0 ||
              !bulkReason.trim()
            }
            onClick={() => void submitBulkJustify()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
