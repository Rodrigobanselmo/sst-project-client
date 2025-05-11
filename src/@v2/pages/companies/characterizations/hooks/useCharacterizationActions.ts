import { BoxProps } from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { useMutateExportCharacterization } from '@v2/services/export/characterization/hooks/useMutateExportCharacterization';
import { useMutateEditManyCharacterization } from '@v2/services/security/characterization/characterization/edit-many-characterization/hooks/useMutateEditManyActionPlan';
import { initialCharacterizationState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';

export interface ICharacterizationTableTableProps extends BoxProps {
  companyId?: string;
  workspaceId?: string;
}

export const useCharacterizationActions = ({ companyId, workspaceId }) => {
  const { onOpenModal } = useModal();

  const upsertMutation = useMutUpsertCharacterization();
  const exportMutation = useMutateExportCharacterization();
  const editManyMutation = useMutateEditManyCharacterization();

  const handleCharacterizationAdd = async () => {
    onOpenModal(ModalEnum.CHARACTERIZATION_ADD, {
      companyId,
      workspaceId,
    } as Partial<typeof initialCharacterizationState>);
  };

  const handleCharacterizationEdit = (
    data: CharacterizationBrowseResultModel,
  ) => {
    const char = {
      id: data.id,
    } as ICharacterization;

    onOpenModal(ModalEnum.CHARACTERIZATION_ADD, { ...char } as Partial<
      typeof initialCharacterizationState
    >);
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

  return {
    handleCharacterizationEditStage,
    handleCharacterizationEditPosition,
    handleCharacterizationEdit,
    handleCharacterizationAdd,
    handleCharacterizationExport,
    handleCharacterizationEditMany,
  };
};
