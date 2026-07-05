import { FC } from 'react';

import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import {
  examRiskRuleCategoryLabels,
  examRiskRuleSourceLabels,
} from '@v2/pages/master/exam-risk-rules/exam-risk-rule-labels';
import type { ICompanyExamRiskGapRiskItem } from '@v2/services/medicine/company-exam-risk-gaps/company-exam-risk-gaps.types';

import {
  companyExamRiskLibraryCoverageColors,
  companyExamRiskLibraryCoverageLabels,
  companyExamRiskSuggestionStatusColors,
  companyExamRiskSuggestionStatusLabels,
  formatCompanyExamRiskDriftFields,
} from './company-exam-risk-gaps-display.util';

type Props = {
  data: ICompanyExamRiskGapRiskItem[];
  isLoading?: boolean;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
};

const MultiLineCell: FC<{ text: string; tooltipMinLength?: number }> = ({
  text,
  tooltipMinLength = 40,
}) => (
  <STextRow text={text} tooltipMinLength={tooltipMinLength} lineNumber={3} />
);

const SuggestionsCell: FC<{ item: ICompanyExamRiskGapRiskItem }> = ({
  item,
}) => {
  if (!item.suggestions.length) {
    return <Typography variant="body2">—</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" gap={0.75}>
      {item.suggestions.map((suggestion) => (
        <Box
          key={suggestion.suggestionKey}
          display="flex"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
        >
          <Typography variant="body2">{suggestion.examName}</Typography>
          <Chip
            size="small"
            label={
              companyExamRiskSuggestionStatusLabels[suggestion.status] ??
              suggestion.status
            }
            color={
              companyExamRiskSuggestionStatusColors[suggestion.status] ??
              'default'
            }
            variant="outlined"
          />
          {suggestion.driftFields.length > 0 && (
            <Tooltip
              title={`Campos divergentes: ${formatCompanyExamRiskDriftFields(suggestion.driftFields)}`}
            >
              <Typography variant="caption" color="text.secondary">
                drift
              </Typography>
            </Tooltip>
          )}
        </Box>
      ))}
    </Box>
  );
};

export const CompanyExamRiskGapsTable: FC<Props> = ({
  data,
  isLoading,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
}) => {
  const tableData: ITableData<ICompanyExamRiskGapRiskItem>[] = [
    {
      column: 'minmax(220px, 1.2fr)',
      header: <STableHRow>Fator de risco</STableHRow>,
      row: (item) => <MultiLineCell text={item.name} />,
    },
    {
      column: '90px',
      header: <STableHRow>Tipo</STableHRow>,
      row: (item) => (
        <STextRow
          text={examRiskRuleCategoryLabels[item.type] ?? item.type}
          lineNumber={1}
        />
      ),
    },
    {
      column: '110px',
      header: <STableHRow>CAS</STableHRow>,
      row: (item) => <STextRow text={item.cas ?? '—'} lineNumber={1} />,
    },
    {
      column: '120px',
      header: <STableHRow>eSocial</STableHRow>,
      row: (item) => <STextRow text={item.esocialCode ?? '—'} lineNumber={1} />,
    },
    {
      column: '150px',
      header: <STableHRow>Cobertura global</STableHRow>,
      row: (item) => (
        <Tooltip title={item.libraryCoverageNotes.join(' · ') || '—'}>
          <Chip
            size="small"
            label={
              companyExamRiskLibraryCoverageLabels[item.libraryCoverage] ??
              item.libraryCoverage
            }
            color={
              companyExamRiskLibraryCoverageColors[item.libraryCoverage] ??
              'default'
            }
            variant="outlined"
          />
        </Tooltip>
      ),
    },
    {
      column: '80px',
      header: <STableHRow>Lacunas</STableHRow>,
      row: (item) => (
        <STextRow text={String(item.missingLinkCount)} lineNumber={1} />
      ),
    },
    {
      column: 'minmax(260px, 1.4fr)',
      header: <STableHRow>Sugestões</STableHRow>,
      row: (item) => <SuggestionsCell item={item} />,
    },
    {
      column: 'minmax(160px, 0.8fr)',
      header: <STableHRow>Referência / fonte</STableHRow>,
      row: (item) => {
        const primary = item.suggestions[0]?.primaryRule;
        if (!primary) {
          return <STextRow text="—" lineNumber={2} />;
        }

        const sourceLabel =
          examRiskRuleSourceLabels[
            primary.ruleSource as keyof typeof examRiskRuleSourceLabels
          ] ?? primary.ruleSource;

        return (
          <Tooltip title={primary.matchReason}>
            <Box>
              <STextRow text={sourceLabel} lineNumber={1} />
              <Typography variant="caption" color="text.secondary">
                {primary.ruleScope}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <STable
        isLoading={isLoading}
        table={tableData}
        data={data}
        renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
        renderBody={({ data: rowsData, rows }) => (
          <STableBody
            rows={rowsData}
            contentEmpty="Nenhum risco encontrado com os filtros atuais."
            renderRow={(row) => (
              <STableRow key={row.riskFactorId} minHeight={48}>
                {rows.map((render) => render(row))}
              </STableRow>
            )}
          />
        )}
      />
      <STablePagination
        isLoading={isLoading}
        total={pagination.total}
        limit={pagination.limit}
        page={pagination.page}
        setPage={setPage}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};
