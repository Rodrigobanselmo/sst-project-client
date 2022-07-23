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
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import {
  convertToPermissionsMap,
  initialUserState,
} from 'components/organisms/modals/ModalAddUsers/hooks/useAddUser';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import SDeleteIcon from 'assets/icons/SDeleteIcon';
import EditIcon from 'assets/icons/SEditIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IUser } from 'core/interfaces/api/IUser';
import { useMutInviteDelete } from 'core/services/hooks/mutations/user/useMutInviteDelete';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryInvites } from 'core/services/hooks/queries/useQueryInvites';
import { useQueryUsers } from 'core/services/hooks/queries/useQueryUsers';

export const UsersTable: FC<BoxProps> = () => {
  const { data: users, isLoading } = useQueryUsers();
  const { data: invites, isLoading: isLoadingInvites } = useQueryInvites();
  const { data: company } = useQueryCompany();

  const deleteInviteMut = useMutInviteDelete();
  const { onOpenModal } = useModal();

  const data = [...invites, ...users];

  const { handleSearchChange, results } = useTableSearch({
    data,
    keys: ['name'],
  });

  const handleEditUser = (user: IUser) => {
    const userCompany = user?.companies?.find(
      (userCompany) => userCompany.companyId === company.id,
    );

    onOpenModal(ModalEnum.USER_ADD, {
      id: user.id,
      roles: (userCompany?.roles || []) as RoleEnum[],
      permissions: convertToPermissionsMap(
        (userCompany?.roles || []) as RoleEnum[],
        userCompany?.permissions || [],
      ),
      status: userCompany?.status || StatusEnum.ACTIVE,
      email: user.email,
      name: user.name,
      group: userCompany?.group || null,
      company: company,
    } as typeof initialUserState);
  };

  const handleDeleteInvite = (inviteId: string) => {
    deleteInviteMut.mutate(inviteId);
  };

  return (
    <>
      <STableTitle icon={STeamIcon}>Usuários</STableTitle>
      <STableSearch
        placeholder="Pesquisar pelo nome..."
        onAddClick={() =>
          onOpenModal(ModalEnum.USER_ADD, {
            company: company,
            companies: [company],
          })
        }
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
                  expiresDate={
                    'expires_date' in row ? row.expires_date : undefined
                  }
                  large
                  disabled
                  sx={{ maxWidth: '120px' }}
                  selected={
                    'companies' in row
                      ? row.companies[0].status
                      : dayjs(row.expires_date).isAfter(dayjs())
                      ? StatusEnum.PENDING
                      : StatusEnum.EXPIRED
                  }
                  statusOptions={[]}
                />
                {'companies' in row ? (
                  <IconButtonRow
                    onClick={() => handleEditUser(row)}
                    icon={<EditIcon />}
                  />
                ) : (
                  <IconButtonRow
                    onClick={() => handleDeleteInvite(row.id)}
                    icon={<SDeleteIcon />}
                    loading={deleteInviteMut.isLoading}
                  />
                )}
              </STableRow>
            );
          }}
        />
      </STable>
    </>
  );
};
