import { FC } from 'react';

import { BoxProps } from '@mui/material';
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
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { initialCompanyGroupState } from 'components/organisms/modals/ModalAddCompanyGroup/hooks/useAddCompanyGroup';
import dayjs from 'dayjs';

import SCompanyGroupIcon from 'assets/icons/SCompanyGroupIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { ICompanyGroup } from 'core/interfaces/api/ICompanyGroup';
import { useQueryCompanyGroups } from 'core/services/hooks/queries/useQueryCompanyGroups';
import { dateToDate } from 'core/utils/date/date-format';

export const CompanyGroupsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: ICompanyGroup) => void;
  }
> = ({ rowsPerPage = 8, onSelectData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryCompanyGroups(page, { search }, rowsPerPage);

  const isSelect = !!onSelectData;

  const { onOpenModal } = useModal();

  const onAddCompanyGroup = () => {
    onOpenModal(ModalEnum.COMPANY_GROUP_ADD);
  };

  const onSelectRow = (group: ICompanyGroup) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditCompanyGroup(group);
  };

  const onEditCompanyGroup = (group: ICompanyGroup) => {
    console.log(group);
    onOpenModal(ModalEnum.COMPANY_GROUP_ADD, {
      ...group,
      esocialStart: dateToDate(group.esocialStart),
      companies: group.companies || [],
    } as Partial<typeof initialCompanyGroupState>);
  };

  return (
    <>
      {!isSelect && (
        <STableTitle icon={SCompanyGroupIcon}>Grupos Empresariais</STableTitle>
      )}
      <STableSearch
        onAddClick={onAddCompanyGroup}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={loadGroup}
        rowsNumber={rowsPerPage}
        columns="minmax(150px, 2fr) minmax(200px, 4fr) 100px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof group[0]>
          rowsData={group}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                <TextIconRow clickable text={row.name} />
                <TextIconRow clickable text={row.description} />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCompanyGroup(row);
                  }}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadGroup ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
