import React from 'react';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { RiskEnum } from 'project/enum/risk.enums';

import SFlex from '../SFlex';
import SText from '../SText';

interface ITagRiskProps {
  riskFactor: IRiskFactors;
  isEndDate?: boolean;

  hideRiskName?: boolean;
}

/** Largura única do chip: comporta o maior rótulo atual (ex.: ERG-PSIC, ERG-BIOM). */
const RISK_CHIP_FIXED_WIDTH_PX = 100;

/** Ordem: primeiro match quando houver vários (ex.: prioriza Psicossociais). */
const SUBTYPE_CHIP_BY_NAME: Record<string, { suffix: string; colorKey: string }> = {
  Psicossociais: { suffix: 'PSIC', colorKey: 'risk.psic' },
  Biomecânicos: { suffix: 'BIOM', colorKey: 'risk.erg' },
  Ambientais: { suffix: 'AMB', colorKey: 'risk.erg' },
  Organizacionais: { suffix: 'ORG', colorKey: 'risk.erg' },
  'Mobiliário e Equipamentos': { suffix: 'MOB', colorKey: 'risk.erg' },
};

function resolveRiskChip(riskFactor: IRiskFactors) {
  for (const name of Object.keys(SUBTYPE_CHIP_BY_NAME)) {
    if (riskFactor.subTypes?.some((s) => s?.sub_type?.name === name)) {
      const { suffix, colorKey } = SUBTYPE_CHIP_BY_NAME[name];
      const label =
        riskFactor.type === RiskEnum.ERG ? `ERG-${suffix}` : suffix;
      return { label, colorKey };
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

  const chip = (
    <SText
      fontSize={10}
      component="span"
      sx={{
        flexShrink: 0,
        backgroundColor: riskColorKey,
        color: 'common.white',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: RISK_CHIP_FIXED_WIDTH_PX,
        minWidth: RISK_CHIP_FIXED_WIDTH_PX,
        maxWidth: RISK_CHIP_FIXED_WIDTH_PX,
        px: '8px',
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
