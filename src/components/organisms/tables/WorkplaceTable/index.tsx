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
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export const WorkplaceTable: FC<BoxProps & { hideModal?: boolean }> = ({
  hideModal,
}) => {
  const { data, isLoading } = useQueryCompany();
  const { onOpenModal } = useModal();

  const { push } = useRouter();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
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
      <STableTitle mb={8} mt={40} variant="h6" icon={SWorkspaceIcon}>
        Estabelecimento (Área de trabalho)
      </STableTitle>
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
                  onClick={() => handleGoToHierarchy(row.companyId)}
                />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px' }}
                  selected={row.status}
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
