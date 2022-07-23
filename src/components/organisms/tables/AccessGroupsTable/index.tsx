import { FC } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
import { Box, BoxProps } from '@mui/material';
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
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { initialAccessGroupState } from 'components/organisms/modals/ModalAddAccessGroup/hooks/useAddAccessGroup';
import { convertToPermissionsMap } from 'components/organisms/modals/ModalAddUsers/hooks/useAddUser';
import { RoleEnum } from 'project/enum/roles.enums';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { useQueryAccessGroups } from 'core/services/hooks/queries/useQueryAccessGroups';

export const AccessGroupsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IAccessGroup) => void;
  }
> = ({ rowsPerPage = 8, onSelectData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryAccessGroups(page, { search }, rowsPerPage);

  const isSelect = !!onSelectData;

  const { onOpenModal } = useModal();

  const onAddAccessGroup = () => {
    onOpenModal(ModalEnum.ACCESS_GROUP_ADD);
  };

  const onSelectRow = (group: IAccessGroup) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditAccessGroup(group);
  };

  const onEditAccessGroup = (group: IAccessGroup) => {
    onOpenModal(ModalEnum.ACCESS_GROUP_ADD, {
      id: group.id,
      name: group.name,
      description: group.description,
      roles: group.roles,
      permissions: convertToPermissionsMap(group.roles, group.permissions),
    } as Partial<typeof initialAccessGroupState>);
  };

  return (
    <>
      {!isSelect && (
        <STableTitle icon={BadgeIcon}>Grupo de Permissões</STableTitle>
      )}
      <STableSearch
        onAddClick={onAddAccessGroup}
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
                    onEditAccessGroup(row);
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
