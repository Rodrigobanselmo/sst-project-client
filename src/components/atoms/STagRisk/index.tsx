import React from 'react';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import SFlex from '../SFlex';
import SText from '../SText';

interface ITagRiskProps {
  riskFactor: IRiskFactors;
  isEndDate?: boolean;

  hideRiskName?: boolean;
}

export const STagRisk = ({
  isEndDate,
  hideRiskName,
  riskFactor,
}: ITagRiskProps) => {
  return (
    <SText fontSize={14}>
      <SText
        fontSize={10}
        component="span"
        sx={{
          backgroundColor: `risk.${riskFactor?.type.toLowerCase()}`,
          color: 'common.white',
          display: 'inline-block',
          width: '40px',
          borderRadius: '4px',
          mr: 2,
          ...(isEndDate && { backgroundColor: 'error.main' }),
        }}
      >
        <SFlex center>{riskFactor?.type || ''}</SFlex>
      </SText>
      {!hideRiskName ? riskFactor?.name || '' : ''}
    </SText>
  );
};
