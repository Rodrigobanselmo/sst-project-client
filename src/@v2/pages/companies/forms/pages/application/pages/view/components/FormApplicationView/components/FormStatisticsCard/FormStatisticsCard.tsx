import React from 'react';

import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { Box, CircularProgress } from '@mui/material';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

interface StatisticsCardProps {
  totalAnswers: number;
  respondedParticipantsCount?: number;
  totalParticipants: number;
  averageTimeSpent: number | null;
  participationGoal?: number;
  isShareableLink: boolean;
}

export const FormStatisticsCard: React.FC<StatisticsCardProps> = ({
  totalAnswers,
  respondedParticipantsCount,
  totalParticipants,
  averageTimeSpent,
  participationGoal,
  isShareableLink,
}) => {
  const campaignRespondedCount = isShareableLink
    ? totalAnswers
    : (respondedParticipantsCount ?? totalAnswers);
  const countLabel = isShareableLink ? 'Respostas' : 'Responderam';
  const goalCountLabel = isShareableLink
    ? 'respostas da meta'
    : 'respondentes da meta';
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
  const participants = isSefaz ? 1780 : totalParticipants;

  const calculateGoalParticipants = () => {
    if (!participationGoal || participants === 0) return 0;
    return Math.ceil((participants * participationGoal) / 100);
  };

  const calculateProgressPercentage = () => {
    if (!participationGoal || goalParticipants === 0) return 0;
    return Math.min((campaignRespondedCount / goalParticipants) * 100, 100);
  };

  const goalParticipants = calculateGoalParticipants();
  const progressPercentage = calculateProgressPercentage();
  const remainingForGoal = Math.max(
    0,
    goalParticipants - campaignRespondedCount,
  );

  return (
    <SFlex direction="column" gap={4}>
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
                {campaignRespondedCount}
              </SText>
              <SText sx={{ fontSize: 14, color: 'text.primary' }}>
                {countLabel}
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
                {isSefaz ? 1780 : totalParticipants}
              </SText>
              <SText sx={{ fontSize: 14, color: 'text.primary' }}>
                Participantes
              </SText>
            </SFlex>
          </SFlex>
        </SPaper>

        {participationGoal && (
          <SPaper
            sx={{
              p: 3,
              borderRadius: 2,
              minWidth: 220,
              textAlign: 'center',
            }}
          >
            <SFlex
              direction="row"
              gap={3}
              px={1}
              align="center"
              justify="center"
            >
              <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={22}
                  thickness={8}
                  sx={{
                    color: 'rgba(0, 0, 0, 0.1)',
                    position: 'absolute',
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={progressPercentage}
                  size={22}
                  thickness={8}
                  sx={{
                    color: '#4caf50',
                  }}
                />
              </Box>
              <SText
                sx={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'text.primary',
                  textAlign: 'left',
                }}
              >
                {Math.round(progressPercentage)}% da meta
              </SText>
            </SFlex>
            <SFlex direction="column" gap={0.5} mt={1.5} align="center">
              <SText sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.35 }}>
                {campaignRespondedCount}/{goalParticipants} {goalCountLabel}
              </SText>
              <SText sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.35 }}>
                faltam {remainingForGoal} para atingir {participationGoal}%
              </SText>
            </SFlex>
          </SPaper>
        )}

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
    </SFlex>
  );
};
