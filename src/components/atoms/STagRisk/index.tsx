import React from 'react';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import SFlex from '../SFlex';
import SText from '../SText';

interface ITagRiskProps {
  riskFactor: IRiskFactors;

  hideRiskName?: boolean;
}

export const STagRisk = ({ hideRiskName, riskFactor }: ITagRiskProps) => {
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
        }}
      >
        <SFlex center>{riskFactor?.type || ''}</SFlex>
      </SText>
      {!hideRiskName ? riskFactor?.name || '' : ''}
    </SText>
  );
};
