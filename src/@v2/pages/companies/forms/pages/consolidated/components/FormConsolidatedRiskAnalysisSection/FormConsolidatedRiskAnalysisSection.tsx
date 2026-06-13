import { useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useAccess } from 'core/hooks/useAccess';
import { useFetchConsolidatedViewRiskAnalysis } from '@v2/services/enterprise/company-group/consolidated-view/hooks/useFetchConsolidatedViewRiskAnalysis';
import { buildConsolidatedRiskNarrativeScopeFromView } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-risk-narrative.scope';
import SText from 'components/atoms/SText';

import { ConsolidatedRiskFactorAccordion } from './ConsolidatedRiskFactorAccordion';
import {
  buildConsolidatedRiskFactorGroups,
  buildConsolidatedRiskViewSections,
  CONSOLIDATED_RISK_GROUP_BY_LABELS,
  ConsolidatedRiskGroupByMode,
  filterConsolidatedRiskItems,
  toNarrativeGroupingMode,
} from './consolidated-risk-analysis.utils';
import { FormConsolidatedRiskNarrativeSection } from './FormConsolidatedRiskNarrativeSection';

type Props = {
  companyGroupId: number;
  applicationIds: string[];
};

export function FormConsolidatedRiskAnalysisSection({
  companyGroupId,
  applicationIds,
}: Props) {
  const { isMaster } = useAccess();
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupBy, setGroupBy] = useState<ConsolidatedRiskGroupByMode>('none');

  const { riskAnalysisData, isLoading, isError } =
    useFetchConsolidatedViewRiskAnalysis(
      { companyGroupId, applicationIds },
      { enabled: companyGroupId > 0 && applicationIds.length >= 2 },
    );

  const filteredItems = useMemo(
    () =>
      filterConsolidatedRiskItems(riskAnalysisData?.items ?? [], {
        search,
        companyFilter,
        applicationFilter,
        riskLevelFilter,
        statusFilter,
      }),
    [
      applicationFilter,
      companyFilter,
      riskAnalysisData?.items,
      riskLevelFilter,
      search,
      statusFilter,
    ],
  );

  const viewSections = useMemo(
    () => buildConsolidatedRiskViewSections(filteredItems, groupBy),
    [filteredItems, groupBy],
  );

  const narrativeScope = useMemo(
    () =>
      buildConsolidatedRiskNarrativeScopeFromView({
        groupingMode: toNarrativeGroupingMode(groupBy),
        companyFilter,
        applicationFilter,
        riskLevelFilter,
        statusFilter,
        search,
      }),
    [
      applicationFilter,
      companyFilter,
      groupBy,
      riskLevelFilter,
      search,
      statusFilter,
    ],
  );

  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    riskAnalysisData?.items.forEach((item) => {
      map.set(item.companyId, item.companyName);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [riskAnalysisData?.items]);

  const applicationOptions = useMemo(() => {
    const map = new Map<string, string>();
    riskAnalysisData?.items.forEach((item) => {
      map.set(item.formApplicationId, item.applicationName);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [riskAnalysisData?.items]);

  const riskLevelOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (riskAnalysisData?.items ?? []).map((item) => item.occupationalRisk),
        ),
      ).sort((left, right) => left.localeCompare(right, 'pt-BR')),
    [riskAnalysisData?.items],
  );

  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (riskAnalysisData?.items ?? []).map(
            (item) => item.status || 'Sem análise registrada',
          ),
        ),
      ).sort((left, right) => left.localeCompare(right, 'pt-BR')),
    [riskAnalysisData?.items],
  );

  if (isLoading) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Não foi possível carregar a análise de riscos consolidada.
      </Alert>
    );
  }

  if (!riskAnalysisData) {
    return null;
  }

  const warnings = riskAnalysisData.warnings ?? [];
  const hasWarnings = warnings.length > 0;
  const isEmpty = !riskAnalysisData.summary.hasData;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {hasWarnings && (
        <Alert severity="warning">
          Algumas aplicações não puderam ser incluídas na consolidação:
          <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
            {warnings.map((warning) => (
              <li key={warning.formApplicationId}>
                {warning.companyName} — {warning.applicationName}:{' '}
                {warning.message}
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {isEmpty && !hasWarnings && (
        <Alert severity="info">
          Não há análises de risco registradas nas aplicações individuais elegíveis
          para esta visão consolidada.
        </Alert>
      )}

      {!isEmpty && (
        <>
          <Alert severity="info" variant="outlined">
            Visão consolidada read-only. Os riscos exibidos foram gerados nas
            aplicações individuais e não são recalculados nesta tela. Decisões
            operacionais, inventário e PGR permanecem nas aplicações individuais.
          </Alert>

          <SPaper shadow={false} sx={{ p: 2.5 }}>
            <SText fontSize={14} fontWeight={600} mb={1}>
              Resumo consolidado
            </SText>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                size="small"
                variant="outlined"
                label={`${riskAnalysisData.summary.totalApplications} aplicações`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${riskAnalysisData.summary.totalCompanies} empresas`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${filteredItems.length} registros consolidados de leitura`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${riskAnalysisData.summary.totalRiskFactors} fatores de risco`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${riskAnalysisData.summary.totalSectors ?? 0} setores/unidades`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${riskAnalysisData.summary.totalRiskAnalyses} análises IA já registradas`}
              />
              {hasWarnings && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={`${warnings.length} avisos`}
                />
              )}
            </Box>
          </SPaper>

          <FormConsolidatedRiskNarrativeSection
            companyGroupId={companyGroupId}
            applicationIds={applicationIds}
            scope={narrativeScope}
            isMaster={isMaster}
          />

          <SPaper shadow={false} sx={{ p: 2 }}>
            <SText fontSize={14} fontWeight={600} mb={1.5}>
              Agrupamento e filtros
            </SText>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                md: 'repeat(3, minmax(0, 1fr))',
              }}
              gap={2}
            >
              <TextField
                size="small"
                label="Buscar"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Empresa, setor, fator, fonte..."
              />

              <FormControl size="small">
                <InputLabel id="consolidated-risk-company-filter">
                  Empresa
                </InputLabel>
                <Select
                  labelId="consolidated-risk-company-filter"
                  label="Empresa"
                  value={companyFilter}
                  onChange={(event) => setCompanyFilter(event.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {companyOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="consolidated-risk-application-filter">
                  Aplicação
                </InputLabel>
                <Select
                  labelId="consolidated-risk-application-filter"
                  label="Aplicação"
                  value={applicationFilter}
                  onChange={(event) => setApplicationFilter(event.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {applicationOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="consolidated-risk-level-filter">
                  Nível de risco
                </InputLabel>
                <Select
                  labelId="consolidated-risk-level-filter"
                  label="Nível de risco"
                  value={riskLevelFilter}
                  onChange={(event) => setRiskLevelFilter(event.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {riskLevelOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="consolidated-risk-status-filter">
                  Status
                </InputLabel>
                <Select
                  labelId="consolidated-risk-status-filter"
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="consolidated-risk-group-by">
                  Organizar por
                </InputLabel>
                <Select
                  labelId="consolidated-risk-group-by"
                  label="Organizar por"
                  value={groupBy}
                  onChange={(event) =>
                    setGroupBy(event.target.value as ConsolidatedRiskGroupByMode)
                  }
                >
                  {Object.entries(CONSOLIDATED_RISK_GROUP_BY_LABELS).map(
                    ([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Box>
          </SPaper>

          {filteredItems.length === 0 ? (
            <Alert severity="info">
              Nenhum registro encontrado para os filtros selecionados.
            </Alert>
          ) : (
            <SFlex direction="column" gap={2}>
              {viewSections.map((section) => {
                const factorGroups = buildConsolidatedRiskFactorGroups(
                  section.items,
                );

                return (
                  <Box key={section.key}>
                    {section.label && (
                      <SText fontSize={16} fontWeight={700} mb={1.5}>
                        {section.label} ({section.items.length})
                      </SText>
                    )}

                    <SFlex direction="column" gap={1.5}>
                      {factorGroups.map((group, index) => (
                        <ConsolidatedRiskFactorAccordion
                          key={`${section.key}-${group.riskFactorId}`}
                          group={group}
                          defaultExpanded={index === 0 && section.key === 'all'}
                        />
                      ))}
                    </SFlex>
                  </Box>
                );
              })}
            </SFlex>
          )}

          <Typography variant="caption" color="text.secondary">
            Leitura gerencial read-only. Os cards exibem análises já existentes nas
            aplicações individuais, com rastreabilidade por empresa, aplicação,
            estabelecimento e setor.
          </Typography>
        </>
      )}
    </Box>
  );
}
