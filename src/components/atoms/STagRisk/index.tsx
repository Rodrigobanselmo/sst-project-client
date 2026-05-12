import React from 'react';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import SFlex from '../SFlex';
import SText from '../SText';

interface ITagRiskProps {
  riskFactor: IRiskFactors;
  isEndDate?: boolean;

  hideRiskName?: boolean;
}

/** Ordem: primeiro match quando houver vários (ex.: prioriza Psicossociais). */
const SUBTYPE_CHIP_BY_NAME: Record<string, { label: string; colorKey: string }> = {
  Psicossociais: { label: 'PSIC', colorKey: 'risk.psic' },
  Biomecânicos: { label: 'BIOM', colorKey: 'risk.erg' },
  Ambientais: { label: 'AMB', colorKey: 'risk.erg' },
  Organizacionais: { label: 'ORG', colorKey: 'risk.erg' },
  'Mobiliário e Equipamentos': { label: 'MOB', colorKey: 'risk.erg' },
};

function resolveRiskChip(riskFactor: IRiskFactors) {
  for (const name of Object.keys(SUBTYPE_CHIP_BY_NAME)) {
    if (riskFactor.subTypes?.some((s) => s?.sub_type?.name === name)) {
      return SUBTYPE_CHIP_BY_NAME[name];
    }
  }
  const t = (riskFactor?.type ?? '').toString().toLowerCase();
  return {
    label: riskFactor?.type || '',
    colorKey: t ? (`risk.${t}` as const) : 'grey.500',
  };
}

export const STagRisk = ({
  isEndDate,
  hideRiskName,
  riskFactor,
}: ITagRiskProps) => {
  const { label: displayType, colorKey: riskColorKey } =
    resolveRiskChip(riskFactor);

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
          minWidth: '36px',
          width: 'max-content',
          px: '6px',
          borderRadius: '4px',
          mr: 2,
          boxSizing: 'border-box',
        }}
      >
        <SFlex center>{displayType}</SFlex>
      </SText>
      {!hideRiskName ? riskFactor?.name || '' : ''}
    </SText>
  );
};
