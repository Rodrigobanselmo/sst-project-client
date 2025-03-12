import { Box } from '@mui/material';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { useFetchReadActionPlan } from '@v2/services/security/action-plan/action-plan/read-action-plan/hooks/useFetchReadActionPlan';
import ScrollContainer from 'react-indiana-drag-scroll';
import Image from 'next/image';

export const ActionPlanComments = ({
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

  const title = actionPlan?.name
    ? `${actionPlan.name} (${actionPlan.originType})`
    : 'carregando...';

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.ACTION_PLAN_VIEW}
      title={title}
      semiFullScreen={true}
      closeButtonOptions={{
        text: 'Fechar',
      }}
    >
      {isLoading || !actionPlan ? (
        <SSkeleton height={30} width={300} />
      ) : (
        <Box display="flex" flex={1} flexDirection="column">
          <Box display="flex" flex={1} flexDirection="column">
            <SText fontSize={18}>Fotos da caracterização do risco</SText>
            {actionPlan?.characterizationPhotos?.length > 0 ? (
              <ScrollContainer
                horizontal={true}
                vertical={false}
                hideScrollbars={true}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  {actionPlan.characterizationPhotos.map((photo, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        minWidth: '400px',
                        height: '225px',
                        marginRight: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Blurred Background Image */}
                      <Image
                        src={photo.url}
                        alt={`Blurred background for characterization photo ${
                          index + 1
                        }`}
                        fill
                        style={{ objectFit: 'cover', filter: 'blur(10px)' }}
                        sizes="(max-width: 600px) 100vw, 300px"
                        priority={index === 0}
                      />
                      {/* Foreground Image */}
                      <Image
                        src={photo.url}
                        alt={`Characterization photo ${index + 1}`}
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 600px) 100vw, 300px"
                        priority={index === 0}
                      />
                    </Box>
                  ))}
                </Box>
              </ScrollContainer>
            ) : (
              <SText>Nenhuma foto disponível</SText>
            )}
          </Box>
        </Box>
      )}
    </SModalWrapper>
  );
};
