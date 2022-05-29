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
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import SDeleteIcon from 'assets/icons/SDeleteIcon';
import EditIcon from 'assets/icons/SEditIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { useQueryInvites } from 'core/services/hooks/queries/useQueryInvites';
import { useQueryUsers } from 'core/services/hooks/queries/useQueryUsers';
import { sortData } from 'core/utils/sorts/data.sort';

export const UsersTable: FC<BoxProps> = () => {
  const { data: users, isLoading } = useQueryUsers();
  const { data: invites, isLoading: isLoadingInvites } = useQueryInvites();
  const { onOpenModal } = useModal();

  const data = [...invites, ...users];

  const { push } = useRouter();
  const { handleSearchChange, results } = useTableSearch({
    data,
    keys: ['name'],
    // sort: (a, b) => sortData(a, b, 'name'),
  });

  const handleEditUser = (companyId: string, employeeId: number) => {
    console.log(employeeId); // TODO edit checklist status
    //push(`${RoutesEnum.COMPANIES}/${companyId}/${employeeId}`);
  };

  const handleDeleteInvite = (inviteId: string) => {
    console.log(inviteId); // TODO edit checklist status
    //push(`${RoutesEnum.COMPANIES}/${companyId}/${employeeId}`);
  };

  const handleGoToHierarchy = (companyId: string) => {
    push(RoutesEnum.HIERARCHY.replace(/:companyId/g, companyId));
  };

  return (
    <>
      <STableTitle icon={STeamIcon}>Usuários</STableTitle>
      <STableSearch
        placeholder="Pesquisar pelo nome..."
        onAddClick={() => onOpenModal(ModalEnum.USER_ADD)}
        style={{ minWidth: '300px' }}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading || isLoadingInvites}
        columns="minmax(200px, 5fr) minmax(200px, 300px)  90px 80px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Email</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={'name' in row ? row.name : '--'} />
                <TextIconRow text={row.email} />
                <StatusSelect
                  large
                  disabled
                  sx={{ maxWidth: '120px' }}
                  selected={
                    'companies' in row
                      ? row.companies[0].status
                      : StatusEnum.PENDING
                  }
                  statusOptions={[]}
                />
                {'companies' in row ? (
                  <IconButtonRow
                    onClick={() => handleEditUser(row.companyId, row.id)}
                    icon={<EditIcon />}
                  />
                ) : (
                  <IconButtonRow
                    onClick={() => handleDeleteInvite(row.id)}
                    icon={<SDeleteIcon />}
                  />
                )}
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalAddUsers />
    </>
  );
};
