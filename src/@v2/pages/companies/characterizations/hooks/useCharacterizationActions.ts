import { BoxProps } from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { useMutateExportCharacterization } from '@v2/services/export/characterization/hooks/useMutateExportCharacterization';
import { useMutateEditManyCharacterization } from '@v2/services/security/characterization/characterization/edit-many-characterization/hooks/useMutateEditManyActionPlan';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useRouter } from 'next/router';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useMutCopyCharacterization } from 'core/services/hooks/mutations/manager/useMutCopyCharacterization';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { deleteCharacterization } from 'core/services/hooks/mutations/manager/useMutDeleteCharacterization';
import { initialCopyRiskImportEntryState } from 'components/organisms/modals/ModalCopyRiskImportEntry';
import { initialCharacterizationSelectState } from 'components/organisms/modals/ModalSelectCharacterization';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { queryClient } from 'layouts/default/providers';
import { bulkUnlinkHierarchyHomo } from '../components/CharacterizationTable/quick-actions/characterization-link-cleanup.api';
import { invalidateCharacterizationInventory } from '../components/CharacterizationTable/quick-actions/invalidate-characterization-inventory';

export interface ICharacterizationTableTableProps extends BoxProps {
  companyId?: string;
  workspaceId?: string;
}

type UseCharacterizationActionsParams = {
  companyId?: string;
  workspaceId?: string;
  onInlineEdit?: (
    data: CharacterizationBrowseResultModel,
    options?: {
      wizardStep?: number;
      initialAiAction?: 'assist' | 'inventory-summary';
    },
  ) => void;
  onInlineAdd?: () => void;
};

export const useCharacterizationActions = ({
  companyId,
  workspaceId,
  onInlineEdit,
  onInlineAdd,
}: UseCharacterizationActionsParams) => {
  const router = useRouter();
  const { onStackOpenModal } = useModal();
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const upsertMutation = useMutUpsertCharacterization();
  const exportMutation = useMutateExportCharacterization();
  const editManyMutation = useMutateEditManyCharacterization();
  const copyMutation = useMutCopyCharacterization();

  const hasWorkspaceContext = !!companyId && !!workspaceId;

  const handleCharacterizationAdd = async () => {
    if (onInlineAdd) {
      if (!hasWorkspaceContext) return;
      onInlineAdd();
      return;
    }
    if (!hasWorkspaceContext) return;
    router.push(
      `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/new`,
    );
  };

  const handleCharacterizationEdit = (
    data: CharacterizationBrowseResultModel,
    options?: {
      wizardStep?: number;
      initialAiAction?: 'assist' | 'inventory-summary';
    },
  ) => {
    if (onInlineEdit) {
      onInlineEdit(data, options);
      return;
    }
    if (!hasWorkspaceContext) return;
    const params = new URLSearchParams();
    if (typeof options?.wizardStep === 'number') {
      params.set('wizardStep', String(options.wizardStep));
    }
    if (options?.initialAiAction) {
      params.set('aiAction', options.initialAiAction);
    }
    const qs = params.toString();
    router.push(
      `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/${data.id}${
        qs ? `?${qs}` : ''
      }`,
    );
  };

  const handleCharacterizationEditPosition = async ({
    id,
    name,
    type,
    order,
  }: Pick<ICharacterization, 'id' | 'order' | 'name' | 'type'>) => {
    if (!hasWorkspaceContext) return;
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
    if (!hasWorkspaceContext) return;
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
    if (!hasWorkspaceContext) return;
    await editManyMutation
      .mutateAsync({
        ids,
        stageId,
        companyId,
        workspaceId,
      })
      .catch(() => {});
  };

  const handleCharacterizationDeleteMany = async (ids: string[]) => {
    if (!ids?.length || !hasWorkspaceContext) return false;

    try {
      await Promise.all(
        ids.map((id) => deleteCharacterization(id, companyId, workspaceId)),
      );

      await queryClient.invalidateQueries({
        queryKey: [
          QueryKeyCharacterizationEnum.CHARACTERIZATIONS,
          companyId,
          workspaceId,
        ],
      });

      onSuccessMessage('Caracterizações excluídas com sucesso');
      return true;
    } catch (error) {
      onErrorMessage(error as any);
      return false;
    }
  };

  const handleCharacterizationBulkUnlink = async (ids: string[]) => {
    if (!ids?.length || !hasWorkspaceContext) return false;

    try {
      const preview = await bulkUnlinkHierarchyHomo({
        companyId,
        workspaceId,
        ids,
        confirm: false,
      });

      if (preview.blockedLinks.length > 0 || preview.errors.length > 0) {
        const reason =
          preview.reasons[0] ||
          preview.blockedLinks[0]?.reason ||
          preview.errors[0]?.reason ||
          'Não foi possível remover os vínculos selecionados.';
        onErrorMessage(reason);
        return false;
      }

      if (preview.activeLinksFound === 0) {
        onSuccessMessage('Nenhum vínculo ativo para remover');
        return true;
      }

      const result = await bulkUnlinkHierarchyHomo({
        companyId,
        workspaceId,
        ids,
        confirm: true,
      });

      await invalidateCharacterizationInventory({
        companyId,
        workspaceId,
      });

      onSuccessMessage(
        `${result.linksRemoved} vínculo(s) removido(s) com sucesso`,
      );
      return true;
    } catch (error) {
      onErrorMessage(error as any);
      return false;
    }
  };

  const handleCharacterizationExport = async () => {
    if (!hasWorkspaceContext) return;
    await exportMutation
      .mutateAsync({ companyId, workspaceId })
      .catch(() => {});
  };

  const handleCharacterizationCopy = () => {
    if (!hasWorkspaceContext) return;

    onStackOpenModal(ModalEnum.COPY_RISK_IMPORT_ENTRY, {
      defaultCompanyId: companyId,
      defaultWorkspaceId: workspaceId,
      title: 'Importar caracterização — origem',
      companyLabel: 'Empresa de origem',
      workspaceLabel: 'Estabelecimento de origem',
      changeCompanyLabel: 'Usar outra empresa',
      helperText:
        'Na próxima etapa você escolhe as caracterizações de origem na empresa e estabelecimento indicados acima. Os dados, fotos e riscos selecionados serão importados para o estabelecimento atual.',
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
                      workspaceId,
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
                workspaceId,
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
    handleCharacterizationDeleteMany,
    handleCharacterizationBulkUnlink,
  };
};
