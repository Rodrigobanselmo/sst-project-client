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
import { STableAddButton } from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import SWorkspaceIcon from 'assets/icons/SWorkspaceIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { usePushRoute } from 'core/hooks/actions-push/usePushRoute';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export const WorkspaceTable: FC<
  { children?: any } & BoxProps & { hideModal?: boolean }
> = ({ hideModal }) => {
  const { data, isLoading } = useQueryCompany();
  const { onOpenModal } = useModal();
  const { handleAddWorkspace } = usePushRoute();

  const { push } = useRouter();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const handleEdit = (row: IWorkspace) => {
    const data: Partial<typeof initialWorkspaceState> = {
      cep: row?.address?.cep,
      number: row?.address?.number,
      city: row?.address?.city,
      complement: row?.address?.complement,
      state: row?.address?.state,
      street: row?.address?.street,
      neighborhood: row?.address?.neighborhood,
      description: row?.description,
      name: row?.name,
      id: row?.id,
      status: row?.status,
    };

    onOpenModal(ModalEnum.WORKSPACE_ADD, data);
  };

  const handleGoToHierarchy = (companyId: string) => {
    push(RoutesEnum.HIERARCHY.replace(/:companyId/g, companyId));
  };

  return (
    <>
      <SFlex mb={8} mt={40} align="center">
        <STableTitle mb={0} mt={0} mr={10} variant="h6" icon={SWorkspaceIcon}>
          Estabelecimentos
        </STableTitle>
        <STableAddButton
          sm
          onAddClick={handleAddWorkspace}
          addText={'Adicionar'}
        />
      </SFlex>
      <STable
        loading={isLoading}
        columns="minmax(200px, 5fr) minmax(150px, 1fr) minmax(100px, 150px) 80px 80px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow>Sigla</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<IWorkspace>
          rowsData={data.workspace || []}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name} />
                <TextIconRow text={row.description || ' -- '} />
                <TextIconRow
                  text={row.abbreviation}
                  // onClick={() => handleGoToHierarchy(row.companyId)}
                />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px' }}
                  selected={row.status}
                  disabled
                  statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                />
                <IconButtonRow
                  onClick={() => handleEdit(row)}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      {!hideModal && <ModalAddWorkspace />}
    </>
  );
};
