import { FC } from 'react';

import { BoxProps, Divider } from '@mui/material';
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
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableSmallTitle from 'components/atoms/STable/components/STableSmallTitle/STableSmallTitle';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { initialContactState } from 'components/organisms/modals/ModalAddContact/hooks/useAddContact';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IContact } from 'core/interfaces/api/IContact';
import { useQueryContacts } from 'core/services/hooks/queries/useQueryContacts/useQueryContacts';

export const ContactsTable: FC<
  { children?: any } & BoxProps & {
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

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(150px, 2fr)' },
    { text: 'Email', column: 'minmax(200px, 2fr)' },
    { text: 'Telephone 1', column: '110px' },
    { text: 'Telephone 2', column: '110px' },
    { text: 'Editar', column: '50px' },
  ];

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Contatos</STableTitle>
          <STableSearch
            onAddClick={onAddContact}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </>
      )}
      {hideTitle && (
        <STableSmallTitle onAddClick={onAddContact} text="Contatos" />
      )}
      <STable
        loading={loadGroup}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<(typeof group)[0]>
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
                {/* <TextIconRow
                  tooltipTitle={row.obs}
                  clickable
                  text={row.obs || '-'}
                /> */}
                <TextIconRow clickable text={row.email || '-'} />
                <TextIconRow
                  justifyContent="center"
                  clickable
                  text={row.phone || '-'}
                />
                <TextIconRow
                  justifyContent="center"
                  clickable
                  text={row.phone_1 || '-'}
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
