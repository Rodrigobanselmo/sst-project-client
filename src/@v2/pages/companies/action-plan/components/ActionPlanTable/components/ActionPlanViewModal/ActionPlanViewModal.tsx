import { Box } from '@mui/material';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { useFetchReadActionPlan } from '@v2/services/security/action-plan/action-plan/read-action-plan/hooks/useFetchReadActionPlan';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ActionPlanSliderPhotos } from './components/ActionPlanSliderPhotos';
import PhotoIcon from '@mui/icons-material/Photo';
import { ActionPlanEmptyPhotos } from './components/ActionPlanEmptyPhotos';

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
  const { actionPlan, isLoading } = useFetchReadActionPlan({
    companyId,
    recommendationId,
    riskDataId,
    workspaceId,
  });

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    centerMode: true,
    centerPadding: '0px',
    responsive: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
        },
      },
    ],
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
            <SText fontSize={18} mb={8}>
              Fotos da implementação da recomendação
            </SText>
            {actionPlan?.recommendationPhotos?.length > 0 ? (
              <ActionPlanSliderPhotos
                photos={actionPlan.recommendationPhotos}
              />
            ) : (
              <ActionPlanEmptyPhotos />
            )}
          </Box>

          <Box>
            <SText fontSize={18} mb={8}>
              Fotos da caracterização do risco
            </SText>
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
