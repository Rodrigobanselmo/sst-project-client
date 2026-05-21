import React from 'react';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { resolveRiskChip } from 'core/utils/risk-chip.util';

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
  const {
    label: displayType,
    colorKey: riskColorKey,
    chipWidthPx,
    isPsicChip,
  } = resolveRiskChip(riskFactor);

  const chip = (
    <SText
      fontSize={10}
      component="span"
      sx={{
        flexShrink: 0,
        backgroundColor: riskColorKey,
        color: isPsicChip ? 'grey.900' : 'common.white',
        ...(isPsicChip
          ? {
              border: '1px solid',
              borderColor: 'risk.erg',
              fontWeight: 600,
            }
          : {}),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: chipWidthPx,
        minWidth: chipWidthPx,
        maxWidth: chipWidthPx,
        px: '6px',
        py: '2px',
        borderRadius: '4px',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}
    >
      <SFlex center>{displayType}</SFlex>
    </SText>
  );

  if (hideRiskName) {
    return <SFlex align="center">{chip}</SFlex>;
  }

  return (
    <SFlex align="center" gap={1.5} sx={{ minWidth: 0, width: '100%' }}>
      {chip}
      <SText
        component="span"
        fontSize={14}
        sx={{
          ...(isEndDate && { color: 'error.main' }),
          minWidth: 0,
          flex: 1,
          lineHeight: 1.35,
        }}
      >
        {riskFactor?.name || ''}
      </SText>
    </SFlex>
  );
};
