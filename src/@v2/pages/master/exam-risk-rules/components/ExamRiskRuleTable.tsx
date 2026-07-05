import { FC } from 'react';

import { Box, Checkbox, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import type { IExamRiskRule } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import { ExamRiskRuleSourceEnum } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LaunchIcon from '@mui/icons-material/Launch';
import { useRouter } from 'next/router';
import { RoutesEnum } from 'core/enums/routes.enums';

import {
  examRiskRuleSourceLabels,
  examRiskRuleStatusColors,
  examRiskRuleStatusLabels,
} from '../exam-risk-rule-labels';
import {
  resolveNormativeOriginLabel,
  resolveRiskFactorDisplayName,
} from '../exam-risk-rule-display.util';

type Props = {
  data: IExamRiskRule[];
  isLoading?: boolean;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onEdit: (rule: IExamRiskRule) => void;
  onDelete: (rule: IExamRiskRule) => void;
  onManageReferences: (rule: IExamRiskRule) => void;
  selectedRuleIds?: string[];
  onToggleRule?: (rule: IExamRiskRule, checked: boolean) => void;
  onTogglePage?: (rules: IExamRiskRule[], checked: boolean) => void;
};

/** Resumo legível das fontes complementares ativas de uma regra (Fase 4I). */
const referencesSummary = (rule: IExamRiskRule): string => {
  const refs = rule.references ?? [];
  if (!refs.length) return '';
  const hasAcgih = refs.some((ref) => ref.sourceType === 'ACGIH_BEI');
  return hasAcgih ? `ACGIH/BEI (${refs.length})` : `${refs.length}`;
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

const RiskFactorCell: FC<{ rule: IExamRiskRule }> = ({ rule }) => {
  const displayName = resolveRiskFactorDisplayName(rule);
  const normativeHint = resolveNormativeOriginLabel(rule);

  return (
    <Box>
      <STextRow text={displayName} tooltipMinLength={30} lineNumber={2} />
      {normativeHint && (
        <Typography
          variant="caption"
          color="text.secondary"
          component="div"
          sx={{ lineHeight: 1.25, mt: 0.25 }}
        >
          {normativeHint}
        </Typography>
      )}
    </Box>
  );
};

/** Nomes legíveis dos exames vinculados (usa o snapshot persistido na regra). */
const examDisplayName = (exam: IExamRiskRule['exams'][number]): string =>
  exam.examNameSnapshot?.trim() || 'Exame sem nome';

/**
 * Célula da coluna Exames: 0 → "0" com tooltip; 1 → nome do exame; 2+ →
 * contagem em chip com tooltip listando os nomes vinculados.
 */
const ExamsCell: FC<{ rule: IExamRiskRule }> = ({ rule }) => {
  const exams = rule.exams ?? [];
  const count = exams.length;

  if (count === 0) {
    return (
      <Tooltip title="Nenhum exame vinculado.">
        <span>
          <STextRow text="0" color="text.secondary" />
        </span>
      </Tooltip>
    );
  }

  if (count === 1) {
    const name = examDisplayName(exams[0]);
    return <STextRow text={name} tooltipMinLength={20} lineNumber={2} />;
  }

  const tooltip = (
    <Box>
      <Box component="span" sx={{ fontWeight: 600 }}>
        Exames vinculados:
      </Box>
      {exams.map((exam, index) => (
        <Box key={exam.id ?? index} component="div">
          - {examDisplayName(exam)}
        </Box>
      ))}
    </Box>
  );

  return (
    <Tooltip title={tooltip}>
      <Chip
        size="small"
        variant="outlined"
        label={`${count} exames`}
        sx={{ cursor: 'default' }}
      />
    </Tooltip>
  );
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
  onManageReferences,
  selectedRuleIds = [],
  onToggleRule,
  onTogglePage,
}) => {
  const router = useRouter();

  const pageRuleIds = data.map((rule) => rule.id);
  const selectedOnPageCount = pageRuleIds.filter((id) =>
    selectedRuleIds.includes(id),
  ).length;
  const allPageSelected =
    pageRuleIds.length > 0 && selectedOnPageCount === pageRuleIds.length;

  const tableData: ITableData<IExamRiskRule>[] = [
    {
      column: '54px',
      header: (
        <Checkbox
          size="small"
          checked={allPageSelected}
          indeterminate={selectedOnPageCount > 0 && !allPageSelected}
          disabled={!pageRuleIds.length || !onTogglePage}
          onChange={(event) => onTogglePage?.(data, event.target.checked)}
        />
      ),
      row: (row) => (
        <Checkbox
          size="small"
          checked={selectedRuleIds.includes(row.id)}
          onChange={(event) => onToggleRule?.(row, event.target.checked)}
        />
      ),
    },
    {
      column: 'minmax(240px, 1.1fr)',
      header: <STableHRow>Fator de Risco</STableHRow>,
      row: (row) => <RiskFactorCell rule={row} />,
    },
    {
      column: 'minmax(160px, 0.8fr)',
      header: <STableHRow>Exames</STableHRow>,
      row: (row) => <ExamsCell rule={row} />,
    },
    {
      column: 'minmax(180px, 0.9fr)',
      header: <STableHRow>Fonte</STableHRow>,
      row: (row) => {
        const summary = referencesSummary(row);
        const sourceLabel =
          row.sourceDisplayLabel ??
          examRiskRuleSourceLabels[row.source];
        const sourceOriginType =
          row.sourceOriginType ??
          (row.source === ExamRiskRuleSourceEnum.NR_07 ? 'NR_07' : null);
        const sourceOriginId =
          row.sourceOriginId ??
          (row.source === ExamRiskRuleSourceEnum.NR_07
            ? row.sourceIndicatorId
            : null);
        return (
          <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
            <STextRow text={sourceLabel} lineNumber={1} />
            {sourceOriginType === 'NR_07' && sourceOriginId && (
                <Tooltip title="Abrir indicador NR-7 de origem">
                  <IconButton
                    size="small"
                    onClick={() =>
                      router.push(
                        `${RoutesEnum.DATABASE_BIOLOGICAL_INDICATORS}/${sourceOriginId}`,
                      )
                    }
                  >
                    <LaunchIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            {row.sourceOriginType === 'ACGIH_BEI' && row.sourceOriginId && (
              <Tooltip title="Abrir indicador ACGIH/BEI de origem">
                <IconButton
                  size="small"
                  onClick={() =>
                    router.push(
                      `${RoutesEnum.DATABASE_ACGIH_BEI_INDICATORS}?id=${row.sourceOriginId}`,
                    )
                  }
                >
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {row.isCurated && (
              <Tooltip title="Regra editada manualmente (não sobrescrita pelo sync)">
                <Chip size="small" color="info" label="Curada" />
              </Tooltip>
            )}
            {summary && (
              <Tooltip title="Ver fontes complementares (evidências técnicas)">
                <Chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  label={`+ ${summary}`}
                  onClick={() => onManageReferences(row)}
                />
              </Tooltip>
            )}
          </Box>
        );
      },
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
