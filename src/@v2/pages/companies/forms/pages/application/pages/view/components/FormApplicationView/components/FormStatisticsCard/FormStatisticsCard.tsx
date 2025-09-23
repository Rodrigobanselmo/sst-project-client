import React from 'react';

import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { Box } from '@mui/material';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

interface StatisticsCardProps {
  totalAnswers: number;
  totalParticipants: number;
  averageTimeSpent: number | null;
}

export const FormStatisticsCard: React.FC<StatisticsCardProps> = ({
  totalAnswers,
  totalParticipants,
  averageTimeSpent,
}) => {
  const { companyId } = useGetCompanyId();

  const formatTime = (seconds: number | null): string => {
    if (seconds === null || seconds === 0) return '-';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const isSefaz = companyId === '4a9538bf-be7a-4cc2-9f34-09fe0d486305';

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
        <SFlex
          direction="row"
          gap={4}
          px={2}
          align="center"
          sx={{ p: 3, px: 5 }}
        >
          <InsertChartIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <SFlex direction="row" gap={2} align="center">
            <SText
              sx={{ fontSize: 18, fontWeight: 500, color: 'text.primary' }}
            >
              {totalAnswers}
            </SText>
            <SText sx={{ fontSize: 14, color: 'text.primary' }}>
              Respostas
            </SText>
          </SFlex>
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
        <SFlex direction="row" gap={4} px={2} align="center">
          <GroupIcon sx={{ fontSize: 32, color: '#1976d2' }} />
          <SFlex direction="row" gap={2} align="center">
            <SText
              sx={{ fontSize: 18, fontWeight: 500, color: 'text.primary' }}
            >
              {isSefaz ? 2622 : totalParticipants}
            </SText>
            <SText sx={{ fontSize: 14, color: 'text.primary' }}>
              Participantes
            </SText>
          </SFlex>
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
        <SFlex direction="row" gap={4} px={2} align="center">
          <AccessTimeIcon sx={{ fontSize: 32, color: 'tag.edit' }} />
          <SFlex direction="row" gap={2} align="center">
            <SText
              sx={{ fontSize: 18, fontWeight: 500, color: 'text.primary' }}
            >
              {formatTime(averageTimeSpent)}
            </SText>
            <SText sx={{ fontSize: 14, color: 'text.primary' }}>
              Tempo Médio
            </SText>
          </SFlex>
        </SFlex>
      </SPaper>
    </SFlex>
  );
};
