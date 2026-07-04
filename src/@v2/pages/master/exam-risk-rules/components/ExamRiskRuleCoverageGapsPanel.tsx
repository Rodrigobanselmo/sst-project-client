import { FC, useMemo, useState } from 'react';

import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useFetchExamRiskRuleCoverageGaps } from '@v2/services/medicine/exam-risk-rule/hooks/useFetchExamRiskRuleCoverageGaps';
import {
  ExamRiskRuleCoverageStatusEnum,
  IExamRiskRuleCoverageGapItem,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule-coverage-gaps.types';
import { ExamRiskRuleCategoryEnum } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

import { examRiskRuleCategoryLabels } from '../exam-risk-rule-labels';
import { ExamRiskRuleRiskToExamAiAssistantDialog } from './ExamRiskRuleRiskToExamAiAssistantDialog';
import { ExamRiskRuleCoverageGapsTable } from './ExamRiskRuleCoverageGapsTable';
import { ExamRiskRuleCoverageSummaryCards } from './ExamRiskRuleCoverageSummaryCards';

const ALL = 'ALL';

const coverageStatusLabels: Record<ExamRiskRuleCoverageStatusEnum, string> = {
  [ExamRiskRuleCoverageStatusEnum.COVERED_BY_RULE]: 'Coberto por regra',
  [ExamRiskRuleCoverageStatusEnum.INDIRECT_BIOLOGICAL_ONLY]:
    'Cobertura indireta',
  [ExamRiskRuleCoverageStatusEnum.UNCOVERED]: 'Sem cobertura',
};

export const ExamRiskRuleCoverageGapsPanel: FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [type, setType] = useState<ExamRiskRuleCategoryEnum | typeof ALL>(ALL);
  const [coverageStatus, setCoverageStatus] = useState<
    ExamRiskRuleCoverageStatusEnum | typeof ALL
  >(ALL);
  const [includeIndirect, setIncludeIndirect] = useState(true);
  const [onlyPcmso, setOnlyPcmso] = useState(true);
  const [riskToExamAssistantOpen, setRiskToExamAssistantOpen] = useState(false);
  const [selectedRisksById, setSelectedRisksById] = useState<
    Record<string, IExamRiskRuleCoverageGapItem>
  >({});

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_EXAM_RISK_RULES);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const { data, isLoading } = useFetchExamRiskRuleCoverageGaps({
    page,
    limit: pageLimit,
    search: search.trim() || undefined,
    type: type === ALL ? undefined : type,
    coverageStatus: coverageStatus === ALL ? undefined : coverageStatus,
    includeIndirect,
    onlyPcmso,
  });

  const selectedRisks = useMemo(
    () => Object.values(selectedRisksById),
    [selectedRisksById],
  );

  const selectedRiskIds = useMemo(
    () => selectedRisks.map((risk) => risk.riskFactorId),
    [selectedRisks],
  );

  const handleToggleRisk = (riskFactorId: string, checked: boolean) => {
    const risk = data?.items.find((item) => item.riskFactorId === riskFactorId);
    setSelectedRisksById((current) => {
      const next = { ...current };
      if (!checked) {
        delete next[riskFactorId];
        return next;
      }
      if (risk) next[riskFactorId] = risk;
      return next;
    });
  };

  const handleTogglePage = (riskFactorIds: string[], checked: boolean) => {
    setSelectedRisksById((current) => {
      const next = { ...current };
      if (!checked) {
        riskFactorIds.forEach((riskFactorId) => delete next[riskFactorId]);
        return next;
      }
      data?.items
        .filter((item) => riskFactorIds.includes(item.riskFactorId))
        .forEach((risk) => {
          next[risk.riskFactorId] = risk;
        });
      return next;
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box>
        <Typography variant="h6">Cobertura / Gaps</Typography>
        <Typography variant="body2" color="text.secondary">
          Riscos globais do catálogo SimpleSST relevantes para PCMSO e sua
          cobertura na Biblioteca Risco × Exame. Leitura apenas — não cria nem
          edita regras.
        </Typography>
      </Box>

      <ExamRiskRuleCoverageSummaryCards
        summary={data?.summary}
        isLoading={isLoading}
      />

      <Paper sx={{ p: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
          <TextField
            label="Buscar nome, CAS ou eSocial"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            label="Tipo"
            value={type}
            onChange={(event) => {
              setType(event.target.value as ExamRiskRuleCategoryEnum | typeof ALL);
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value={ALL}>Todos</MenuItem>
            {Object.values(ExamRiskRuleCategoryEnum).map((value) => (
              <MenuItem key={value} value={value}>
                {examRiskRuleCategoryLabels[value]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status de cobertura"
            value={coverageStatus}
            onChange={(event) => {
              setCoverageStatus(
                event.target.value as ExamRiskRuleCoverageStatusEnum | typeof ALL,
              );
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value={ALL}>Todos</MenuItem>
            {Object.values(ExamRiskRuleCoverageStatusEnum).map((value) => (
              <MenuItem key={value} value={value}>
                {coverageStatusLabels[value]}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={includeIndirect}
                onChange={(event) => {
                  setIncludeIndirect(event.target.checked);
                  setPage(1);
                }}
              />
            }
            label="Incluir cobertura indireta na lista"
          />
          <FormControlLabel
            control={
              <Switch
                checked={onlyPcmso}
                onChange={(event) => {
                  setOnlyPcmso(event.target.checked);
                  setPage(1);
                }}
              />
            }
            label="Somente riscos PCMSO"
          />
          <Button
            variant="contained"
            disabled={selectedRisks.length === 0}
            onClick={() => {
              if (selectedRisks.length > 0) setRiskToExamAssistantOpen(true);
            }}
          >
            Sugerir exames com IA
          </Button>
          {selectedRisks.length > 0 && (
            <Button
              variant="text"
              onClick={() => setSelectedRisksById({})}
            >
              Limpar seleção ({selectedRisks.length})
            </Button>
          )}
        </Box>

        <ExamRiskRuleCoverageGapsTable
          data={data?.items ?? []}
          isLoading={isLoading}
          pagination={{
            total: data?.count ?? 0,
            limit: pageLimit,
            page,
          }}
          setPage={setPage}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
          selectedRiskIds={selectedRiskIds}
          onToggleRisk={handleToggleRisk}
          onTogglePage={handleTogglePage}
        />
      </Paper>

      <ExamRiskRuleRiskToExamAiAssistantDialog
        open={riskToExamAssistantOpen}
        onClose={() => setRiskToExamAssistantOpen(false)}
        selectedRisks={selectedRisks}
      />
    </Box>
  );
};
