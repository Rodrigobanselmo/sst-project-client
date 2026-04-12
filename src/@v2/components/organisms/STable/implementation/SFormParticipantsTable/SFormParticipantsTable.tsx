import { FC } from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import {
  getFormParticipantHierarchyChain,
  getFormParticipantSectorLabel,
} from '@v2/models/form/helpers/form-participant-hierarchy-display';
import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { FormParticipantsOrderByEnum } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.types';
import { SBooleanRow } from '../../addons/addons-rows/SBooleanRow/SBooleanRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { FormParticipantsHeaderRow } from './components/FormParticipantsHeaderRow/FormParticipantsHeaderRow';
import { FormParticipantsColumnsEnum as columnsEnum } from './enums/form-participants-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { FormParticipantsColumnMap as columnMap } from './maps/form-participants-column-map';
import { IFormParticipantsTableTableProps } from './SFormParticipantsTable.types';
import { ParticipantActionsRow } from './components/ParticipantActionsRow';
import { SIconEmail } from '@v2/assets/icons/SIconEmail/SIconEmail';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export const SFormParticipantsTable: FC<IFormParticipantsTableTableProps> = ({
  data = [],
  filters,
  setFilters,
  filterColumns,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  onSelectRow,
  hiddenColumns,
  setHiddenColumns,
  formApplication,
  pageSizeOptions,
  onPageSizeChange,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<FormParticipantsBrowseResultModel>[] = [
    // NAME
    {
      column: '300px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.NAME),
      header: (
        <FormParticipantsHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormParticipantsOrderByEnum.NAME}
          text={columnMap[columnsEnum.NAME].label}
          filters={filterColumns[columnsEnum.NAME]}
          onHidden={() => setHiddenColumns({ [columnsEnum.NAME]: true })}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.name} />,
    },

    // CPF
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CPF),
      header: (
        <FormParticipantsHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormParticipantsOrderByEnum.CPF}
          text={columnMap[columnsEnum.CPF].label}
          filters={filterColumns[columnsEnum.CPF]}
          onHidden={() => setHiddenColumns({ [columnsEnum.CPF]: true })}
        />
      ),
      row: (row) => <STextRow lineNumber={1} text={row.cpf || '-'} />,
    },

    // EMAIL
    {
      column: 'minmax(200px, 2fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.EMAIL),
      header: (
        <FormParticipantsHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormParticipantsOrderByEnum.EMAIL}
          text={columnMap[columnsEnum.EMAIL].label}
          filters={filterColumns[columnsEnum.EMAIL]}
          onHidden={() => setHiddenColumns({ [columnsEnum.EMAIL]: true })}
        />
      ),
      row: (row) => (
        <STextRow
          lineNumber={2}
          text={row.email || '-'}
          startAddon={
            row.emailSent ? (
              <STooltip
                title={`Email enviado${row.emailSentAt ? ` em ${new Date(row.emailSentAt).toLocaleDateString('pt-BR')}` : ''}`}
                withWrapper
              >
                <SIconEmail color="success.main" fontSize="16px" />
              </STooltip>
            ) : undefined
          }
        />
      ),
    },

    // PHONE
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.PHONE),
      header: (
        <FormParticipantsHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormParticipantsOrderByEnum.PHONE}
          text={columnMap[columnsEnum.PHONE].label}
          filters={filterColumns[columnsEnum.PHONE]}
          onHidden={() => setHiddenColumns({ [columnsEnum.PHONE]: true })}
        />
      ),
      row: (row) => (
        <STextRow lineNumber={1} text={row.formattedPhone || '-'} />
      ),
    },

    // // STATUS
    // {
    //   column: '120px',
    //   hidden: getHiddenColumn(hiddenColumns, columnsEnum.STATUS),
    //   header: (
    //     <FormParticipantsHeaderRow
    //       setOrderBy={setOrderBy}
    //       orderByMap={orderByMap}
    //       onHidden={() => setHiddenColumns({ [columnsEnum.STATUS]: true })}
    //       field={FormParticipantsOrderByEnum.STATUS}
    //       text={columnMap[columnsEnum.STATUS].label}
    //     />
    //   ),
    //   row: (row) => <STextRow lineNumber={1} text={row.status || '-'} />,
    // },

    // HIERARCHY_NAME
    {
      column: 'minmax(150px, 100fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.HIERARCHY_NAME),
      header: (
        <FormParticipantsHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={FormParticipantsOrderByEnum.HIERARCHY}
          text={columnMap[columnsEnum.HIERARCHY_NAME].label}
          filters={filterColumns[columnsEnum.HIERARCHY_NAME]}
          onHidden={() =>
            setHiddenColumns({ [columnsEnum.HIERARCHY_NAME]: true })
          }
        />
      ),
      row: (row) => {
        const sector = getFormParticipantSectorLabel(row);
        const chain = getFormParticipantHierarchyChain(row);
        const showDetail = chain !== sector;
        return (
          <SFlex direction="column" gap={0.25} sx={{ minWidth: 0 }}>
            <SText fontSize={13} sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {sector}
            </SText>
            {showDetail ? (
              <SText fontSize={11} color="grey.600" sx={{ lineHeight: 1.35 }}>
                {chain}
              </SText>
            ) : null}
          </SFlex>
        );
      },
    },

    // HAS_RESPONDED
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.HAS_RESPONDED),
      header: (
        <FormParticipantsHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          justify="center"
          field={FormParticipantsOrderByEnum.HAS_RESPONDED}
          text={columnMap[columnsEnum.HAS_RESPONDED].label}
          filters={filterColumns[columnsEnum.HAS_RESPONDED]}
          onHidden={() =>
            setHiddenColumns({ [columnsEnum.HAS_RESPONDED]: true })
          }
        />
      ),
      row: (row) => <SBooleanRow checked={row.hasResponded} />,
    },

    // COPY_LINK
    {
      column: '50px',
      header: null, // No header for actions column
      row: (row) =>
        formApplication ? (
          <ParticipantActionsRow
            participant={row}
            formApplication={formApplication}
          />
        ) : null,
    },

    // // CREATED_AT
    // {
    //   column: '120px',
    //   hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
    //   header: (
    //     <FormParticipantsHeaderRow
    //       setOrderBy={setOrderBy}
    //       orderByMap={orderByMap}
    //       onHidden={() => setHiddenColumns({ [columnsEnum.CREATED_AT]: true })}
    //       field={FormParticipantsOrderByEnum.CREATED_AT}
    //       text={columnMap[columnsEnum.CREATED_AT].label}
    //     />
    //   ),
    //   row: (row) => <STextRow lineNumber={1} text={row.formattedCreatedAt} />,
    // },

    // // UPDATED_AT
    // {
    //   column: '120px',
    //   hidden: getHiddenColumn(hiddenColumns, columnsEnum.UPDATED_AT),
    //   header: (
    //     <FormParticipantsHeaderRow
    //       setOrderBy={setOrderBy}
    //       orderByMap={orderByMap}
    //       onHidden={() => setHiddenColumns({ [columnsEnum.UPDATED_AT]: true })}
    //       field={FormParticipantsOrderByEnum.UPDATED_AT}
    //       text={columnMap[columnsEnum.UPDATED_AT].label}
    //     />
    //   ),
    //   row: (row) => <STextRow lineNumber={1} text={row.formattedUpdatedAt} />,
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
        endSlot={
          pageSizeOptions?.length && onPageSizeChange ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
              }}
            >
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel id="participants-page-size">Mostrar</InputLabel>
                <Select
                  labelId="participants-page-size"
                  label="Mostrar"
                  value={pagination?.limit ?? pageSizeOptions[0]}
                  onChange={(e) =>
                    onPageSizeChange(Number(e.target.value))
                  }
                >
                  {pageSizeOptions.map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ) : undefined
        }
      />
    </>
  );
};
