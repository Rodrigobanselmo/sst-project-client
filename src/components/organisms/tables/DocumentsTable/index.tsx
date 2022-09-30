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
import { STagButton } from 'components/atoms/STagButton';
import { initialContactState } from 'components/organisms/modals/ModalAddContact/hooks/useAddContact';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IContact } from 'core/interfaces/api/IContact';
import { useQueryContacts } from 'core/services/hooks/queries/useQueryContacts/useQueryContacts';

export const DocumentsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IContact) => void;
    hideTitle?: boolean;
    companyId?: string;
  }
> = ({ rowsPerPage = 8, onSelectData, hideTitle, companyId }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryContacts(page, { search }, rowsPerPage, companyId);

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onAddContact = () => {
    onStackOpenModal(ModalEnum.CONTACT_ADD, { companyId } as Partial<
      typeof initialContactState
    >);
  };

  const onSelectRow = (group: IContact) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditContact(group);
  };

  const onEditContact = (group: IContact) => {
    onStackOpenModal(ModalEnum.CONTACT_ADD, {
      ...group,
    } as Partial<typeof initialContactState>);
  };

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Documentos</STableTitle>
          <STableSearch
            onAddClick={onAddContact}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </>
      )}
      <STable
        loading={loadGroup}
        rowsNumber={rowsPerPage}
        columns="minmax(150px, 2fr) minmax(200px, 2fr) 110px 110px 50px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Email</STableHRow>
          <STableHRow justifyContent="center">Telephone 1</STableHRow>
          <STableHRow justifyContent="center">Telephone 2</STableHRow>
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
                <TextIconRow clickable text={row.name || '-'} />
                <TextIconRow clickable text={row.email || '-'} />
                <TextIconRow
                  justifyContent="center"
                  clickable
                  text={row.phone || '-'}
                />
                <TextIconRow
                  justifyContent="center"
                  clickable
                  text={row.phone_2 || '-'}
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
      <STagButton
        onClick={onAddContact}
        maxWidth={120}
        mt={-5}
        mb={-5}
        // ml="auto"
        icon={SAddIcon}
        text={'adcionar'}
        active
        bg={'success.dark'}
      />
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
