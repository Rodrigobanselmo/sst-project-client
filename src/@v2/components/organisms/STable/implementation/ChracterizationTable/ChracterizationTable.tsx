import { FC } from 'react';

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
import STablePagination from '../../addons/addons-table/STablePagination2/STablePagination';
import CPagination from '../../addons/addons-table/STablePagination';

export interface ICharacterizationTableTableProps extends BoxProps {
  data: any[];
  isLoading?: boolean;
}

export const SCharacterizationTable: FC<ICharacterizationTableTableProps> = ({
  data,
  isLoading,
}) => {
  return (
    <>
      <STableTitle icon={SCharacterizationIcon} iconSx={{ fontSize: 30 }}>
        Caracterização do Ambiente
      </STableTitle>
      <STableSearch onAddClick={() => null} onChange={(e) => e.target.value} />
      <STable
        loading={isLoading}
        columns={
          'minmax(200px, 2fr) minmax(200px, 2fr) 150px 70px 100px 100px 110px 100px 90px'
        }
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow justifyContent="center">Tipo</STableHRow>
          <STableHRow justifyContent="center">N.º Fotos</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
          <STableHRow justifyContent="center">Ult. Edição</STableHRow>
          <STableHRow justifyContent="center">Posição</STableHRow>
          <STableHRow justifyContent="center">Finalizado</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody
          rowsData={data}
          hideLoadMore
          renderRow={(row) => {
            return (
              <STableRow clickable onClick={() => null} key={row.id}>
                <TextIconRow clickable text={row.name || '--'} />
                <TextIconRow clickable text={row.description || '--'} />
                <TextIconRow
                  clickable
                  justifyContent="center"
                  textAlign={'center'}
                  text={row.text}
                />
                <TextIconRow
                  clickable
                  justifyContent="center"
                  text={row?.photos?.length ? String(row?.photos?.length) : '0'}
                />
                <TextIconRow
                  clickable
                  text={dateToString(row.created_at)}
                  justifyContent="center"
                />
                <TextIconRow
                  clickable
                  text={dateToString(row.updated_at)}
                  justifyContent="center"
                />
                <STagSelect
                  options={[]}
                  tooltipTitle={
                    'escolha a posição que o ambiente deve aparecer no documento'
                  }
                  text={`Posição ${!row?.order ? '-' : row?.order}`}
                  maxWidth={120}
                  handleSelectMenu={(option) => null}
                  icon={SOrderIcon}
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  icon={
                    row.done_at ? (
                      <CheckBox color="success" />
                    ) : (
                      <CheckBoxOutlineBlankIcon />
                    )
                  }
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      {/* <STablePagination
        registersPerPage={8}
        totalCountOfRegisters={8}
        currentPage={1}
        onPageChange={() => null}
      /> */}
      <CPagination totalCount={1000} count={1000 / 20} />
      {/* <STablePagination
        mt={2}
        registersPerPage={8}
        totalCountOfRegisters={isLoading ? undefined : resultsFilter.length}
        currentPage={page}
        onPageChange={setPage}
      /> */}
    </>
  );
};
