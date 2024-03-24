import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

export const useCharacterizationActions = () => {
  const history = useRouter();
  const { data: company } = useQueryCompany();
  const { onStackOpenModal } = useModal();

  const onViewCharacterization = useCallback(
    ({ type = CharacterizationEnum.ALL }: { type?: CharacterizationEnum }) => {
      const workspaceLength = company?.workspace?.length || 0;
      const goToEnv = (workId: string) => {
        history.push({
          pathname: `${RoutesEnum.CHARACTERIZATIONS.replace(
            ':companyId',
            company.id,
          ).replace(':workspaceId', workId)}/${type}`,
        });
      };

      if (workspaceLength != 1) {
        const initialWorkspaceState = {
          title: 'Selecione para qual Estabelecimento deseja adicionar',
          onSelect: (workspace: IWorkspace) => goToEnv(workspace.id),
        } as typeof initialWorkspaceSelectState;

        onStackOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
      }

      if (!company?.workspace) return;
      if (workspaceLength == 1) goToEnv(company.workspace[0].id);
    },
    [company.id, company.workspace, history, onStackOpenModal],
  );

  return {
    onViewCharacterization,
  };
};
