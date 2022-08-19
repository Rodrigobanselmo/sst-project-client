import { FC } from 'react';

import { BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import { initialContactState } from 'components/organisms/modals/ModalAddContact/hooks/useAddContact';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IEmployeeHierarchyHistory } from 'core/interfaces/api/IEmployee';
import { useQueryHisHierEmployee } from 'core/services/hooks/queries/useQueryHisHierEmployee/useQueryHisHierEmployee';
import { dateToString } from 'core/utils/date/date-format';

export const HistoryEmployeeHierarchyTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployeeHierarchyHistory) => void;
    hideTitle?: boolean;
    companyId?: string;
    employeeId?: number;
  }
> = ({ rowsPerPage = 8, onSelectData, hideTitle, companyId, employeeId }) => {
  const { search, page, setPage } = useTableSearchAsync();

  const {
    data: history,
    isLoading: loadQuery,
    count,
  } = useQueryHisHierEmployee(
    page,
    { search, employeeId: employeeId },
    rowsPerPage,
    companyId,
  );

  const isSelect = !!onSelectData;
  const modalName = ModalEnum.EMPLOYEE_HISTORY_HIER_ADD;

  const { onStackOpenModal } = useModal();

  const onAddContact = () => {
    onStackOpenModal(modalName, { companyId } as Partial<
      typeof initialContactState
    >);
  };

  const onSelectRow = (data: IEmployeeHierarchyHistory) => {
    if (isSelect) {
      onSelectData(data);
    } else onEditContact(data);
  };

  const onEditContact = (data: IEmployeeHierarchyHistory) => {
    onStackOpenModal(modalName, {
      ...data,
    } as Partial<typeof initialContactState>);
  };

  return (
    <>
      {!hideTitle && (
        <>
          <SFlex mb={12} gap={10} align="center">
            <STableTitle mb={0}>Histórico de Lotação</STableTitle>
            <STagButton
              onClick={onAddContact}
              maxWidth={120}
              mt={-5}
              mb={-5}
              icon={SAddIcon}
              text={'Novo cardo'}
              active
              bg={'success.dark'}
              textProps={{ sx: { mb: 0 } }}
            />
          </SFlex>
          {/* <STableSearch
            onAddClick={onAddContact}
            onChange={(e) => handleSearchChange(e.target.value)}
          /> */}
        </>
      )}
      <STable
        loading={loadQuery}
        rowsNumber={rowsPerPage}
        columns="minmax(150px, 2fr)  minmax(150px, 2fr)  minmax(150px, 2fr)  minmax(150px, 2fr) 110px minmax(200px, 2fr) 50px"
      >
        <STableHeader>
          <STableHRow>Data</STableHRow>
          <STableHRow>Motivo</STableHRow>
          <STableHRow>Cargo</STableHRow>
          <STableHRow>Setor</STableHRow>
          <STableHRow justifyContent="center">Sigla</STableHRow>
          <STableHRow justifyContent="center">Empresa</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof history[0]>
          rowsData={history}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                <TextIconRow
                  clickable
                  text={dateToString(row.startDate) || '-'}
                />
                <TextIconRow clickable text={row.motive || '-'} />
                <TextIconRow clickable text={row?.hierarchy?.name || '-'} />
                <TextIconRow
                  clickable
                  text={row?.hierarchy?.parent?.name || '-'}
                />
                <TextIconRow
                  clickable
                  text={row?.hierarchy?.company?.initials || '-'}
                />
                <TextIconRow
                  clickable
                  text={row?.hierarchy?.company?.name || '-'}
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditContact(row);
                  }}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadQuery ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
