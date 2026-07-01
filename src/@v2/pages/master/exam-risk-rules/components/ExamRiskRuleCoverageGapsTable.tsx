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
import type { IExamRiskRuleCoverageGapItem } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule-coverage-gaps.types';

import { examRiskRuleCategoryLabels } from '../exam-risk-rule-labels';
import {
  formatBiologicalIndicators,
  formatCoverageReasons,
  formatSubTypes,
  resolveExamRiskRuleCoverageDisplay,
} from '../exam-risk-rule-coverage-display.util';

type Props = {
  data: IExamRiskRuleCoverageGapItem[];
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

export const ExamRiskRuleCoverageGapsTable: FC<Props> = ({
  data,
  isLoading,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
}) => {
  const tableData: ITableData<IExamRiskRuleCoverageGapItem>[] = [
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
      column: '110px',
      header: <STableHRow>eSocial</STableHRow>,
      row: (item) => <STextRow text={item.esocialCode ?? '—'} lineNumber={1} />,
    },
    {
      column: 'minmax(130px, 0.8fr)',
      header: <STableHRow>Subtipos</STableHRow>,
      row: (item) => <MultiLineCell text={formatSubTypes(item.subTypes)} />,
    },
    {
      column: 'minmax(170px, 0.9fr)',
      header: <STableHRow>Cobertura</STableHRow>,
      row: (item) => {
        const display = resolveExamRiskRuleCoverageDisplay(item);
        return (
          <Tooltip
            title={
              item.matchedRuleScopes.length
                ? `Escopos: ${item.matchedRuleScopes.join(', ')}`
                : display.label
            }
          >
            <Chip
              size="small"
              label={display.label}
              color={display.chipColor}
              variant={display.tier.startsWith('GENERIC') ? 'outlined' : 'filled'}
            />
          </Tooltip>
        );
      },
    },
    {
      column: 'minmax(200px, 1fr)',
      header: <STableHRow>Motivo</STableHRow>,
      row: (item) => (
        <MultiLineCell text={formatCoverageReasons(item.coverageReasons)} />
      ),
    },
    {
      column: 'minmax(170px, 0.9fr)',
      header: <STableHRow>Exames da regra</STableHRow>,
      row: (item) => (
        <MultiLineCell
          text={
            item.matchedExamNames.length > 0
              ? item.matchedExamNames.join(', ')
              : '—'
          }
        />
      ),
    },
    {
      column: 'minmax(200px, 1fr)',
      header: <STableHRow>Indicadores biológicos</STableHRow>,
      row: (item) => (
        <Box>
          <MultiLineCell
            text={formatBiologicalIndicators(item.confirmedBiologicalIndicators)}
          />
          {item.hasConfirmedBiologicalIndicator && (
            <Typography variant="caption" color="text.secondary">
              {item.confirmedBiologicalIndicatorCount} indicador(es) ·{' '}
              {item.confirmedExamCount} exame(s)
            </Typography>
          )}
        </Box>
      ),
    },
    {
      column: 'minmax(180px, 0.9fr)',
      header: <STableHRow>Observações</STableHRow>,
      row: (item) => (
        <MultiLineCell
          text={item.notes.length > 0 ? item.notes.join(' · ') : '—'}
        />
      ),
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
