import { FC } from 'react';

import SCharacterizationIcon from 'assets/icons/SCharacterizationIcon';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableTitle from 'components/atoms/STable/components/STableTitle';

import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STableAddButton } from '../../addons/addons-table/STableSearch/components/STableSearchAddButton/STableSearchAddButton';
import { STableSearch } from '../../addons/addons-table/STableSearch/STableSearch';
import { STable } from '../../common/STable/STable';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableHRow } from '../../common/STableHRow/STableHRow';
import { STableRow } from '../../common/STableRow/STableRow';
import { ICharacterizationTableTableProps } from './SCharacterizationTable.types';

export const SCharacterizationTable: FC<ICharacterizationTableTableProps> = ({
  data = [],
  isLoading,
  pagination,
  setPage,
}) => {
  const table = [
    {
      column: 'minmax(200px, 2fr)',
      header: <STableHRow>Nome</STableHRow>,
      row: (row) => <TextIconRow clickable text={row.name || '--'} />,
    },
    {
      column: 'minmax(200px, 2fr)',
      header: <STableHRow>Descrição</STableHRow>,
      row: (row) => <TextIconRow clickable text={'--'} />,
    },
    {
      column: '150px',
      header: <STableHRow justifyContent="center">Tipo</STableHRow>,
      row: (row) => <TextIconRow clickable text={row.type || '--'} />,
    },
    {
      column: '70px',
      header: <STableHRow justifyContent="center">N.º Fotos</STableHRow>,
      row: (row) => null,
    },
    {
      column: '100px',
      header: <STableHRow justifyContent="center">Criação</STableHRow>,
      row: (row) => null,
    },
    {
      column: '100px',
      header: <STableHRow justifyContent="center">Ult. Edição</STableHRow>,
      row: (row) => null,
    },
    {
      column: '110px',
      header: <STableHRow justifyContent="center">Posição</STableHRow>,
      row: (row) => null,
    },
    {
      column: '100px',
      header: <STableHRow justifyContent="center">Finalizado</STableHRow>,
      row: (row) => null,
    },
    {
      column: '90px',
      header: <STableHRow justifyContent="center">Editar</STableHRow>,
      row: (row) => null,
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
