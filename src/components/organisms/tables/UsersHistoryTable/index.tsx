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

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useQueryUsersHistory } from 'core/services/hooks/queries/useQueryUsersHistory/useQueryUsersHistory';
import { IUserHistory } from 'core/interfaces/api/IUserHistory';
import { dateToString } from 'core/utils/date/date-format';
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextUserRow from 'components/atoms/STable/components/Rows/TextUserRow';
import { TextCompanyRow } from 'components/atoms/STable/components/Rows/TextCompanyRow';

export const UsersHistorysTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (group: IUserHistory) => void;
      hideTitle?: boolean;
      hideSearch?: boolean;
      companyId?: string;
      userId?: number;
    }
> = ({
  userId,
  rowsPerPage = 8,
  onSelectData,
  hideTitle,
  companyId,
  hideSearch,
}) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryUsersHistory(page, { search, userId }, rowsPerPage, companyId);

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onSelectRow = (group: IUserHistory) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditUsersHistory(group);
  };

  const onEditUsersHistory = (group: IUserHistory) => {
    return;
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Data', column: '170px' },
    ...(userId
      ? []
      : [
          { text: 'Usuário', column: 'minmax(150px, 2fr)' },
          { text: 'Empresa', column: 'minmax(150px, 2fr)' },
        ]),
    { text: 'IP / Dispositivo', column: 'minmax(200px, 3fr)' },
    { text: 'Local', column: 'minmax(200px, 3fr)' },
  ];

  return (
    <>
      {!hideTitle && <STableTitle>Histórico de login</STableTitle>}
      {!hideSearch && (
        <STableSearch onChange={(e) => handleSearchChange(e.target.value)} />
      )}

      {/* {hideTitle && (
        <STableSmallTitle onAddClick={onAddUsersHistory} text="Contatos" />
      )} */}
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
              <STableRow onClick={() => onSelectRow(row)} key={row.id}>
                <TextIconRow
                  clickable
                  text={dateToString(row.created_at, 'DD/MM/YYYY HH:mm:ss')}
                />
                {!userId && (
                  <>
                    <TextUserRow user={row?.user} />
                    <TextCompanyRow company={row.company} showCNPJ />
                  </>
                )}
                <TextIconRow
                  text={
                    <>
                      {row.ip} <br /> {row.userAgentString}
                    </>
                  }
                />
                <TextIconRow
                  text={`${row.city} | ${row.region} | ${row.country}`}
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
