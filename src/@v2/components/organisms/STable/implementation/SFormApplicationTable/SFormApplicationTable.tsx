import { FC } from 'react';

import { SDownloadRow } from '../../addons/addons-rows/SDownloadRow/SDownloadRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { FormApplicationHeaderRow } from './components/FormApplicationHeaderRow/FormApplicationHeaderRow';
import { FormApplicationColumnsEnum as columnsEnum } from './enums/form-application-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { FormApplicationColumnMap as columnMap } from './maps/fomr-application-column-map';
import { IFormApplicationTableTableProps } from './SFormApplicationTable.types';
import { STagRow } from '../../addons/addons-rows/STagRow/STagRow';
import { FormApplicationBrowseResultModel } from '@v2/models/form/models/form-application/form-application-browse-result.model';
import { FormApplicationOrderByEnum } from '@v2/services/forms/form-application/browse-form-application/service/browse-form-application.types';
import { FormApplicationStatusMap } from './maps/form-application-status-map';

export const SFormApplicationTable: FC<IFormApplicationTableTableProps> = ({
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

  const tableRows: ITableData<FormApplicationBrowseResultModel>[] = [
    // NAME
    {
      column: 'minmax(200px, 2fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.NAME),
      header: (
        <FormApplicationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormApplicationOrderByEnum.NAME}
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
        <FormApplicationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.DESCRIPTION]: true })}
          field={FormApplicationOrderByEnum.DESCRIPTION}
          text={columnMap[columnsEnum.DESCRIPTION].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.description || '-'} />,
    },

    // STATUS
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.STATUS),
      header: (
        <FormApplicationHeaderRow
          setOrderBy={setOrderBy}
          justify="center"
          orderByMap={orderByMap}
          onClean={() => setFilters({ ...filters, status: [] })}
          field={FormApplicationOrderByEnum.STATUS}
          text={columnMap[columnsEnum.STATUS].label}
        />
      ),
      row: (row) => (
        <STagRow
          justify="center"
          lineNumber={1}
          backgroundColor={
            FormApplicationStatusMap[row.status].schema.backgroundColor
          }
          color={FormApplicationStatusMap[row.status].schema.color}
          borderColor={FormApplicationStatusMap[row.status].schema.borderColor}
          text={FormApplicationStatusMap[row.status].label}
        />
      ),
    },

    // START DATE
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.START_DATE),
      header: (
        <FormApplicationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          justify="center"
          onHidden={() => setHiddenColumns({ [columnsEnum.START_DATE]: true })}
          field={FormApplicationOrderByEnum.START_DATE}
          text={columnMap[columnsEnum.START_DATE].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          lineNumber={1}
          text={row.formattedStartDate || '-'}
        />
      ),
    },
    // END DATE
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.END_DATE),
      header: (
        <FormApplicationHeaderRow
          setOrderBy={setOrderBy}
          justify="center"
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.END_DATE]: true })}
          field={FormApplicationOrderByEnum.END_DATE}
          text={columnMap[columnsEnum.END_DATE].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          lineNumber={1}
          text={row.formattedEndDate || '-'}
        />
      ),
    },
    // CREATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
      header: (
        <FormApplicationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormApplicationOrderByEnum.CREATED_AT}
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
        <FormApplicationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.UPDATED_AT]: true })}
          field={FormApplicationOrderByEnum.UPDATED_AT}
          text={columnMap[columnsEnum.UPDATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formattedUpdatedAt} />,
    },

    // TOTAL
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.FORM),
      header: (
        <FormApplicationHeaderRow
          justify="center"
          text={columnMap[columnsEnum.FORM].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formattedTotal} />,
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
