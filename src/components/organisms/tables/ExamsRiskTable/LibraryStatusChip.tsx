import { FC } from 'react';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Chip, CircularProgress, SxProps, Theme } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import SFlex from 'components/atoms/SFlex';

import { ExamRiskLibraryStatusEnum } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import {
  canShowApplyRecommendedExams,
  libraryStatusLabels,
  libraryStatusOutsideLibraryAuxiliaryTooltip,
  libraryStatusOutsideLibraryTooltip,
  pcmsoLinkStatusLabels,
  resolveLibraryStatus,
  resolveLibraryStatusTooltip,
  resolvePcmsoLinkStatusTooltip,
  type ResolveApplyRecommendedExamsContext,
} from '@v2/services/medicine/company-exam-risk-link-status/pcmso-link-status-display.util';
import type { IExamRiskLinkStatusItem } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import { PcmsoLinkStatusEnum } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';

const pillBaseSx: SxProps<Theme> = {
  height: 24,
  borderRadius: '999px',
  fontWeight: 600,
  '& .MuiChip-label': {
    px: 1.25,
    fontSize: 12,
    lineHeight: 1.2,
  },
};

const pillVariantSx: Record<ExamRiskLibraryStatusEnum, SxProps<Theme>> = {
  [ExamRiskLibraryStatusEnum.OK]: {
    ...pillBaseSx,
    bgcolor: 'success.main',
    color: 'common.white',
    border: '1px solid',
    borderColor: 'success.dark',
  },
  [ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE]: {
    ...pillBaseSx,
    bgcolor: '#FFF4E5',
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'warning.main',
  },
  [ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED]: {
    ...pillBaseSx,
    bgcolor: '#FFF4E5',
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'warning.main',
  },
  [ExamRiskLibraryStatusEnum.MISSING_RECOMMENDED_EXAMS]: {
    ...pillBaseSx,
    bgcolor: '#FFF8E1',
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'warning.main',
  },
  [ExamRiskLibraryStatusEnum.INDIRECT_BIOLOGICAL_ONLY]: {
    ...pillBaseSx,
    bgcolor: '#E8F4FD',
    color: 'info.dark',
    border: '1px solid',
    borderColor: 'info.main',
  },
};

type Props = {
  statusItem?: IExamRiskLinkStatusItem;
  loading?: boolean;
  applyRecommendedExamsContext?: ResolveApplyRecommendedExamsContext;
};

const PillWithTooltip: FC<{
  label: string;
  sx: SxProps<Theme>;
  tooltip?: string;
}> = ({ label, sx, tooltip }) => {
  const pill = <Chip size="small" label={label} sx={sx} />;

  if (!tooltip) return pill;

  return (
    <STooltip title={tooltip} minLength={0} withWrapper placement="top">
      {pill}
    </STooltip>
  );
};

const NoLibraryPill: FC<{
  showAuxiliaryMarker?: boolean;
  auxiliaryTooltip?: string;
}> = ({ showAuxiliaryMarker = false, auxiliaryTooltip }) => (
  <SFlex align="center" gap={0.5}>
    <PillWithTooltip
      label={libraryStatusLabels[ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE]}
      sx={pillVariantSx[ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE]}
      tooltip={libraryStatusOutsideLibraryTooltip}
    />
    {showAuxiliaryMarker && auxiliaryTooltip && (
      <STooltip
        title={auxiliaryTooltip}
        minLength={0}
        withWrapper
        placement="top"
      >
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            lineHeight: 0,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'warning.dark' }} />
        </Box>
      </STooltip>
    )}
  </SFlex>
);

const resolveLegacyPillLabel = (
  status: PcmsoLinkStatusEnum,
  item?: IExamRiskLinkStatusItem,
): string => {
  const libraryStatus = resolveLibraryStatus(item);
  if (libraryStatus) return libraryStatusLabels[libraryStatus];

  switch (status) {
    case PcmsoLinkStatusEnum.OK:
      return libraryStatusLabels[ExamRiskLibraryStatusEnum.OK];
    case PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE:
      return libraryStatusLabels[ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE];
    default:
      return pcmsoLinkStatusLabels[status];
  }
};

const resolveLegacyPillSx = (
  status: PcmsoLinkStatusEnum,
  item?: IExamRiskLinkStatusItem,
): SxProps<Theme> => {
  const libraryStatus = resolveLibraryStatus(item);
  if (libraryStatus) return pillVariantSx[libraryStatus];

  if (status === PcmsoLinkStatusEnum.OK) {
    return pillVariantSx[ExamRiskLibraryStatusEnum.OK];
  }

  if (status === PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE) {
    return pillVariantSx[ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE];
  }

  return pillVariantSx[ExamRiskLibraryStatusEnum.MISSING_RECOMMENDED_EXAMS];
};

export const LibraryStatusChip: FC<Props> = ({
  statusItem,
  loading,
  applyRecommendedExamsContext,
}) => {
  if (loading) {
    return <CircularProgress size={16} />;
  }

  const libraryStatus = resolveLibraryStatus(statusItem);
  const hasApplicableRecommendedExams = canShowApplyRecommendedExams(
    statusItem,
    applyRecommendedExamsContext,
  );

  if (
    libraryStatus === ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE ||
    libraryStatus === ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED
  ) {
    return (
      <NoLibraryPill
        showAuxiliaryMarker={
          libraryStatus === ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED &&
          hasApplicableRecommendedExams
        }
        auxiliaryTooltip={
          hasApplicableRecommendedExams
            ? libraryStatusOutsideLibraryAuxiliaryTooltip
            : undefined
        }
      />
    );
  }

  if (libraryStatus) {
    return (
      <PillWithTooltip
        label={libraryStatusLabels[libraryStatus]}
        sx={pillVariantSx[libraryStatus]}
        tooltip={resolveLibraryStatusTooltip(statusItem)}
      />
    );
  }

  const legacyStatus = statusItem?.pcmsoStatus;

  if (!legacyStatus) {
    return <Chip size="small" label="—" sx={pillBaseSx} />;
  }

  if (legacyStatus === PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE) {
    return <NoLibraryPill />;
  }

  if (
    legacyStatus === PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED &&
    statusItem?.nonRecommendedLink
  ) {
    return (
      <NoLibraryPill
        showAuxiliaryMarker={hasApplicableRecommendedExams}
        auxiliaryTooltip={
          hasApplicableRecommendedExams
            ? libraryStatusOutsideLibraryAuxiliaryTooltip
            : undefined
        }
      />
    );
  }

  return (
    <PillWithTooltip
      label={resolveLegacyPillLabel(legacyStatus, statusItem)}
      sx={resolveLegacyPillSx(legacyStatus, statusItem)}
      tooltip={resolvePcmsoLinkStatusTooltip(legacyStatus, statusItem?.message)}
    />
  );
};
