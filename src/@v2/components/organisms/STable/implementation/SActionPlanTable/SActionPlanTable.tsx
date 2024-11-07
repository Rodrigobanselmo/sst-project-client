import { FC } from 'react';

import { SInputNumberButtonRow } from '../../addons/addons-rows/SInputNumberButtonRow/SInputNumberButtonRow';
import { SSelectHRow } from '../../addons/addons-rows/SSelectRow/SSelectHRow';
import { SSelectRow } from '../../addons/addons-rows/SSelectRow/SSelectRow';
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
import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan-browse/service/action-plan-characterization.types';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { getHiddenColumn } from './helpers/get-hidden-column';

export const SActionPlanTable: FC<IActionPlanTableTableProps> = ({
  data = [],
  table,
  filters,
  setFilters,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  statusButtonProps,
  onEditStage,
  onEditPosition,
  onSelectRow,
  hiddenColumns,
  filterColumns,
  setHiddenColumns,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<ActionPlanBrowseResultModel>[] = [
    {
      column: '20px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CHECK_BOX),
      header: <SSelectHRow table={table} ids={data.map((row) => row.id)} />,
      row: (row) => <SSelectRow table={table} id={row.id} />,
    },
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
          lineNumber={1}
          text={row.origin.name}
          bottomText={row.originType}
        />
      ),
    },
    {
      column: 'minmax(200px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RISK),
      header: (
        <ActionPlanHeaderRow
          justify="center"
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
          startAddon={<SRiskChip type={row.risk.type} />}
        />
      ),
    },
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
      row: (row) => <STextRow justify="center" text={row.formatedCreatedAt} />,
    },
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
      header: (
        <ActionPlanHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({
              ...hiddenColumns,
              [columnsEnum.CREATED_AT]: true,
            })
          }
          field={ActionPlanOrderByEnum.CREATED_AT}
          text={columnMap[columnsEnum.CREATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formatedCreatedAt} />,
    },
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

    // {
    //   column: '70px',
    //   hidden: hiddenColumns[columnsEnum.ORDER],
    //   header: (
    //     <ActionPlanHeaderRow
    //       justify="center"
    //       setOrderBy={setOrderBy}
    //       orderByMap={orderByMap}
    //       onHidden={() =>
    //         setHiddenColumns({ ...hiddenColumns, [columnsEnum.ORDER]: true })
    //       }
    //       field={ActionPlanOrderByEnum.ORDER}
    //       text={columnMap[columnsEnum.ORDER].label}
    //     />
    //   ),
    //   row: (row) => (
    //     <SInputNumberButtonRow
    //       label={row.order}
    //       onSelect={(order) => onEditPosition(order, row)}
    //     />
    //   ),
    // },
    // {
    //   column: '70px',
    //   hidden: hiddenColumns[columnsEnum.RISKS],
    //   header: (
    //     <ActionPlanHeaderRow
    //       justify="center"
    //       setOrderBy={setOrderBy}
    //       orderByMap={orderByMap}
    //       onHidden={() =>
    //         setHiddenColumns({ ...hiddenColumns, [columnsEnum.RISKS]: true })
    //       }
    //       field={ActionPlanOrderByEnum.RISKS}
    //       text={columnMap[columnsEnum.RISKS].label}
    //     />
    //   ),
    //   row: (row) => (
    //     <STextRow
    //       justify="center"
    //       text={row.risks.length || '-'}
    //       tooltipTitle={
    //         <div>
    //           {row.risks.map((risk) => (
    //             <p key={risk.id}>{risk.name}</p>
    //           ))}
    //         </div>
    //       }
    //     />
    //   ),
    // },
    // {
    //   column: '70px',
    //   hidden: hiddenColumns[columnsEnum.PROFILES],
    //   header: (
    //     <ActionPlanHeaderRow
    //       justify="center"
    //       setOrderBy={setOrderBy}
    //       orderByMap={orderByMap}
    //       onHidden={() =>
    //         setHiddenColumns({ ...hiddenColumns, [columnsEnum.PROFILES]: true })
    //       }
    //       field={ActionPlanOrderByEnum.PROFILES}
    //       text={columnMap[columnsEnum.PROFILES].label}
    //     />
    //   ),
    //   row: (row) => (
    //     <STextRow
    //       justify="center"
    //       text={row.profiles.length || '-'}
    //       tooltipTitle={
    //         <div>
    //           {row.profiles.map((profile) => (
    //             <p key={profile.id}>{profile.name}</p>
    //           ))}
    //         </div>
    //       }
    //     />
    //   ),
    // },
    // {
    //   column: '70px',
    //   hidden: hiddenColumns[columnsEnum.HIERARCHY],
    //   header: (
    //     <ActionPlanHeaderRow
    //       justify="center"
    //       setOrderBy={setOrderBy}
    //       orderByMap={orderByMap}
    //       onHidden={() =>
    //         setHiddenColumns({
    //           ...hiddenColumns,
    //           [columnsEnum.HIERARCHY]: true,
    //         })
    //       }
    //       field={ActionPlanOrderByEnum.HIERARCHY}
    //       text={columnMap[columnsEnum.HIERARCHY].label}
    //     />
    //   ),
    //   row: (row) => (
    //     <STextRow
    //       justify="center"
    //       text={row.hierarchies.length || '-'}
    //       tooltipTitle={
    //         <div>
    //           {row.hierarchies.map((hierarchy) => (
    //             <p key={hierarchy.id}>
    //               ({HirarchyTypeMap[hierarchy.type].label}) {hierarchy.name}
    //             </p>
    //           ))}
    //         </div>
    //       }
    //     />
    //   ),
    // },
    // {
    //   column: '180px',
    //   hidden: hiddenColumns[columnsEnum.STAGE],
    //   header: (
    //     <ActionPlanHeaderRow
    //       justify="center"
    //       isFiltered={!!filters.stageIds?.length}
    //       onClean={() => setFilters({ ...filters, stageIds: [] })}
    //       setOrderBy={setOrderBy}
    //       orderByMap={orderByMap}
    //       onHidden={() =>
    //         setHiddenColumns({ ...hiddenColumns, [columnsEnum.STAGE]: true })
    //       }
    //       filters={filterColumns[columnsEnum.STAGE]}
    //       field={ActionPlanOrderByEnum.STAGE}
    //       text={columnMap[columnsEnum.STAGE].label}
    //     />
    //   ),
    //   row: (row) => (
    //     <SStatusButtonRow
    //       label={row.stage?.name || '-'}
    //       color={row.stage?.color}
    //       onSelect={(id) => onEditStage(id, row)}
    //       {...statusButtonProps}
    //     />
    //   ),
    // },
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
