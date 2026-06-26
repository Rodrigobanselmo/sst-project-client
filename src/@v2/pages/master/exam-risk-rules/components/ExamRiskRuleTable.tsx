import { FC } from 'react';

import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import type { IExamRiskRule } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import { ExamRiskRuleScopeEnum } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
  examRiskRuleCategoryLabels,
  examRiskRuleScopeLabels,
  examRiskRuleSourceLabels,
  examRiskRuleStatusColors,
  examRiskRuleStatusLabels,
} from '../exam-risk-rule-labels';

type Props = {
  data: IExamRiskRule[];
  isLoading?: boolean;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onEdit: (rule: IExamRiskRule) => void;
  onDelete: (rule: IExamRiskRule) => void;
};

const collectionLabel = (rule: IExamRiskRule): string => {
  const exam = rule.exams?.[0];
  if (!exam) return '—';
  const parts: string[] = [];
  if (exam.collectionToleranceDays != null) {
    parts.push(`${exam.collectionToleranceDays} dias`);
  }
  if (exam.collectionMoment) parts.push(exam.collectionMoment);
  return parts.length ? parts.join(' · ') : '—';
};

const referenceLabel = (rule: IExamRiskRule): string => {
  switch (rule.scope) {
    case ExamRiskRuleScopeEnum.RISK:
      return rule.riskNameSnapshot ?? rule.riskFactorId ?? '—';
    case ExamRiskRuleScopeEnum.CATEGORY:
      return rule.riskCategory
        ? examRiskRuleCategoryLabels[rule.riskCategory]
        : '—';
    case ExamRiskRuleScopeEnum.GROUP:
      return rule.subTypeNameSnapshot ?? String(rule.riskSubTypeId ?? '—');
    case ExamRiskRuleScopeEnum.AGENT:
      return (
        rule.agentName ?? rule.agentCas ?? '—'
      );
    default:
      return '—';
  }
};

export const ExamRiskRuleTable: FC<Props> = ({
  data,
  isLoading,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
  onEdit,
  onDelete,
}) => {
  const tableData: ITableData<IExamRiskRule>[] = [
    {
      column: '150px',
      header: <STableHRow>Escopo</STableHRow>,
      row: (row) => (
        <STextRow text={examRiskRuleScopeLabels[row.scope]} lineNumber={1} />
      ),
    },
    {
      column: 'minmax(220px, 1fr)',
      header: <STableHRow>Referência</STableHRow>,
      row: (row) => (
        <STextRow text={referenceLabel(row)} tooltipMinLength={30} lineNumber={2} />
      ),
    },
    {
      column: '120px',
      header: <STableHRow justify="center">Exames</STableHRow>,
      row: (row) => (
        <STextRow text={String(row.exams?.length ?? 0)} justify="center" />
      ),
    },
    {
      column: '140px',
      header: <STableHRow>Fonte</STableHRow>,
      row: (row) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <STextRow text={examRiskRuleSourceLabels[row.source]} lineNumber={1} />
          {row.isCurated && (
            <Tooltip title="Regra editada manualmente (não sobrescrita pelo sync)">
              <Chip size="small" color="info" label="Curada" />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      column: 'minmax(140px, 0.6fr)',
      header: <STableHRow>Coleta</STableHRow>,
      row: (row) => (
        <STextRow text={collectionLabel(row)} tooltipMinLength={20} lineNumber={1} />
      ),
    },
    {
      column: '120px',
      header: <STableHRow justify="center">Status</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Chip
            size="small"
            color={examRiskRuleStatusColors[row.status]}
            label={examRiskRuleStatusLabels[row.status]}
          />
        </Box>
      ),
    },
    {
      column: '110px',
      header: <STableHRow justify="center">Ações</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" gap={0.5} width="100%">
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton size="small" color="error" onClick={() => onDelete(row)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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
            contentEmpty="Nenhuma regra encontrada com os filtros atuais."
            renderRow={(row) => (
              <STableRow key={row.id} minHeight={40}>
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
