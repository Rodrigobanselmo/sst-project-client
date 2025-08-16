import React from 'react';

import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import InsertChartIcon from '@mui/icons-material/InsertChart';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { Box } from '@mui/material';

interface StatisticsCardProps {
  totalAnswers: number;
  totalParticipants: number;
}

export const FormStatisticsCard: React.FC<StatisticsCardProps> = ({
  totalAnswers,
  totalParticipants,
}) => {
  return (
    <SFlex gap={3} flexWrap="wrap">
      <SPaper
        sx={{
          borderRadius: 2,
          minWidth: 200,
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <SFlex direction="row" gap={2} align="center" sx={{ p: 3, px: 5 }}>
          <InsertChartIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <SText sx={{ fontSize: 24, fontWeight: 600, color: 'primary.main' }}>
            {totalAnswers}
          </SText>
          <SText sx={{ fontSize: 14, color: 'primary.main' }}>Respostas</SText>
        </SFlex>
      </SPaper>

      <SPaper
        sx={{
          p: 3,
          borderRadius: 2,
          minWidth: 200,
          textAlign: 'center',
        }}
      >
        <SFlex direction="row" gap={2} px={2} align="center">
          <GroupIcon sx={{ fontSize: 32, color: '#1976d2' }} />
          <SText sx={{ fontSize: 24, fontWeight: 600, color: '#1976d2' }}>
            {totalParticipants}
          </SText>
          <SText sx={{ fontSize: 14, color: '#1976d2' }}>Participantes</SText>
        </SFlex>
      </SPaper>
    </SFlex>
  );
};
