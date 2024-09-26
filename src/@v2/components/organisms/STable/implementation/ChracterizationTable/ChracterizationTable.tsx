import { FC, useMemo } from 'react';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BoxProps } from '@mui/material';
import SCharacterizationIcon from 'assets/icons/SCharacterizationIcon';
import EditIcon from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagSelect } from 'components/molecules/STagSelect';

import { CheckBox } from '@mui/icons-material';
import { dateToString } from 'core/utils/date/date-format';

import { STable } from '../../common/STable/STable';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableHRow } from '../../common/STableHRow/STableHRow';
import { STableRow } from '../../common/STableRow/STableRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { useTableColumns } from '../../hooks/useTableColumns';

export interface ICharacterizationTableTableProps extends BoxProps {
  data: any[];
  isLoading?: boolean;
}

export const SCharacterizationTable: FC<ICharacterizationTableTableProps> = ({
  data,
  isLoading,
}) => {
  const { columns, headers, rows } = useTableColumns([
    {
      column: 'minmax(200px, 2fr)',
      header: <STableHRow>Nome</STableHRow>,
      row: (row) => <TextIconRow clickable text={row.name || '--'} />,
    },
    {
      column: 'minmax(200px, 2fr)',
      header: <STableHRow>Descrição</STableHRow>,
      row: (row) => <TextIconRow clickable text={row.description || '--'} />,
    },
    {
      column: '150px',
      header: <STableHRow justifyContent="center">Tipo</STableHRow>,
      row: (row) => <TextIconRow clickable text={row.description || '--'} />,
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
  ]);

  return (
    <>
      <STableTitle icon={SCharacterizationIcon} iconSx={{ fontSize: 30 }}>
        Caracterização do Ambiente
      </STableTitle>
      <STableSearch onAddClick={() => null} onChange={(e) => e.target.value} />
      <STable loading={isLoading} columns={columns}>
        <STableHeader>{headers}</STableHeader>
        <STableBody
          rowsData={data}
          hideLoadMore
          renderRow={(rowData) => {
            return (
              <STableRow clickable onClick={() => null} key={rowData.id}>
                {rows.map((row) => row(rowData))}
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination total={1000} limit={20} page={1} setPage={setPage} />
    </>
  );
};
