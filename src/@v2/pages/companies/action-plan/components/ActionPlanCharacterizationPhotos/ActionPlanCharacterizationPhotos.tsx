import { Box } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { ActionPlanReadModel } from '@v2/models/security/models/action-plan/action-plan-read.model';
import { ActionPlanSliderPhotos } from '../ActionPlanTable/components/ActionPlanViewModal/components/ActionPlanSliderPhotos';
import { useMutateEditManyPhotoRecommendation } from '@v2/services/security/characterization/photo-recommendation/edit-many-photo-recommendation/hooks/useMutateEditManyPhotoRecommendation';
import { useCallback } from 'react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { ActionPlanReadPhotoModel } from '@v2/models/security/models/action-plan/action-plan-read-photo.model';
import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';
export const ActionPlanCharacterizationPhotos = ({
  actionPlan,
}: {
  actionPlan: ActionPlanReadModel;
}) => {
  const editPhotoMut = useMutateEditManyPhotoRecommendation();
  const { isCharacterizationManager } = usePermissionsAccess();

  const callEditMutation = useCallback(
    (photoIds: string[], hide: boolean) => {
      if (!photoIds || photoIds.length === 0) {
        return;
      }

      editPhotoMut.mutate({
        companyId: actionPlan.companyId,
        riskDataId: actionPlan.uuid.riskDataId,
        recommendationId: actionPlan.uuid.recommendationId,
        photoIds,
        isVisible: hide,
      });
    },
    [actionPlan, editPhotoMut],
  );

  const handleHideAll = () => {
    const allPhotoIds =
      actionPlan?.characterizationPhotos?.map((p) => p.id) ?? [];
    if (allPhotoIds.length > 0) {
      callEditMutation(allPhotoIds, false);
    }
  };

  const handleShowAll = () => {
    const allPhotoIds =
      actionPlan?.characterizationPhotos?.map((p) => p.id) ?? [];
    if (allPhotoIds.length > 0) {
      callEditMutation(allPhotoIds, true);
    }
  };

  const handleEditSinglePhotoVisibility = useCallback(
    (photo: ActionPlanReadPhotoModel) => {
      if (photo.id) {
        callEditMutation([photo.id], !photo.isVisible);
      }
    },
    [callEditMutation],
  );

  const hasPhotos =
    actionPlan?.characterizationPhotos &&
    actionPlan.characterizationPhotos.length > 0;

  const canEditVisibility = hasPhotos && isCharacterizationManager;

  const isLoading = editPhotoMut.isPending;

  return (
    <Box>
      <SFlex justify="space-between">
        <SText color="grey.600" fontSize={18}>
          Fotos da caracterização do risco
        </SText>
        {canEditVisibility && (
          <SFlex gap={4}>
            <SButton
              color="success"
              text="Mostrar todas"
              icon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              loading={isLoading}
              onClick={handleShowAll}
            />
            <SButton
              color="danger"
              text="Ocultar todas"
              icon={<VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />}
              loading={isLoading}
              onClick={handleHideAll}
            />
          </SFlex>
        )}
      </SFlex>
      <SDivider sx={{ mt: 3, mb: 8 }} />
      {hasPhotos ? (
        <ActionPlanSliderPhotos
          photos={actionPlan.characterizationPhotos}
          showInvisible={canEditVisibility}
          {...(canEditVisibility && {
            onChangeVisibility: handleEditSinglePhotoVisibility,
          })}
        />
      ) : (
        <SText>Nenhuma foto disponível</SText>
      )}
    </Box>
  );
};
