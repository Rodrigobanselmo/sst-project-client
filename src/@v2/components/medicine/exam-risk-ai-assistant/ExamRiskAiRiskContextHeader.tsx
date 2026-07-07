import { FC } from 'react';

import { Chip, Stack, Typography } from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

import {
  formatExamRiskAiRiskCategoryChipLabel,
  formatExamRiskAiRiskMetadataLine,
  isExamRiskAiKnownRiskType,
  type ExamRiskAiRiskContextDisplay,
} from './exam-risk-ai-risk-context-display.util';

type Props = ExamRiskAiRiskContextDisplay;

const riskChipPalette: Partial<
  Record<RiskTypeEnum, { color: string; bgcolor: string }>
> = {
  [RiskTypeEnum.ACI]: { color: 'risk.aci', bgcolor: 'risk.aciFade' },
  [RiskTypeEnum.ERG]: { color: 'risk.erg', bgcolor: 'risk.ergFade' },
  [RiskTypeEnum.FIS]: { color: 'risk.fis', bgcolor: 'risk.fisFade' },
  [RiskTypeEnum.QUI]: { color: 'risk.qui', bgcolor: 'risk.quiFade' },
  [RiskTypeEnum.BIO]: { color: 'risk.bio', bgcolor: 'risk.bioFade' },
  [RiskTypeEnum.OUTROS]: { color: 'risk.outros', bgcolor: 'risk.outrosFade' },
};

export const ExamRiskAiRiskContextHeader: FC<Props> = ({
  riskName,
  riskType,
  riskTypeLabel,
  riskSubTypes,
  riskCas,
  riskEsocialCode,
}) => {
  const categoryChipLabel = formatExamRiskAiRiskCategoryChipLabel({
    riskType,
    riskTypeLabel,
  });
  const metadataLine = formatExamRiskAiRiskMetadataLine({
    riskCas,
    riskEsocialCode,
  });
  const knownRiskType = isExamRiskAiKnownRiskType(riskType)
    ? riskType
    : undefined;
  const categoryPalette = knownRiskType
    ? riskChipPalette[knownRiskType]
    : undefined;

  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2" fontWeight={600} color="text.primary">
        {riskName}
      </Typography>

      <SFlex alignItems="center" gap={0.5} flexWrap="wrap">
        {knownRiskType && <SRiskChip type={knownRiskType} size="md" />}

        {categoryChipLabel && (
          <Chip
            size="small"
            label={categoryChipLabel}
            sx={{
              height: 24,
              fontWeight: 500,
              fontSize: 11,
              ...(categoryPalette
                ? {
                    bgcolor: categoryPalette.bgcolor,
                    color: categoryPalette.color,
                    border: '1px solid',
                    borderColor: categoryPalette.color,
                  }
                : {}),
            }}
          />
        )}

        {riskSubTypes?.map((subType) => (
          <Chip
            key={subType.id}
            size="small"
            variant="outlined"
            label={subType.name}
            sx={{ height: 24, fontSize: 11 }}
          />
        ))}
      </SFlex>

      {metadataLine && (
        <Typography variant="caption" color="text.secondary">
          {metadataLine}
        </Typography>
      )}
    </Stack>
  );
};
