import { FC, ReactNode } from 'react';

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
import SText from 'components/atoms/SText';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import {
  convertToPermissionsMap,
  initialUserState,
} from 'components/organisms/modals/ModalAddUsers/hooks/useAddUser';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { SCopyIcon } from 'assets/icons/SCopyIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import EditIcon from 'assets/icons/SEditIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IUser } from 'core/interfaces/api/IUser';
import { useMutInviteDelete } from 'core/services/hooks/mutations/user/useMutInviteDelete';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryInvites } from 'core/services/hooks/queries/useQueryInvites';
import { useQueryUsers } from 'core/services/hooks/queries/useQueryUsers';

export const UsersTable: FC<
  { children?: any; title?: ReactNode } & Omit<BoxProps, 'title'>
> = ({ title = 'Usuários' }) => {
  const { data: users, isLoading } = useQueryUsers();
  const { data: invites, isLoading: isLoadingInvites } = useQueryInvites();
  const { data: company } = useQueryCompany();

  const { enqueueSnackbar } = useSnackbar();

  const deleteInviteMut = useMutInviteDelete();
  const { onStackOpenModal } = useModal();

  const data = [...invites, ...users];

  const { handleSearchChange, results, page, setPage } = useTableSearch({
    data,
    keys: ['name'],
  });

  const handleEditUser = (user: IUser) => {
    const userCompany =
      user?.companies?.find(
        (userCompany) => userCompany.companyId === company.id,
      ) || user?.companies?.[0];

    onStackOpenModal(ModalEnum.USER_ADD, {
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

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    enqueueSnackbar('Link copiado com sucesso', { variant: 'success' });
  };

  const getUrl = window.location;
  const baseUrl = getUrl.protocol + '//' + getUrl.host;

  return (
    <>
      {/* <SText fontSize={14} color="grey.600">
        {`${company.initials || ''} ${company.name} (${company.fantasy || ''}${
          company.unit ? ` - ${company.unit}` : ''
        })`}{' '}
      </SText> */}
      <STableTitle icon={STeamIcon}>{title}</STableTitle>

      <STableSearch
        placeholder="Pesquisar pelo nome..."
        onAddClick={() =>
          onStackOpenModal(ModalEnum.USER_ADD, {
            company: company,
            companies: [company],
          })
        }
        style={{ minWidth: '300px' }}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading || isLoadingInvites}
        columns="minmax(200px, 5fr) 200px minmax(200px, 300px)  90px 80px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Link</STableHRow>
          <STableHRow>Email</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<(typeof data)[0]>
          rowsData={results}
          hideLoadMore
          renderRow={(row) => {
            return (
              <STableRow
                clickable
                onClick={() =>
                  'companies' in row ? handleEditUser(row) : null
                }
                key={row.id}
              >
                <TextIconRow clickable text={'name' in row ? row.name : '--'} />
                {'token' in row && row.token && !row.hasAccess ? (
                  <STagButton
                    tooltipTitle={'copiar'}
                    icon={SCopyIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(
                        `${baseUrl}${RoutesEnum.SIGN_UP}/?token=${
                          row.token
                        }&email=${row.email || ''}`,
                      );
                    }}
                    sx={{ mr: 10 }}
                    text={'Copiar link de convite'}
                  />
                ) : (
                  <STagButton
                    onClick={(e) => {}}
                    sx={{ mr: 10 }}
                    active
                    bg={'success.main'}
                    text={'Já cadastrado'}
                  />
                )}
                <TextIconRow clickable text={row.email} />
                <StatusSelect
                  expiresDate={
                    'expires_date' in row ? row.expires_date : undefined
                  }
                  large
                  disabled
                  sx={{ maxWidth: '120px' }}
                  selected={
                    'companies' in row
                      ? row.companies[0]?.status
                      : dayjs(row.expires_date).isAfter(dayjs())
                      ? StatusEnum.PENDING
                      : StatusEnum.EXPIRED
                  }
                  statusOptions={[]}
                />
                {'companies' in row ? (
                  <IconButtonRow
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditUser(row);
                    }}
                    icon={<EditIcon />}
                  />
                ) : (
                  <IconButtonRow
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInvite(row.id);
                    }}
                    icon={<SDeleteIcon />}
                    loading={deleteInviteMut.isLoading}
                  />
                )}
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={8}
        totalCountOfRegisters={
          isLoading || isLoadingInvites ? undefined : data.length
        }
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
