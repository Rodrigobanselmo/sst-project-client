import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import { Button, Chip } from '@mui/material';

import {
  canOpenUseScenarioBoardRow,
  formatActivityRiskFactorsListCell,
  formatUseScenarioBoardStatusChip,
  getScenarioActivityRiskFactors,
  isPendingSurveyBoardRow,
} from './chemical-use-scenario-activity-risk.util';
import {
  formatUseScenarioBoardExposureGroupCell,
  type UseScenarioBoardViewSort,
  type UseScenarioBoardViewSortField,
} from './chemical-use-scenario-board-view.util';
import {
  ChemicalUseScenarioColumnMap as columnMap,
  ChemicalUseScenarioColumnsEnum as columnsEnum,
  getHiddenChemicalUseScenarioColumn,
} from './chemical-use-scenario-table-columns';
import { ChemicalUseScenarioTableHeaderRow } from './ChemicalUseScenarioTableHeaderRow';

const pendingStatusChipSx = {
  backgroundColor: 'error.main',
  color: 'common.white',
  border: '1px solid',
  borderColor: 'error.main',
} as const;

function formatFrequencyCell(row: ChemicalUseScenarioBoardRow) {
  return row.frequencyCount != null
    ? `${row.frequencyCount} ${row.frequencyPeriod || ''}`.trim()
    : '—';
}

function formatDurationCell(row: ChemicalUseScenarioBoardRow) {
  return row.durationMinutes != null ? `${row.durationMinutes} min` : '—';
}

function formatQuantityCell(row: ChemicalUseScenarioBoardRow) {
  return row.quantity ? `${row.quantity} ${row.quantityUnit || ''}`.trim() : '—';
}

function formatSourceRowsCell(row: ChemicalUseScenarioBoardRow) {
  return (row.sourceRows || []).join(', ') || '—';
}

export function ChemicalUseScenariosTable({
  rows,
  isLoading,
  hiddenColumns,
  sort,
  onSortField,
  emptyMessage,
  onOpen,
}: {
  rows: ChemicalUseScenarioBoardRow[];
  isLoading: boolean;
  hiddenColumns: Record<columnsEnum, boolean>;
  sort: UseScenarioBoardViewSort | null;
  onSortField: (field: UseScenarioBoardViewSortField) => void;
  emptyMessage: string;
  onOpen: (row: ChemicalUseScenarioBoardRow) => void;
}) {
  const hidden = (column: columnsEnum) =>
    Boolean(getHiddenChemicalUseScenarioColumn(hiddenColumns, column));

  const tableRows: ITableData<ChemicalUseScenarioBoardRow>[] = [
    {
      column: 'minmax(160px, 1.3fr)',
      hidden: hidden(columnsEnum.PRODUCT),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.PRODUCT].label}
          field="product"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          lineNumber={2}
          tooltipMinLength={20}
          text={row.product?.tradeName || '—'}
        />
      ),
    },
    {
      column: 'minmax(180px, 1.4fr)',
      hidden: hidden(columnsEnum.RISK_FACTORS),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.RISK_FACTORS].label}
          field="riskFactors"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          lineNumber={2}
          tooltipMinLength={24}
          text={formatActivityRiskFactorsListCell(
            getScenarioActivityRiskFactors(row),
            row,
          )}
        />
      ),
    },
    {
      column: 'minmax(120px, 1fr)',
      hidden: hidden(columnsEnum.ACTIVITY),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.ACTIVITY].label}
          field="activity"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow fontSize={13} lineNumber={2} text={row.activityName || '—'} />
      ),
    },
    {
      column: 'minmax(110px, 1fr)',
      hidden: hidden(columnsEnum.SECTOR),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.SECTOR].label}
          field="sector"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          lineNumber={2}
          text={row.sectorSnapshot || '—'}
        />
      ),
    },
    {
      column: 'minmax(90px, 0.8fr)',
      hidden: hidden(columnsEnum.EXPOSURE_GROUP),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.EXPOSURE_GROUP].label}
          field="exposureGroup"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          lineNumber={1}
          text={formatUseScenarioBoardExposureGroupCell(row)}
        />
      ),
    },
    {
      column: 'minmax(90px, 0.7fr)',
      hidden: hidden(columnsEnum.FREQUENCY),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.FREQUENCY].label}
          field="frequency"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow fontSize={13} lineNumber={1} text={formatFrequencyCell(row)} />
      ),
    },
    {
      column: 'minmax(88px, 0.6fr)',
      hidden: hidden(columnsEnum.DURATION),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.DURATION].label}
          field="duration"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow fontSize={13} lineNumber={1} text={formatDurationCell(row)} />
      ),
    },
    {
      column: 'minmax(80px, 0.6fr)',
      hidden: hidden(columnsEnum.QUANTITY),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.QUANTITY].label}
          field="quantity"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow fontSize={13} lineNumber={1} text={formatQuantityCell(row)} />
      ),
    },
    {
      column: 'minmax(80px, 0.6fr)',
      hidden: hidden(columnsEnum.SOURCE_ROWS),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.SOURCE_ROWS].label}
          field="sourceRows"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          lineNumber={1}
          text={formatSourceRowsCell(row)}
        />
      ),
    },
    {
      column: 'minmax(180px, 200px)',
      hidden: hidden(columnsEnum.STATUS),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.STATUS].label}
          field="status"
          sort={sort}
          onSortField={onSortField}
          justify="center"
        />
      ),
      row: (row) => {
        const pending = isPendingSurveyBoardRow(row);
        return (
          <SFlex justify="center">
            <Chip
              size="small"
              label={formatUseScenarioBoardStatusChip(row)}
              color={pending ? 'error' : 'default'}
              variant="filled"
              sx={pending ? pendingStatusChipSx : undefined}
            />
          </SFlex>
        );
      },
    },
    {
      column: 'minmax(92px, 92px)',
      hidden: hidden(columnsEnum.ACTIONS),
      header: (
        <ChemicalUseScenarioTableHeaderRow
          text={columnMap[columnsEnum.ACTIONS].label}
          sort={sort}
          justify="flex-end"
        />
      ),
      row: (row) => (
        <SFlex justify="flex-end">
          {canOpenUseScenarioBoardRow(row) ? (
            <Button size="small" onClick={() => onOpen(row)}>
              Abrir
            </Button>
          ) : null}
        </SFlex>
      ),
    },
  ];

  return (
    <STable
      isLoading={isLoading}
      table={tableRows}
      data={rows}
      renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
      renderBody={({ data, rows: renderers }) => (
        <STableBody
          rows={data}
          contentEmpty={<SText color="text.secondary">{emptyMessage}</SText>}
          renderRow={(row) => (
            <STableRow
              key={row.id}
              minHeight={52}
              sx={{
                '&:hover': {
                  backgroundColor: 'background.box',
                },
              }}
            >
              {renderers.map((render) => render(row))}
            </STableRow>
          )}
        />
      )}
    />
  );
}
