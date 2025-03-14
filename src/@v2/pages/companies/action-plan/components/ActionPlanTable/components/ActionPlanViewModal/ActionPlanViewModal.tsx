import { Box } from '@mui/material';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useFetchReadActionPlan } from '@v2/services/security/action-plan/action-plan/read-action-plan/hooks/useFetchReadActionPlan';
import { ActionPlanEmptyPhotos } from './components/ActionPlanEmptyPhotos';
import { ActionPlanSliderPhotos } from './components/ActionPlanSliderPhotos';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { useModal as useOldModal } from 'core/hooks/useModal';
import { ModalEnum } from 'core/enums/modal.enums';
import { initialPhotoState } from 'components/organisms/modals/ModalUploadPhoto';
import { useMutateAddActionPlanPhoto } from '@v2/services/security/action-plan/action-plan-photo/add-action-plan-photo/hooks/useMutateAddActionPlanPhoto';
import { useMutateDeleteActionPlanPhoto } from '@v2/services/security/action-plan/action-plan-photo/delete-action-plan-photo/hooks/useMutateDeleteActionPlanPhoto';
import { ActionPlanReadPhotoModel } from '@v2/models/security/models/action-plan/action-plan-read-photo.model';

export const ActionPlanViewModal = ({
  companyId,
  recommendationId,
  riskDataId,
  workspaceId,
}: {
  companyId: string;
  recommendationId: string;
  riskDataId: string;
  workspaceId: string;
}) => {
  {
    /* -//! remove need to change to new format */
  }
  const { onStackOpenModal } = useOldModal();
  {
    /* -//! remove need to change to new format */
  }

  const addPhoto = useMutateAddActionPlanPhoto();
  const deletePhoto = useMutateDeleteActionPlanPhoto();

  const { actionPlan, isLoading } = useFetchReadActionPlan({
    companyId,
    recommendationId,
    riskDataId,
    workspaceId,
  });

  const handleAddPhoto = () => {
    /* -//! remove need to change to new format */
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: 'Andamento da Recomendação',
      onConfirm: async (photo) => {
        console.log('photo', photo);
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

  const title = actionPlan?.name
    ? `${actionPlan.name} (${actionPlan.originType})`
    : 'carregando...';

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.ACTION_PLAN_VIEW}
      title={title}
      closeButtonOptions={{
        text: 'Fechar',
      }}
    >
      {isLoading || !actionPlan ? (
        <SSkeleton height={30} width={300} />
      ) : (
        <Box display="flex" flex={1} flexDirection="column">
          <Box mb={16}>
            <SText color="grey.600" fontSize={18}>
              Recomendação
            </SText>
            <SDivider sx={{ mt: 3, mb: 6 }} />
            <SText mb={10} fontSize={16}>
              {actionPlan.recommendation.name}
            </SText>
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

          <Box>
            <SText color="grey.600" fontSize={18}>
              Fotos da caracterização do risco
            </SText>
            <SDivider sx={{ mt: 3, mb: 8 }} />
            {actionPlan?.characterizationPhotos?.length > 0 ? (
              <ActionPlanSliderPhotos
                photos={actionPlan.characterizationPhotos}
              />
            ) : (
              <SText>Nenhuma foto disponível</SText>
            )}
          </Box>
        </Box>
      )}
    </SModalWrapper>
  );
};
