import React from 'react';
import { FC } from 'react';

import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { SCheckBoxRow } from '../../addons/addons-rows/SCheckBoxRow/SCheckBoxRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { CharacterizationHeaderRow } from './components/CharacterizationHeaderRow/CharacterizationHeaderRow';
import { CharacterizationTypeMap } from './maps/characterization-type-map';
import { ICharacterizationTableTableProps } from './SCharacterizationTable.types';
import { HirarchyTypeMap } from './maps/hierarchy-type-map';
import { SSelectButtonRow } from '../../addons/addons-rows/SSelectButtonRow/SSelectButtonRow';
import { SInputNumberButtonRow } from '../../addons/addons-rows/SInputNumberButtonRow/SInputNumberButtonRow';

export const SCharacterizationTable: FC<ICharacterizationTableTableProps> = ({
  data = [],
  isLoading,
  pagination,
  orderBy,
  setPage,
  setOrderBy,
}) => {
  const orderByMap = mapOrderByTable(orderBy);

  const table: ITableData<CharacterizationBrowseResultModel>[] = [
    {
      column: 'minmax(200px, 1fr)',
      header: (
        <CharacterizationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.NAME}
          text="Nome"
        />
      ),
      row: (row) => <STextRow text={row.name} />,
    },
    {
      column: '150px',
      header: (
        <CharacterizationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.TYPE}
          text="Tipo"
        />
      ),
      row: (row) => (
        <STextRow text={CharacterizationTypeMap[row.type].rowLabel} />
      ),
    },
    {
      column: '70px',
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.PHOTOS}
          text="Fotos"
        />
      ),
      row: (row) => (
        <STextRow justify="center" text={String(row.photos.length)} />
      ),
    },
    {
      column: '100px',
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.CREATED_AT}
          text="Criação"
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
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.UPDATED_AT}
          text="Ult. Edição"
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
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.ORDER}
          text="Posição"
        />
      ),
      row: (row) => (
        <SInputNumberButtonRow label={row.order} onSelect={console.log} />
      ),
    },
    {
      column: '70px',
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.RISKS}
          text="Riscos"
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
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.PROFILES}
          text="Perfis"
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
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.HIERARCHY}
          text="Cargos"
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
      column: '70px',
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.DONE_AT}
          text="Feito"
        />
      ),
      row: (row) => (
        <SCheckBoxRow
          tooltip={row.formatedDoneAt}
          checked={!!row.doneAt}
          onClick={(e) => {
            e.stopPropagation();
            // handleEditDone(row);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <STable
        isLoading={isLoading}
        table={table}
        data={data}
        renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
        renderBody={({ data, rows }) => (
          <STableBody
            rows={data}
            renderRow={(row) => {
              return (
                <STableRow clickable onClick={() => null} key={row.id}>
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
