import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
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
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useFetchExposureGroupDiagnosis } from '@v2/services/security/exposure-group-assistant/hooks/useFetchExposureGroupDiagnosis';
import type {
  InterpretedRecommendation,
  NarrativeStance,
  StructureAttentionLevel,
  StructureFindingCategory,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import { STabs } from 'components/molecules/STabs';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import {
  COMPANY_SST_PATHNAME,
  COMPANY_SST_STAGE,
  getAssistenteGseNavStep,
  getCharacterizationAiProfilesHref,
  getCharacterizationSubareaNavItems,
  getChemicalProductsHref,
} from 'core/constants/characterization-navigation.constants';
import { CharacterizationSummarySection } from 'components/organisms/main/CompanyFlow/CharacterizationSummarySection';
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
  const [selected, setSelected] = useState<InterpretedRecommendation | null>(
    null,
  );

  const navItems = useMemo(() => getCharacterizationSubareaNavItems(), []);
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

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
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
          !r.listSummary.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [recommendations, filters]);

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
        <Box>
          <Typography variant="h5" component="h1">
            Assistente de Grupos Similares de Exposição
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Parecer estrutural para apoiar a formação e revisão dos Grupos
            Similares de Exposição.
          </Typography>
        </Box>

        {!workspaceId ? (
          <Alert severity="warning">
            Selecione um estabelecimento no seletor do cabeçalho para gerar o
            parecer.
          </Alert>
        ) : null}

        {isLoading || isFetching ? (
          <SFlex gap={2} direction="column">
            <SSkeleton height={80} />
            <SSkeleton height={160} />
            <SSkeleton height={220} />
          </SFlex>
        ) : null}

        {isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
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
                label={`Vínculos estruturais a revisar: ${
                  data.summary.findingsByKind?.ROLE_WITHOUT_CHARACTERIZATION_COVERAGE ?? 0
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

            <Box>
              <Typography variant="h6" gutterBottom>
                Conclusões por dimensão
              </Typography>
              <SText fontSize={13} color="text.secondary" sx={{ mb: 1.5 }}>
                Cada card resume uma leitura consultiva da estrutura — não uma
                contagem de irregularidades.
              </SText>
              {narrative.categoryConclusions.length === 0 ? (
                <Alert severity="success">
                  Não há recomendações estruturais destacadas para este
                  estabelecimento com o conjunto atual de análise.
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
                  {narrative.categoryConclusions.map((card) => (
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
                            {card.recommendationCount} recomendação(ões) nesta
                            dimensão
                            {card.highestAttentionLevel
                              ? ` · prioridade máx.: ${ATTENTION_LEVEL_LABEL_PT[card.highestAttentionLevel]}`
                              : ''}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Recomendações para revisão
              </Typography>
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
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {filteredRecommendations.length} recomendação(ões)
              </Typography>

              {filteredRecommendations.length === 0 ? (
                <Alert severity="info">
                  Nenhuma recomendação com os filtros atuais.
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
                            </Box>
                            <Stack direction="row" spacing={0.75}>
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
    </Box>
  );
}
