/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode, useEffect, useMemo } from 'react';
import { Wizard } from 'react-use-wizard';

import { Box, CircularProgress, Grid } from '@mui/material';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { RiskToolV2 } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/RiskTool';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/view-data-type.constant';
import { IUseEditCharacterization } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import { HierarchyHomoTable } from 'components/organisms/tables/HierarchyHomoTable/HierarchyHomoTable';
import SText from 'components/atoms/SText';
import SFlex from 'components/atoms/SFlex';
import { useRouter } from 'next/router';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { ModalAiAnalysisContent } from '../ModalAiAnalysisContent/ModalAiAnalysisContent';

const RiskToolForCharacterization: React.FC<{
  riskGroupId: string;
  characterizationId: string;
}> = ({ riskGroupId, characterizationId }) => {
  const router = useRouter();

  useEffect(() => {
    if (!characterizationId) return;
    const { query, pathname } = router;
    if (
      query.ghoId === characterizationId &&
      query.viewData === ViewsDataEnum.CHARACTERIZATION
    ) {
      return;
    }

    router.replace(
      {
        pathname,
        query: {
          ...query,
          viewData: ViewsDataEnum.CHARACTERIZATION,
          ghoId: characterizationId,
        },
      },
      undefined,
      { shallow: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterizationId]);

  return <RiskToolV2 riskGroupId={riskGroupId} />;
};

export const ModalAddHierarchyRisk = (
  props: IUseEditCharacterization & {
    mt?: number | string;
    children: ReactNode;
  },
) => {
  const {
    onAddHierarchy,
    hierarchies,
    dataLoading: characterizationLoading,
    mt = 10,
    isEdit,
    children,
    data,
    query,
  } = props;
  const isDisable = !data?.type;

  const { data: riskGroupData, isLoading: isLoadingRiskGroup } =
    useQueryRiskGroupData();
  const riskGroupId = useMemo(() => {
    if (!riskGroupData || riskGroupData.length === 0) return undefined;
    return riskGroupData[riskGroupData.length - 1]?.id;
  }, [riskGroupData]);

  return (
    <Box mt={mt}>
      <Wizard
        header={
          <WizardTabs
            onChangeTab={(v, cb) => (!isDisable ? cb(v) : undefined)}
            options={[
              { label: 'Dados' },
              { label: 'Cargos', disabled: isDisable },
              { label: 'Fatores de Riscos', disabled: isDisable || !isEdit },
              { label: 'Audios e Videos', disabled: isDisable },
              { label: 'Análise IA', disabled: isDisable },
            ]}
          />
        }
      >
        <Box sx={{ px: 5, pb: 10 }}>{children}</Box>
        <Box sx={{ px: 5, pb: 10 }}>
          <HierarchyHomoTable
            onAdd={onAddHierarchy}
            loading={characterizationLoading}
            hierarchies={hierarchies as any}
            isCreate={!isEdit}
          />
        </Box>
        <Box sx={{ px: 5, pb: 10 }}>
          {!isEdit && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <SText variant="body1" textAlign="center">
                Salve a caracterização antes de adicionar fatores de risco.
              </SText>
            </Box>
          )}
          {isEdit && isLoadingRiskGroup && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {isEdit && !isLoadingRiskGroup && !riskGroupId && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <SText variant="body1" textAlign="center">
                Nenhum grupo de risco encontrado.
              </SText>
            </Box>
          )}
          {isEdit && !isLoadingRiskGroup && riskGroupId && (
            <RiskToolForCharacterization
              riskGroupId={riskGroupId}
              characterizationId={data.id}
            />
          )}
        </Box>
        <Box sx={{ px: 5, pb: 10 }}>
          {!!data.description && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 8,
                mb: 2,
              }}
            >
              <SText variant="body1" textAlign="center">
                {data.description}
              </SText>
            </Box>
          )}
          {!query?.files?.length && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 8,
              }}
            >
              <SText variant="body1" textAlign="center">
                Nenhum aquivo encontrado. <br />
                Arquivos atualmente só podem ser adicionados pelo aplicativo
                mobile
              </SText>
            </Box>
          )}
          <Box
            sx={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              display: 'grid',
              gap: 2,
            }}
          >
            {query.files?.map((file) => {
              const url = String(file?.url);
              const isAudio = url && url.includes('.mp3');

              if (isAudio)
                return (
                  <audio controls key={file.id}>
                    <source src={String(file?.url)} type="audio/mpeg" />
                  </audio>
                );

              return null;
            })}
          </Box>
          <Box
            sx={{
              gridTemplateColumns: '1fr',
              display: 'grid',
              mt: 5,
            }}
          >
            {query.files?.map((file, i) => {
              const url = String(file?.url);
              const isVideo = url && url.includes('.mp4');

              if (isVideo)
                return (
                  <Box key={i}>
                    <video
                      controls
                      key={file.id}
                      src={url}
                      style={{
                        height: '400px',
                        width: '100%',
                        marginTop: 10,
                      }}
                    />
                  </Box>
                );

              return null;
            })}
          </Box>
        </Box>
        <ModalAiAnalysisContent {...props} />
      </Wizard>
    </Box>
  );
};
