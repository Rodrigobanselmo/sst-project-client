import { BoxProps } from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { useMutateExportCharacterization } from '@v2/services/export/characterization/hooks/useMutateExportCharacterization';
import { useMutateEditManyCharacterization } from '@v2/services/security/characterization/characterization/edit-many-characterization/hooks/useMutateEditManyActionPlan';
import { useRouter } from 'next/router';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useMutCopyCharacterization } from 'core/services/hooks/mutations/manager/useMutCopyCharacterization';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { initialCopyRiskImportEntryState } from 'components/organisms/modals/ModalCopyRiskImportEntry';
import { initialCharacterizationSelectState } from 'components/organisms/modals/ModalSelectCharacterization';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';

export interface ICharacterizationTableTableProps extends BoxProps {
  companyId?: string;
  workspaceId?: string;
}

export const useCharacterizationActions = ({ companyId, workspaceId }) => {
  const router = useRouter();
  const { onStackOpenModal } = useModal();

  const upsertMutation = useMutUpsertCharacterization();
  const exportMutation = useMutateExportCharacterization();
  const editManyMutation = useMutateEditManyCharacterization();
  const copyMutation = useMutCopyCharacterization();

  const handleCharacterizationAdd = async () => {
    router.push(
      `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/new`,
    );
  };

  const handleCharacterizationEdit = (
    data: CharacterizationBrowseResultModel,
  ) => {
    router.push(
      `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/${data.id}`,
    );
  };

  const handleCharacterizationEditPosition = async ({
    id,
    name,
    type,
    order,
  }: Pick<ICharacterization, 'id' | 'order' | 'name' | 'type'>) => {
    await upsertMutation
      .mutateAsync({ id, name, type, order, companyId, workspaceId })
      .catch(() => {});
  };

  const handleCharacterizationEditStage = async ({
    id,
    stageId,
    name,
    type,
  }: Pick<ICharacterization, 'id' | 'stageId' | 'name' | 'type'>) => {
    await upsertMutation
      .mutateAsync({
        id,
        stageId,
        companyId,
        workspaceId,
        name,
        type,
      })
      .catch(() => {});
  };

  const handleCharacterizationEditMany = async ({
    ids,
    stageId,
  }: {
    ids: string[];
    stageId?: number | null;
  }) => {
    await editManyMutation
      .mutateAsync({
        ids,
        stageId,
        companyId,
        workspaceId,
      })
      .catch(() => {});
  };

  const handleCharacterizationExport = async () => {
    await exportMutation
      .mutateAsync({ companyId, workspaceId })
      .catch(() => {});
  };

  const handleCharacterizationCopy = () => {
    onStackOpenModal(ModalEnum.COPY_RISK_IMPORT_ENTRY, {
      defaultCompanyId: companyId || '',
      defaultWorkspaceId: workspaceId,
      title: 'Copiar caracterização — origem',
      companyLabel: 'Empresa de origem (cópia)',
      workspaceLabel: 'Estabelecimento de origem',
      changeCompanyLabel: 'Usar outra empresa',
      helperText:
        'Na próxima etapa você escolhe as caracterizações de origem na empresa e estabelecimento indicados acima. A empresa e o estabelecimento da tela atual não são alterados.',
      onContinue: ({
        sourceCompanyId,
        workspaceId: sourceWorkspaceId,
      }: {
        sourceCompanyId: string;
        workspaceId?: string;
      }) => {
        if (!sourceWorkspaceId) {
          onStackOpenModal(ModalEnum.WORKSPACE_SELECT, {
            title: 'Selecione o Estabelecimento',
            companyId: sourceCompanyId,
            onSelect: (workspace: IWorkspace) => {
              onStackOpenModal(ModalEnum.CHARACTERIZATION_SELECT, {
                companyId: sourceCompanyId,
                workspaceId: workspace.id,
                multiple: true,
                onSelect: (char: ICharacterization[]) => {
                  void copyMutation
                    .mutateAsync({
                      companyCopyFromId: sourceCompanyId,
                      workspaceId: workspaceId || '',
                      sourceWorkspaceId: workspace.id,
                      characterizationIds: char.map((c) => c.id),
                      companyId,
                    })
                    .catch(() => {});
                },
              } as Partial<typeof initialCharacterizationSelectState>);
            },
          } as typeof initialWorkspaceSelectState);
          return;
        }

        onStackOpenModal(ModalEnum.CHARACTERIZATION_SELECT, {
          companyId: sourceCompanyId,
          workspaceId: sourceWorkspaceId,
          multiple: true,
          onSelect: (char: ICharacterization[]) => {
            void copyMutation
              .mutateAsync({
                companyCopyFromId: sourceCompanyId,
                workspaceId: workspaceId || '',
                sourceWorkspaceId,
                characterizationIds: char.map((c) => c.id),
                companyId,
              })
              .catch(() => {});
          },
        } as Partial<typeof initialCharacterizationSelectState>);
      },
    } as Partial<typeof initialCopyRiskImportEntryState>);
  };

  return {
    handleCharacterizationEditStage,
    handleCharacterizationEditPosition,
    handleCharacterizationEdit,
    handleCharacterizationAdd,
    handleCharacterizationCopy,
    handleCharacterizationExport,
    handleCharacterizationEditMany,
  };
};
