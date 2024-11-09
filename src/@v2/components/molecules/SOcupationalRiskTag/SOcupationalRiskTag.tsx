import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { OcupationalRiskLevelTranslation } from '@v2/models/security/translations/ocupational-risk-level.translation';
import { IRiskLevelValues } from '@v2/models/security/types/risk-level-values.type';
import { SOcupationalRiskTagProps } from './SOcupationalRiskTag.types';

const colorMap: Record<IRiskLevelValues, any> = {
  [0]: {
    bgcolor: 'transparent',
    borderColor: 'grey.300',
    color: 'text.main',
  },
  [1]: {
    bgcolor: 'scale.low',
    color: 'white',
  },
  [2]: {
    bgcolor: 'scale.mediumLow',
    color: 'white',
  },
  [3]: {
    bgcolor: 'scale.medium',
    color: 'white',
  },
  [4]: {
    bgcolor: 'scale.mediumHigh',
    color: 'white',
  },
  [5]: {
    bgcolor: 'scale.high',
    color: 'white',
  },
  [6]: {
    bgcolor: 'scale.veryHigh',
    color: 'white',
  },
};

const sizeMap = {
  md: {
    fontSize: 12,
    padding: '1px 2px',
  },
};

export const SOcupationalRiskTag = ({
  level,
  size = 'md',
}: SOcupationalRiskTagProps) => {
  return (
    <SFlex
      borderRadius={'4px'}
      center
      bgcolor={colorMap[level].bgcolor}
      p={sizeMap[size].padding}
      border={'1px solid'}
      borderColor={colorMap[level].borderColor || colorMap[level].bgcolor}
    >
      <SText
        fontWeight="500"
        color={colorMap[level].color}
        fontSize={sizeMap[size].fontSize}
      >
        {OcupationalRiskLevelTranslation[level]}
      </SText>
    </SFlex>
  );
};
