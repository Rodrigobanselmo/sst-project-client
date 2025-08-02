import { FC } from 'react';

import { FormBrowseResultModel } from '@v2/models/form/models/form/form-browse-result.model';
import { FormModelOrderByEnum } from '@v2/services/forms/form/browse-form-model/service/browse-form-model.types';
import { FormModelTypesMap } from '../../../../../models/form/maps/form-model-type-map';
import { SBooleanRow } from '../../addons/addons-rows/SBooleanRow/SBooleanRow';
import { STagRow } from '../../addons/addons-rows/STagRow/STagRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { FormModelHeaderRow } from './components/FormModelHeaderRow/FormModelHeaderRow';
import { FormModelColumnsEnum as columnsEnum } from './enums/form-model-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { FormModelColumnMap as columnMap } from './maps/fomr-model-column-map';
import { IFormModelTableTableProps } from './SFormModelTable.types';

export const SFormModelTable: FC<IFormModelTableTableProps> = ({
  data = [],
  filters,
  setFilters,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  onSelectRow,
  hiddenColumns,
  setHiddenColumns,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<FormBrowseResultModel>[] = [
    // NAME
    {
      column: '300px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.NAME),
      header: (
        <FormModelHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormModelOrderByEnum.NAME}
          text={columnMap[columnsEnum.NAME].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.name} />,
    },

    // DESCRIPTION
    {
      column: 'minmax(200px, 3fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.DESCRIPTION),
      header: (
        <FormModelHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.DESCRIPTION]: true })}
          field={FormModelOrderByEnum.DESCRIPTION}
          text={columnMap[columnsEnum.DESCRIPTION].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.description || '-'} />,
    },

    // SYSTEM
    {
      column: '80px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.SYSTEM),
      header: (
        <FormModelHeaderRow
          justify="center"
          text={columnMap[columnsEnum.SYSTEM].label}
        />
      ),
      row: (row) => <SBooleanRow checked={row.system} />,
    },

    // SHARABLE
    {
      column: '80px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.SHAREABLE_LINK),
      header: (
        <FormModelHeaderRow
          justify="center"
          text={columnMap[columnsEnum.SHAREABLE_LINK].label}
        />
      ),
      row: (row) => <SBooleanRow checked={row.shareableLink} />,
    },

    // ANONYMOUS
    {
      column: '80px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.ANONYMOUS),
      header: (
        <FormModelHeaderRow
          justify="center"
          text={columnMap[columnsEnum.ANONYMOUS].label}
        />
      ),
      row: (row) => <SBooleanRow checked={row.anonymous} />,
    },

    // TYPES
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.TYPE),
      header: (
        <FormModelHeaderRow
          setOrderBy={setOrderBy}
          justify="center"
          orderByMap={orderByMap}
          onClean={() => setFilters({ ...filters, types: [] })}
          field={FormModelOrderByEnum.TYPE}
          text={columnMap[columnsEnum.TYPE].label}
        />
      ),
      row: (row) => (
        <STagRow
          justify="center"
          lineNumber={1}
          text={FormModelTypesMap[row.type].label}
        />
      ),
    },

    // CREATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
      header: (
        <FormModelHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormModelOrderByEnum.CREATED_AT}
          onHidden={() => setHiddenColumns({ [columnsEnum.CREATED_AT]: true })}
          text={columnMap[columnsEnum.CREATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formattedCreatedAt} />,
    },
    // UPDATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.UPDATED_AT),
      header: (
        <FormModelHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.UPDATED_AT]: true })}
          field={FormModelOrderByEnum.UPDATED_AT}
          text={columnMap[columnsEnum.UPDATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formattedUpdatedAt} />,
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
