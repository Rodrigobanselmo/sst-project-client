import { FC, ReactNode } from 'react';

import { Box } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { ExamRiskCharacterizationStatusEnum } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import {
  characterizationStatusTooltips,
  resolveCharacterizationStatus,
} from '@v2/services/medicine/company-exam-risk-link-status/pcmso-link-status-display.util';
import type { IExamRiskLinkStatusItem } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';

const MARKER_SIZE = 11;
const MARKER_SLOT_WIDTH = 16;

const dotColors: Record<ExamRiskCharacterizationStatusEnum, string> = {
  [ExamRiskCharacterizationStatusEnum.IN_CHARACTERIZATION]: 'success.main',
  [ExamRiskCharacterizationStatusEnum.OUT_OF_CHARACTERIZATION]: 'error.main',
};

type Props = {
  statusItem?: IExamRiskLinkStatusItem;
  loading?: boolean;
};

const MarkerSlot: FC<{ children?: ReactNode }> = ({ children }) => (
  <Box
    sx={{
      width: MARKER_SLOT_WIDTH,
      minWidth: MARKER_SLOT_WIDTH,
      height: MARKER_SIZE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {children}
  </Box>
);

export const CharacterizationStatusChip: FC<Props> = ({
  statusItem,
  loading,
}) => {
  if (loading) {
    return (
      <MarkerSlot>
        <Box
          sx={{
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            borderRadius: '50%',
            bgcolor: 'grey.400',
            opacity: 0.6,
          }}
        />
      </MarkerSlot>
    );
  }

  const status = resolveCharacterizationStatus(statusItem);

  if (!status) {
    return <MarkerSlot />;
  }

  const dot = (
    <Box
      sx={{
        width: MARKER_SIZE,
        height: MARKER_SIZE,
        borderRadius: '50%',
        bgcolor: dotColors[status],
        flexShrink: 0,
      }}
    />
  );

  return (
    <STooltip
      title={characterizationStatusTooltips[status]}
      minLength={0}
      withWrapper
      placement="top"
    >
      <MarkerSlot>{dot}</MarkerSlot>
    </STooltip>
  );
};
