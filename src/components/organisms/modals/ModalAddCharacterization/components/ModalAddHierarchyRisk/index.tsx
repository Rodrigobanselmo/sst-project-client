/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode } from 'react';
import { Wizard } from 'react-use-wizard';

import { Box, Grid } from '@mui/material';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { IUseEditCharacterization } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import { HierarchyHomoTable } from 'components/organisms/tables/HierarchyHomoTable/HierarchyHomoTable';
import SText from 'components/atoms/SText';
import SFlex from 'components/atoms/SFlex';

export const ModalAddHierarchyRisk = ({
  onAddHierarchy,
  onAddRisk,
  hierarchies,
  dataLoading: characterizationLoading,
  mt = 10,
  isEdit,
  children,
  data,
  query,
}: IUseEditCharacterization & {
  mt?: number | string;
  children: ReactNode;
}) => {
  const isDisable = !data?.type;
  return (
    <Box mt={mt}>
      <Wizard
        header={
          <WizardTabs
            onChangeTab={(v, cb) =>
              !isDisable ? (v != 2 ? cb(v) : onAddRisk?.()) : undefined
            }
            options={[
              { label: 'Dados' },
              { label: 'Cargos', disabled: isDisable },
              { label: 'Fatores de Riscos', disabled: isDisable },
              { label: 'Audios e Videos', disabled: isDisable },
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
        <Box sx={{ px: 5, pb: 10 }}>{/* <ExamsRiskTable /> */}</Box>
        <Box sx={{ px: 5, pb: 10 }}>
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
            {query.files?.map((file) => {
              const url = String(file?.url);
              const isVideo = url && url.includes('.mp4');

              if (isVideo)
                return (
                  <Box>
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
      </Wizard>
    </Box>
  );
};
