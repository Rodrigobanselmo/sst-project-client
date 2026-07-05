import { FC, useState } from 'react';

import {
  Alert,
  Box,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { examRiskRuleCategoryLabels } from '@v2/pages/master/exam-risk-rules/exam-risk-rule-labels';
import { useFetchCompanyExamRiskGaps } from '@v2/services/medicine/company-exam-risk-gaps/hooks/useFetchCompanyExamRiskGaps';
import {
  CompanyExamRiskSuggestionStatusEnum,
  IBrowseCompanyExamRiskGapsParams,
} from '@v2/services/medicine/company-exam-risk-gaps/company-exam-risk-gaps.types';
import { ExamRiskRuleCategoryEnum } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

import { companyExamRiskSuggestionStatusLabels } from './company-exam-risk-gaps-display.util';
import { CompanyExamRiskGapsSummaryCards } from './CompanyExamRiskGapsSummaryCards';
import { CompanyExamRiskGapsTable } from './CompanyExamRiskGapsTable';

const ALL = 'ALL';

type Props = {
  companyId: string;
};

export const CompanyExamRiskGapsPanel: FC<Props> = ({ companyId }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [type, setType] = useState<ExamRiskRuleCategoryEnum | typeof ALL>(ALL);
  const [suggestionStatus, setSuggestionStatus] = useState<
    CompanyExamRiskSuggestionStatusEnum | typeof ALL
  >(ALL);
  const [actionableOnly, setActionableOnly] = useState(false);
  const [includeConfigDrift, setIncludeConfigDrift] = useState(true);

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_EXAM_RISK);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const params: IBrowseCompanyExamRiskGapsParams = {
    companyId,
    page,
    limit: pageLimit,
    search: search.trim() || undefined,
    type: type === ALL ? undefined : type,
    suggestionStatus:
      suggestionStatus === ALL ? undefined : suggestionStatus,
    actionableOnly,
    includeConfigDrift,
    onlyPcmso: true,
  };

  const { data, isLoading, isError } = useFetchCompanyExamRiskGaps(
    params,
    Boolean(companyId),
  );

  const hasNoLinksContext =
    !isLoading &&
    !isError &&
    data?.summary.totalRisks === 0 &&
    data?.summary.totalSuggestions === 0;

  const hasNoGaps =
    !isLoading &&
    !isError &&
    (data?.summary.totalRisks ?? 0) > 0 &&
    (data?.summary.missingLinks ?? 0) === 0 &&
    actionableOnly;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box>
        <Typography variant="h6">Lacunas / Sugestões</Typography>
        <Typography variant="body2" color="text.secondary">
          Diagnóstico read-only que compara os vínculos desta empresa com a
          Biblioteca global ACTIVE. Não cria nem altera vínculos nesta fase.
        </Typography>
      </Box>

      {data?.meta.truncated && (
        <Alert severity="warning">
          {data.meta.truncationMessage ??
            'A análise foi limitada por desempenho.'}
        </Alert>
      )}

      {isError && (
        <Alert severity="error">
          Não foi possível carregar as lacunas. Verifique a permissão Exames ×
          Riscos (4.8) e tente novamente.
        </Alert>
      )}

      <CompanyExamRiskGapsSummaryCards
        summary={data?.summary}
        isLoading={isLoading}
      />

      <Paper sx={{ p: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
          <TextField
            label="Buscar risco, CAS, eSocial ou exame"
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
            label="Status da sugestão"
            value={suggestionStatus}
            onChange={(event) => {
              setSuggestionStatus(
                event.target.value as
                  | CompanyExamRiskSuggestionStatusEnum
                  | typeof ALL,
              );
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: 220 }}
          >
            <MenuItem value={ALL}>Todos</MenuItem>
            {Object.values(CompanyExamRiskSuggestionStatusEnum).map((value) => (
              <MenuItem key={value} value={value}>
                {companyExamRiskSuggestionStatusLabels[value]}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={actionableOnly}
                onChange={(event) => {
                  setActionableOnly(event.target.checked);
                  setPage(1);
                }}
              />
            }
            label="Somente lacunas acionáveis"
          />
          <FormControlLabel
            control={
              <Switch
                checked={includeConfigDrift}
                onChange={(event) => {
                  setIncludeConfigDrift(event.target.checked);
                  setPage(1);
                }}
              />
            }
            label="Exibir divergências de config"
          />
        </Box>

        {hasNoLinksContext && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Nenhum risco no contexto de exames desta empresa. Cadastre vínculos
            na aba Riscos e Exames para analisar lacunas com base na Biblioteca
            global.
          </Alert>
        )}

        {hasNoGaps && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Nenhuma lacuna acionável encontrada com os filtros atuais.
          </Alert>
        )}

        <CompanyExamRiskGapsTable
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
        />
      </Paper>
    </Box>
  );
};
