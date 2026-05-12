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
  const isPsicossocial = riskFactor.subTypes?.some(
    (s) => s?.sub_type?.name === 'Psicossociais',
  );
  const displayType = isPsicossocial ? 'PSIC' : riskFactor?.type || '';
  const riskColorKey = isPsicossocial
    ? 'risk.psic'
    : (() => {
        const t = (riskFactor?.type ?? '').toString().toLowerCase();
        return t ? (`risk.${t}` as const) : 'grey.500';
      })();

  return (
    <SText
        sx={{
          ...(isEndDate && { color: 'error.main' }),
        }}
        fontSize={14}
      >
        <SText
          fontSize={10}
          component="span"
          sx={{
            backgroundColor: riskColorKey,
            color: 'common.white',
          display: 'inline-block',
          width: '40px',
          borderRadius: '4px',
          mr: 2,
        }}
      >
        <SFlex center>{displayType}</SFlex>
      </SText>
      {!hideRiskName ? riskFactor?.name || '' : ''}
    </SText>
  );
};
