import { FC } from 'react';

import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/characterization/browse-characterization/service/browse-characterization.types';
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
import { CharacterizationHeaderRow } from './components/CharacterizationHeaderRow/CharacterizationHeaderRow';
import { CharacterizationColumnsEnum as columnsEnum } from './enums/characterization-columns.enum';
import { CharacterizationColumnMap as columnMap } from './maps/characterization-column-map';
import { CharacterizationTypeMap } from './maps/characterization-type-map';
import { HirarchyTypeMap } from './maps/hierarchy-type-map';
import { ICharacterizationTableTableProps } from './SCharacterizationTable.types';

export const SCharacterizationTable: FC<ICharacterizationTableTableProps> = ({
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

  const tableRows: ITableData<CharacterizationBrowseResultModel>[] = [
    {
      column: '20px',
      hidden: hiddenColumns[columnsEnum.CHECK_BOX],
      header: <SSelectHRow table={table} ids={data.map((row) => row.id)} />,
      row: (row) => <SSelectRow table={table} id={row.id} />,
    },
    {
      column: 'minmax(200px, 1fr)',
      hidden: hiddenColumns[columnsEnum.NAME],
      header: (
        <CharacterizationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.NAME}
          text={columnMap[columnsEnum.NAME].label}
        />
      ),
      row: (row) => <STextRow text={row.name} />,
    },
    {
      column: '150px',
      hidden: hiddenColumns[columnsEnum.TYPE],
      header: (
        <CharacterizationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.TYPE]: true })
          }
          field={CharacterizationOrderByEnum.TYPE}
          text={columnMap[columnsEnum.TYPE].label}
        />
      ),
      row: (row) => (
        <STextRow text={CharacterizationTypeMap[row.type].rowLabel} />
      ),
    },
    {
      column: '70px',
      hidden: hiddenColumns[columnsEnum.PHOTOS],
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.PHOTOS]: true })
          }
          field={CharacterizationOrderByEnum.PHOTOS}
          text={columnMap[columnsEnum.PHOTOS].label}
        />
      ),
      row: (row) => (
        <STextRow justify="center" text={String(row.photos.length)} />
      ),
    },
    {
      column: '100px',
      hidden: hiddenColumns[columnsEnum.CREATED_AT],
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({
              ...hiddenColumns,
              [columnsEnum.CREATED_AT]: true,
            })
          }
          field={CharacterizationOrderByEnum.CREATED_AT}
          text={columnMap[columnsEnum.CREATED_AT].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={row.formatedCreatedAt.date}
          tooltipTitle={row.formatedCreatedAt.fullTime}
        />
      ),
    },
    {
      column: '100px',
      hidden: hiddenColumns[columnsEnum.UPDATED_AT],
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({
              ...hiddenColumns,
              [columnsEnum.UPDATED_AT]: true,
            })
          }
          field={CharacterizationOrderByEnum.UPDATED_AT}
          text={columnMap[columnsEnum.UPDATED_AT].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={row.formatedUpdatedAt.date}
          tooltipTitle={row.formatedUpdatedAt.fullTime}
        />
      ),
    },
    {
      column: '70px',
      hidden: hiddenColumns[columnsEnum.ORDER],
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.ORDER]: true })
          }
          field={CharacterizationOrderByEnum.ORDER}
          text={columnMap[columnsEnum.ORDER].label}
        />
      ),
      row: (row) => (
        <SInputNumberButtonRow
          label={row.order}
          onSelect={(order) => onEditPosition(order, row)}
        />
      ),
    },
    {
      column: '70px',
      hidden: hiddenColumns[columnsEnum.RISKS],
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.RISKS]: true })
          }
          field={CharacterizationOrderByEnum.RISKS}
          text={columnMap[columnsEnum.RISKS].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={row.risks.length || '-'}
          tooltipTitle={
            <div>
              {row.risks.map((risk) => (
                <p key={risk.id}>{risk.name}</p>
              ))}
            </div>
          }
        />
      ),
    },
    {
      column: '70px',
      hidden: hiddenColumns[columnsEnum.PROFILES],
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.PROFILES]: true })
          }
          field={CharacterizationOrderByEnum.PROFILES}
          text={columnMap[columnsEnum.PROFILES].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={row.profiles.length || '-'}
          tooltipTitle={
            <div>
              {row.profiles.map((profile) => (
                <p key={profile.id}>{profile.name}</p>
              ))}
            </div>
          }
        />
      ),
    },
    {
      column: '70px',
      hidden: hiddenColumns[columnsEnum.HIERARCHY],
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({
              ...hiddenColumns,
              [columnsEnum.HIERARCHY]: true,
            })
          }
          field={CharacterizationOrderByEnum.HIERARCHY}
          text={columnMap[columnsEnum.HIERARCHY].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={row.hierarchies.length || '-'}
          tooltipTitle={
            <div>
              {row.hierarchies.map((hierarchy) => (
                <p key={hierarchy.id}>
                  ({HirarchyTypeMap[hierarchy.type].label}) {hierarchy.name}
                </p>
              ))}
            </div>
          }
        />
      ),
    },
    {
      column: '180px',
      hidden: hiddenColumns[columnsEnum.STAGE],
      header: (
        <CharacterizationHeaderRow
          justify="center"
          isFiltered={!!filters.stageIds?.length}
          onClean={() => setFilters({ ...filters, stageIds: [] })}
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.STAGE]: true })
          }
          filters={filterColumns[columnsEnum.STAGE]}
          field={CharacterizationOrderByEnum.STAGE}
          text={columnMap[columnsEnum.STAGE].label}
        />
      ),
      row: (row) => (
        <SStatusButtonRow
          label={row.stage?.name || '-'}
          color={row.stage?.color}
          popperStatusProps={{
            ...statusButtonProps,
            onSelect: (id) => onEditStage(id, row),
          }}
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
                  status={row.isInactive ? 'inactive' : 'none'}
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
