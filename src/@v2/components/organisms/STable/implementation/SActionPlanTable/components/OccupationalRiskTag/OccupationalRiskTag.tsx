import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { OccupationalRiskLevelTranslation } from '@v2/models/security/translations/ocupational-risk-level.translation';
import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemOccupationalChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import {
  hasCustomMatrixSnapshot,
  resolveDisplayedOccupationalChipColorsFromHex,
  resolvePinnedCustomClassificationColor,
} from 'core/utils/helpers/matriz';
import { OccupationalRiskTagProps as OccupationalRiskTagProps } from './OccupationalRiskTag.types';

const sizeMap = {
  md: {
    fontSize: 12,
    padding: '1px 2px',
  },
};

export const OccupationalRiskTag = ({
  level,
  matrixSource,
  matrixVersionId,
  matrixEvaluatedAt,
  resolvedLabel,
  resolvedColor,
  classificationPresentationColor,
  size = 'md',
}: OccupationalRiskTagProps) => {
  const presentation = useSystemRiskMatrixPresentation();
  const isCustomSnapshot = hasCustomMatrixSnapshot({
    matrixSource,
    matrixVersionId,
    matrixEvaluatedAt,
    resolvedLabel,
  });

  if (isCustomSnapshot) {
    const customChip = resolveDisplayedOccupationalChipColorsFromHex(
      resolvePinnedCustomClassificationColor({
        matrixSource,
        matrixVersionId,
        liveColor: classificationPresentationColor,
        snapshotColor: resolvedColor,
      }),
    );
    const label =
      typeof resolvedLabel === 'string' && resolvedLabel.trim().length > 0
        ? resolvedLabel
        : '--';
    const colors = customChip ?? {
      bgcolor: 'grey.200',
      color: 'text.secondary',
    };

    return (
      <SFlex
        borderRadius={'4px'}
        center
        bgcolor={colors.bgcolor}
        p={sizeMap[size].padding}
        border={'1px solid'}
        borderColor={colors.bgcolor}
      >
        <SText
          fontWeight="500"
          color={colors.color}
          fontSize={sizeMap[size].fontSize}
        >
          {label}
        </SText>
      </SFlex>
    );
  }

  const colors = resolveSystemOccupationalChipColors(
    level,
    presentation,
    'action-plan-tag',
  );

  return (
    <SFlex
      borderRadius={'4px'}
      center
      bgcolor={colors.bgcolor}
      p={sizeMap[size].padding}
      border={'1px solid'}
      borderColor={level === 0 ? 'grey.300' : colors.bgcolor}
    >
      <SText
        fontWeight="500"
        color={colors.color}
        fontSize={sizeMap[size].fontSize}
      >
        {OccupationalRiskLevelTranslation[level]}
      </SText>
    </SFlex>
  );
};
