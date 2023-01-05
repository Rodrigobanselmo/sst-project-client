import { useCallback, useState } from 'react';

import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';

import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { useModal } from './useModal';

export const usePushRoute = () => {
  const { data: company } = useQueryCompany();
  const { push } = useRouter();
  const { onOpenModal } = useModal();

  const handleAddEmployees = useCallback(() => {
    if (!company.employeeCount && !company.hierarchyCount) {
      onOpenModal(ModalEnum.EMPLOYEES_EXCEL_ADD);
    } else {
      push({
        pathname: RoutesEnum.EMPLOYEES.replace(':companyId', company.id),
      });
    }
  }, [
    company.employeeCount,
    company.hierarchyCount,
    company.id,
    onOpenModal,
    push,
  ]);

  const handleAddCharacterization = useCallback(() => {
    const workspaceLength = company?.workspace?.length || 0;
    const goToEnv = (workId: string) => {
      push({
        pathname: `${RoutesEnum.CHARACTERIZATIONS.replace(
          ':companyId',
          company.id,
        ).replace(':workspaceId', workId)}/${CharacterizationEnum.ALL}`,
      });
    };

    if (workspaceLength != 1) {
      const initialWorkspaceState = {
        title: 'Selecione para qual Estabelecimento deseja adicionar',
        onSelect: (workspace: IWorkspace) => goToEnv(workspace.id),
      } as typeof initialWorkspaceSelectState;

      onOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
    }

    if (!company?.workspace) return;
    if (workspaceLength == 1) goToEnv(company.workspace[0].id);
  }, [company.id, company?.workspace, onOpenModal, push]);

  const handleAddWorkspace = useCallback(() => {
    const data: Partial<typeof initialWorkspaceState> = {
      name: company.type,
      cep: company?.address?.cep,
      number: company?.address?.number,
      city: company?.address?.city,
      complement: company?.address?.complement,
      state: company?.address?.state,
      street: company?.address?.street,
      neighborhood: company?.address?.neighborhood,
    };

    const isFirstWorkspace = company.workspace && company.workspace.length == 0;
    onOpenModal(ModalEnum.WORKSPACE_ADD, isFirstWorkspace ? data : {});
  }, [company, onOpenModal]);

  return { handleAddCharacterization, handleAddEmployees, handleAddWorkspace };
};
