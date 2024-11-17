import { FC } from 'react';

import { SInputNumberButtonRow } from '../../addons/addons-rows/SInputNumberButtonRow/SInputNumberButtonRow';
import { SSelectHRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectHRow';
import { SSelectRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectRow';
import { SStatusButtonRow } from '../../addons/addons-rows/SStatusButtonRow/SStatusButtonRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { ActionPlanHeaderRow } from './components/ActionPlanHeaderRow/ActionPlanHeaderRow';
import { ActionPlanColumnsEnum as columnsEnum } from './enums/action-plan-columns.enum';
import { ActionPlanColumnMap as columnMap } from './maps/action-plan-column-map';
import { HirarchyTypeMap } from './maps/hierarchy-type-map';
import { IActionPlanTableTableProps } from './SActionPlanTable.types';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/browse-action-plan/service/browse-action-plan.types';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { SOcupationalRiskTag } from '@v2/components/molecules/SOcupationalRiskTag/SOcupationalRiskTag';
import { SSelectButtonRow } from '../../addons/addons-rows/SSelectButtonRow/SSelectButtonRow';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import {
  ActionPlanStatusTypeList,
  ActionPlanStatusTypeMap,
} from './maps/action-plan-status-type-map';
import { SUserButtonRow } from '../../addons/addons-rows/SUserButtonRow/SUserButtonRow';
import { SDatePickerRow } from '../../addons/addons-rows/SDatePickerRow/SDatePickerRow';

export const SActionPlanTable: FC<IActionPlanTableTableProps> = ({
  data = [],
  table,
  filters,
  setFilters,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  onEditStatus,
  onEditPosition,
  onSelectRow,
  hiddenColumns,
  filterColumns,
  setHiddenColumns,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<ActionPlanBrowseResultModel>[] = [
    // CHECK_BOX
    {
      column: '20px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CHECK_BOX),
      header: <SSelectHRow table={table} ids={data.map((row) => row.id)} />,
      row: (row) => <SSelectRow table={table} id={row.id} />,
    },
    // ORIGIN
    {
      column: 'minmax(200px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.ORIGIN),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={ActionPlanOrderByEnum.ORIGIN}
          text={columnMap[columnsEnum.ORIGIN].label}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          tooltipMinLength={20}
          lineNumber={1}
          text={row.origin.name}
          bottomText={row.originType}
        />
      ),
    },
    // DIRECTORY
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.DIRECTORY),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.DIRECTORY].label}
        />
      ),
      row: (row) => {
        const hierarchy = row.directories.map((h) => h.name).join(', ');
        return (
          <STextRow tooltipMinLength={20} fontSize={13} text={hierarchy} />
        );
      },
    },
    // MANAGEMENT
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.MANAGEMENT),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.MANAGEMENT].label}
        />
      ),
      row: (row) => {
        const hierarchy = row.managers.map((h) => h.name).join(', ');
        return (
          <STextRow tooltipMinLength={20} fontSize={13} text={hierarchy} />
        );
      },
    },
    // SECTOR
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.SECTOR),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.SECTOR].label}
        />
      ),
      row: (row) => {
        const hierarchy = row.sectors.map((h) => h.name).join(', ');
        return (
          <STextRow tooltipMinLength={20} fontSize={13} text={hierarchy} />
        );
      },
    },
    // SUB SECTOR
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.SUB_SECTOR),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.SUB_SECTOR].label}
        />
      ),
      row: (row) => {
        const hierarchy = row.subSectors.map((h) => h.name).join(', ');
        return (
          <STextRow tooltipMinLength={20} fontSize={13} text={hierarchy} />
        );
      },
    },
    // OFFICE
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.OFFICE),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.OFFICE].label}
        />
      ),
      row: (row) => {
        const hierarchy = row.offices.map((office) => office.name).join(', ');
        return (
          <STextRow tooltipMinLength={20} fontSize={13} text={hierarchy} />
        );
      },
    },
    // SUB OFFICE
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.SUB_OFFICE),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.SUB_OFFICE].label}
        />
      ),
      row: (row) => {
        const hierarchy = row.subOffices.map((h) => h.name).join(', ');
        return (
          <STextRow tooltipMinLength={25} fontSize={13} text={hierarchy} />
        );
      },
    },
    // RISK
    {
      column: 'minmax(200px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RISK),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.RISK]: true })}
          field={ActionPlanOrderByEnum.RISK}
          text={columnMap[columnsEnum.RISK].label}
        />
      ),
      row: (row) => (
        <STextRow
          text={row.risk.name}
          tooltipMinLength={20}
          startAddon={<SRiskChip type={row.risk.type} />}
        />
      ),
    },
    // GENERATE_SOURCE
    {
      column: '200px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.GENERATE_SOURCE),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ [columnsEnum.GENERATE_SOURCE]: true })
          }
          text={columnMap[columnsEnum.GENERATE_SOURCE].label}
        />
      ),
      row: (row) => <STextRow text={row.generateSourceNames} />,
    },
    // LEVEL
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.LEVEL),
      header: (
        <ActionPlanHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.LEVEL]: true })}
          field={ActionPlanOrderByEnum.LEVEL}
          text={columnMap[columnsEnum.LEVEL].label}
        />
      ),
      row: (row) => <SOcupationalRiskTag level={row.ocupationalRisk} />,
    },
    // RECOMMENDATION
    {
      column: 'minmax(230px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RECOMMENDATION),
      header: (
        <ActionPlanHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ [columnsEnum.RECOMMENDATION]: true })
          }
          field={ActionPlanOrderByEnum.RECOMMENDATION}
          text={columnMap[columnsEnum.RECOMMENDATION].label}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          tooltipMinLength={30}
          lineNumber={2}
          text={row.recommendation.name}
        />
      ),
    },
    // STATUS
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.STATUS),
      header: (
        <ActionPlanHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.STATUS]: true })}
          field={ActionPlanOrderByEnum.STATUS}
          text={columnMap[columnsEnum.STATUS].label}
        />
      ),
      row: (row) => (
        <SSelectButtonRow
          label={ActionPlanStatusTypeMap[row.status].label}
          options={ActionPlanStatusTypeList}
          schema={ActionPlanStatusTypeMap[row.status].schema}
          onSelect={(value) => onEditStatus(value, row)}
        />
      ),
    },
    // RESPONSIBLE
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RESPONSIBLE),
      header: (
        <ActionPlanHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.RESPONSIBLE]: true })}
          field={ActionPlanOrderByEnum.RESPONSIBLE}
          text={columnMap[columnsEnum.RESPONSIBLE].label}
        />
      ),
      row: (row) => (
        <SUserButtonRow
          label={row.responsible?.name || '-'}
          options={[
            { name: 'Rodrigo Barbosa Anselmo', id: 1 },
            { name: 'Alex Abreu Marins', id: 2 },
            { name: 'Leticia Winer MArins', id: 3 },
          ]}
          onSelect={(value) => onEditStatus(null, row)}
        />
      ),
    },
    // CREATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
      header: (
        <ActionPlanHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.CREATED_AT]: true })}
          field={ActionPlanOrderByEnum.CREATED_AT}
          text={columnMap[columnsEnum.CREATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formatedCreatedAt} />,
    },
    // UPDATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.UPDATED_AT),
      header: (
        <ActionPlanHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.UPDATED_AT]: true })}
          field={ActionPlanOrderByEnum.UPDATED_AT}
          text={columnMap[columnsEnum.UPDATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formatedUpdatedAt} />,
    },
    // VALID_DATE
    {
      column: '170px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.VALID_DATE),
      header: (
        <ActionPlanHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.VALID_DATE]: true })}
          field={ActionPlanOrderByEnum.VALID_DATE}
          text={columnMap[columnsEnum.VALID_DATE].label}
        />
      ),
      row: (row) => (
        <SDatePickerRow
          emptyDate="SEM PRAZO"
          date={row.validDate}
          onChange={() => null}
        />
      ),
    },
  ];

  return (
    <>
      <STable
        isLoadingMore={isLoading}
        table={tableRows}
        data={data}
        renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
        renderBody={({ data, rows }) => (
          <STableBody
            rows={data}
            renderRow={(row) => {
              return (
                <STableRow
                  clickable
                  onClick={() => onSelectRow(row)}
                  key={row.id}
                  minHeight={35}
                >
                  {rows.map((render) => render(row))}
                </STableRow>
              );
            }}
          />
        )}
      />
      <STablePagination
        isLoading={isLoading}
        total={pagination?.total}
        limit={pagination?.limit}
        page={pagination?.page}
        setPage={setPage}
      />
    </>
  );
};
