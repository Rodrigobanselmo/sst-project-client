import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

import { Box } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import SFlex from 'components/atoms/SFlex';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STag } from 'components/atoms/STag';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { useRouter } from 'next/router';

import { SExamIcon } from 'assets/icons/SExamIcon';

import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import SGraphTitle from '../title';
import { UnmountBoxProps } from './types';

ChartJS.register(ArcElement, Tooltip, Legend);

export const PieGraph = ({ data, dataset, ...props }: UnmountBoxProps) => {
  // if (dataset) data.labels = dataset?.map((dt) => dt.label);
  if (dataset && data.datasets?.[0]) {
    data.datasets[0].backgroundColor = dataset?.map((dt) => dt.color);
    data.datasets[0].borderColor = dataset?.map((dt) => dt.borderColor);
    data.datasets[0].data = dataset?.map((dt) => dt.data);
  }
  const { push } = useRouter();
  const { companyId } = useGetCompanyId();

  return (
    <>
      <Box
        {...props}
        sx={{
          backgroundColor: 'background.paper',
          boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
          width: 'fit-content',
          px: 10,
          pt: 8,
          borderRadius: 2,
          ...props.sx,
        }}
      >
        <Box
          sx={{
            borderBottom: '1px solid',
            mb: 5,
            borderColor: 'background.divider',
          }}
        >
          <SGraphTitle mb={4} icon={SExamIcon}>
            Exames
          </SGraphTitle>
        </Box>
        <SFlex {...props} gap={10}>
          <Box sx={{ width: 350, pb: 5 }}>
            <Doughnut data={data} />
          </Box>
          <Box
            sx={{
              p: 5,
              height: 'fit-content',
            }}
          >
            <Box>
              {dataset?.map((dt) => {
                return (
                  <SFlex key={dt.label} align="center">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: 10,
                        backgroundColor: dt.borderColor,
                      }}
                    />
                    <SText fontSize={14}>
                      {dt.label}:{' '}
                      <SText component="span" fontSize={14}>
                        {dt.data}
                      </SText>
                    </SText>
                  </SFlex>
                );
              })}

              <STagButton
                // large
                mt={10}
                // icon={SZooInIcon}
                text="Agendar Exames"
                iconProps={{ sx: { fontSize: 17 } }}
                onClick={() =>
                  push(
                    RoutesEnum.SCHEDULE.replace(':companyId', companyId || ''),
                  )
                }
              />
            </Box>
          </Box>
        </SFlex>
      </Box>
    </>
  );
};
