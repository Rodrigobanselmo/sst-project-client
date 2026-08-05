import { FC } from 'react';

import { Box, Chip, CircularProgress, SxProps, Theme } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import {
  coverageStatusLabels,
  coverageStatusPillSx,
  coverageStatusTooltips,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-display.util';
import {
  CompanyExamRiskCoverageStatusEnum,
  type ICompanyExamRiskCoverageItem,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';

type Props = {
  item?: Pick<ICompanyExamRiskCoverageItem, 'coverageStatus'>;
  loading?: boolean;
  onClick?: () => void;
};

const PillWithTooltip: FC<{
  label: string;
  sx: SxProps<Theme>;
  tooltip: string;
  onClick?: () => void;
}> = ({ label, sx, tooltip, onClick }) => (
  <STooltip title={tooltip} withWrapper>
    <Chip
      size="small"
      label={label}
      sx={sx}
      onClick={
        onClick
          ? (event) => {
              event.stopPropagation();
              onClick();
            }
          : undefined
      }
    />
  </STooltip>
);

export const CoverageStatusChip: FC<Props> = ({ item, loading, onClick }) => {
  if (loading) {
    return (
      <Box display="flex" alignItems="center" minHeight={24}>
        <CircularProgress size={14} />
      </Box>
    );
  }

  const status =
    item?.coverageStatus ??
    CompanyExamRiskCoverageStatusEnum.NO_LIBRARY_RECOMMENDATION;

  return (
    <PillWithTooltip
      label={coverageStatusLabels[status]}
      sx={coverageStatusPillSx[status]}
      tooltip={coverageStatusTooltips[status]}
      onClick={onClick}
    />
  );
};
