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
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import {
  inlineRiskToolHeightSx,
} from 'pages/dashboard/empresas/[companyId]/novo/[stage]/constants/characterization-inline-layout.constants';
import { getCurrentRiskGroupId } from '../../utils/get-current-risk-group-id.util';
import { ModalAiAnalysisContent } from '../ModalAiAnalysisContent/ModalAiAnalysisContent';
import { setRiskAddState } from 'store/reducers/hierarchy/riskAddSlice';
import { useAppDispatch } from 'core/hooks/useAppDispatch';

const RiskToolForCharacterization: React.FC<{
  riskGroupId: string;
  characterizationId: string;
  riskContextCompanyId?: string;
}> = ({ riskGroupId, characterizationId, riskContextCompanyId }) => {
  const dispatch = useAppDispatch();

  // Embedded: keep view in Redux only — do not rewrite parent page URL
  // (URL ghoId/viewData churn blanks the inline characterization shell).
  useEffect(() => {
    if (!characterizationId) return;
    dispatch(
      setRiskAddState({
        viewData: ViewsDataEnum.CHARACTERIZATION as any,
      }),
    );
  }, [characterizationId, dispatch]);

  return (
    <RiskToolV2
      riskGroupId={riskGroupId}
      riskContextCompanyId={riskContextCompanyId}
      embedded
    />
  );
};

export const ModalAddHierarchyRisk = (
  props: IUseEditCharacterization & {
    mt?: number | string;
    children: ReactNode;
    embedded?: boolean;
  },
) => {
  const {
    onAddHierarchy,
    hierarchies,
    dataLoading: characterizationLoading,
    isDetailLoading,
    isDetailError,
    mt = 10,
    isEdit,
    children,
    data,
    query,
    embedded = false,
  } = props;
  const isDisable = !data?.type;

  const { data: riskGroupData, isLoading: isLoadingRiskGroup } =
    useQueryRiskGroupData(data.companyId || undefined);
  const riskGroupId = useMemo(
    () => getCurrentRiskGroupId(riskGroupData),
    [riskGroupData],
  );

  return (
    <Box
      mt={embedded ? 0 : mt}
      sx={{
        ...(embedded && {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          height: '100%',
        }),
      }}
    >
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
        <Box
          sx={{
            px: embedded ? 0 : 5,
            pb: embedded ? 4 : 10,
            ...(embedded && {
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
            }),
          }}
        >
          {children}
        </Box>
        <Box
          sx={{
            px: embedded ? 0 : 5,
            pb: embedded ? 4 : 10,
            ...(embedded && {
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
            }),
          }}
        >
          <HierarchyHomoTable
            onAdd={onAddHierarchy}
            loading={characterizationLoading}
            hierarchies={hierarchies as any}
            isCreate={!isEdit}
          />
        </Box>
        <Box
          sx={{
            px: embedded ? 0 : 5,
            pb: 0,
            ...(isEdit && {
              ...(embedded
                ? inlineRiskToolHeightSx
                : {
                    height: 'calc(100vh - 150px)',
                    minHeight: 0,
                    '@supports (height: 100dvh)': {
                      height: 'calc(100dvh - 150px)',
                    },
                  }),
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }),
          }}
        >
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
          {isEdit && isDetailLoading && (
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
          {isEdit && isDetailError && !isDetailLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <SText variant="body1" textAlign="center" color="error">
                Não foi possível carregar os dados da caracterização.
              </SText>
            </Box>
          )}
          {isEdit && !isDetailLoading && !isDetailError && isLoadingRiskGroup && (
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
          {isEdit && !isDetailLoading && !isDetailError && !isLoadingRiskGroup && !riskGroupId && (
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
          {isEdit && !isDetailLoading && !isDetailError && !isLoadingRiskGroup && riskGroupId && (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <RiskToolForCharacterization
                riskGroupId={riskGroupId}
                characterizationId={data.id}
                riskContextCompanyId={data.companyId}
              />
            </Box>
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
            {query?.files?.map((file) => {
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
            {query?.files?.map((file, i) => {
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
