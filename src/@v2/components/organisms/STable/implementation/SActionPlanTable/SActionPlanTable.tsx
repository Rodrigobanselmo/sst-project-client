import { FC } from 'react';

import { SIconComments } from '@v2/assets/icons';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { OccupationalRiskTag } from '@v2/components/organisms/STable/implementation/SActionPlanTable/components/OccupationalRiskTag/OccupationalRiskTag';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan/browse-action-plan/service/browse-action-plan.types';
import { SSelectHRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectHRow';
import { SSelectRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectRow';
import { SIconButtonBadgeRow } from '../../addons/addons-rows/SIconButtonRow/addons/SIconButtonBadgeRow/SIconButtonBadgeRow';
import { SIconButtonRow } from '../../addons/addons-rows/SIconButtonRow/SIconButtonRow';
import { STextCopyRow } from '../../addons/addons-rows/STextCopyRow/STextCopyRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { ActionPlanHeaderRow } from './components/ActionPlanHeaderRow/ActionPlanHeaderRow';
import { ActionPlanResponsibleSelect } from './components/ActionPlanResponsibleSelect/ActionPlanResponsibleSelect';
import { ActionPlanStatusSelect } from './components/ActionPlanStatusSelect/ActionPlanStatusSelect';
import { ActionPlanValidDateSelect } from './components/ActionPlanValidDateSelect/ActionPlanValidDateSelect';
import { ActionPlanColumnsEnum as columnsEnum } from './enums/action-plan-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { useActionPlanActions } from './hooks/useActionPlanActions';
import { ActionPlanColumnMap as columnMap } from './maps/action-plan-column-map';
import { IActionPlanTableTableProps } from './SActionPlanTable.types';
import { Box } from '@mui/material';
import { TasksActionPlanTable } from '../STaskTable/implementation/TaskTable/TasksActionPlanTable';
import { TasksSubActionPlanTable } from '../STaskTable/implementation/TaskTable/TasksSubActionPlanTable';

export const SActionPlanTable: FC<IActionPlanTableTableProps> = ({
  companyId,
  data = [],
  table,
  filters,
  setFilters,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  onSelectRow,
  hiddenColumns,
  filterColumns,
  setHiddenColumns,
  disabledResponisble,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);
  const { onViewComment } = useActionPlanActions();

  const tableRows: ITableData<ActionPlanBrowseResultModel>[] = [
    // CHECK_BOX
    {
      column: '20px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CHECK_BOX),
      header: <SSelectHRow table={table} ids={data.map((row) => row.id)} />,
      row: (row) => <SSelectRow table={table} id={row.id} />,
    },
    // ID
    {
      column: '35px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.ID),
      header: (
        <ActionPlanHeaderRow
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.ID].label}
        />
      ),
      row: (row) => (
        <STextCopyRow
          fontSize={13}
          lineNumber={1}
          text={String(row.sequentialId)}
        />
      ),
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
          startAddon={
            <SRiskChip type={row.risk.type} subTypes={row.risk.subTypes} />
          }
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
      row: (row) => <OccupationalRiskTag level={row.ocupationalRisk} />,
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
      row: (row) => <ActionPlanStatusSelect companyId={companyId} row={row} />,
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
        <ActionPlanResponsibleSelect
          disabled={disabledResponisble}
          companyId={companyId}
          row={row}
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
        <ActionPlanValidDateSelect row={row} companyId={companyId} />
      ),
    },
    // COMMENT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.COMMENT),
      header: (
        <ActionPlanHeaderRow
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.COMMENT]: true })}
          text={columnMap[columnsEnum.COMMENT].label}
        />
      ),
      row: (row) => (
        <SIconButtonRow
          disabled={!row.comments.length}
          onClick={() => onViewComment(row)}
        >
          <SIconButtonBadgeRow content={row.comments.length}>
            <SIconComments />
          </SIconButtonBadgeRow>
        </SIconButtonRow>
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
                <Box key={row.id}>
                  <STableRow
                    clickable
                    onClick={() => onSelectRow(row)}
                    minHeight={35}
                  >
                    {rows.map((render) => render(row))}
                  </STableRow>
                  {row.uuid.id && (
                    <Box mx={-1}>
                      <TasksSubActionPlanTable
                        companyId={companyId}
                        actionPlanId={row.uuid.id}
                      />
                    </Box>
                  )}
                </Box>
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
