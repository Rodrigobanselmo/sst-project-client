import { Box, BoxProps } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { ActionPlanReadPhotoModel } from '@v2/models/security/models/action-plan/action-plan-read-photo.model';
import { ActionPlanReadModel } from '@v2/models/security/models/action-plan/action-plan-read.model';
import { useMutateAddActionPlanPhoto } from '@v2/services/security/action-plan/action-plan-photo/add-action-plan-photo/hooks/useMutateAddActionPlanPhoto';
import { useMutateDeleteActionPlanPhoto } from '@v2/services/security/action-plan/action-plan-photo/delete-action-plan-photo/hooks/useMutateDeleteActionPlanPhoto';
import { initialPhotoState } from 'components/organisms/modals/ModalUploadPhoto';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal as useOldModal } from 'core/hooks/useModal';
import { ActionPlanSliderPhotos } from '../ActionPlanSliderPhotos/ActionPlanSliderPhotos';
import { ActionPlanEmptyPhotos } from './components/ActionPlanEmptyPhotos';

export const ActionPlanRecommendationsPhotos = ({
  actionPlan,
  boxProps,
}: {
  actionPlan: ActionPlanReadModel;
  boxProps?: BoxProps;
}) => {
  const companyId = actionPlan.companyId;
  const recommendationId = actionPlan.uuid.recommendationId;
  const riskDataId = actionPlan.uuid.riskDataId;
  const workspaceId = actionPlan.uuid.workspaceId;

  {
    /* -//! remove need to change to new format */
  }
  const { onStackOpenModal } = useOldModal();
  {
    /* -//! remove need to change to new format */
  }

  const addPhoto = useMutateAddActionPlanPhoto();
  const deletePhoto = useMutateDeleteActionPlanPhoto();

  const handleAddPhoto = () => {
    /* -//! remove need to change to new format */
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: 'Andamento da Recomendação',
      onConfirm: async (photo) => {
        if (photo.file) {
          await addPhoto.mutateAsync({
            file: photo.file,
            companyId,
            recommendationId,
            riskDataId,
            workspaceId,
          });
        }
      },
    } as Partial<typeof initialPhotoState>);
    /* -//! remove need to change to new format */
  };

  const handleDeletePhoto = async (photo: ActionPlanReadPhotoModel) => {
    await deletePhoto.mutateAsync({
      companyId,
      photoId: photo.id,
    });
  };

  return (
    <Box mb={16} {...boxProps}>
      <SFlex justify="space-between">
        <SText color="grey.600" fontSize={18}>
          Fotos da implementação da recomendação
        </SText>
        <SButton
          color="success"
          text="Adicionar Foto"
          onClick={handleAddPhoto}
        />
      </SFlex>
      <SDivider sx={{ mt: 3, mb: 8 }} />
      {actionPlan?.recommendationPhotos?.length > 0 ? (
        <ActionPlanSliderPhotos
          isLoadingDelete={deletePhoto.isPending}
          onDelete={handleDeletePhoto}
          photos={actionPlan.recommendationPhotos}
        />
      ) : (
        <ActionPlanEmptyPhotos />
      )}
    </Box>
  );
};
