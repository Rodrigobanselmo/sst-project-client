import React from 'react';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { RiskEnum, RiskMap } from 'project/enum/risk.enums';

import SFlex from '../SFlex';
import SText from '../SText';

interface ITagRiskProps {
  riskFactor: IRiskFactors;
  isEndDate?: boolean;

  hideRiskName?: boolean;
}

/** Largura do chip para rótulos compostos `ERG-*` (ligeiramente maior que o grupo simples). */
const RISK_CHIP_WIDTH_COMPOUND_PX = 94;
/** Largura para nomes por extenso (Físico, Químico, …) e demais rótulos do grupo simples. */
const RISK_CHIP_WIDTH_SIMPLE_PX = 86;

/** Ordem: primeiro match quando houver vários (ex.: prioriza Psicossociais). */
const SUBTYPE_CHIP_BY_NAME: Record<string, { suffix: string; colorKey: string }> = {
  Psicossociais: { suffix: 'PSIC', colorKey: 'risk.ergSubtypePsic' },
  Biomecânicos: { suffix: 'BIOM', colorKey: 'risk.ergSubtypeBiom' },
  Ambientais: { suffix: 'AMB', colorKey: 'risk.ergSubtypeAmb' },
  Organizacionais: { suffix: 'ORG', colorKey: 'risk.ergSubtypeOrg' },
  'Mobiliário e Equipamentos': { suffix: 'MOB', colorKey: 'risk.ergSubtypeMob' },
};

function resolveRiskChip(riskFactor: IRiskFactors): {
  label: string;
  colorKey: string;
  chipWidthPx: number;
} {
  for (const name of Object.keys(SUBTYPE_CHIP_BY_NAME)) {
    if (riskFactor.subTypes?.some((s) => s?.sub_type?.name === name)) {
      const { suffix, colorKey } = SUBTYPE_CHIP_BY_NAME[name];
      const label =
        riskFactor.type === RiskEnum.ERG ? `ERG-${suffix}` : suffix;
      const chipWidthPx = label.startsWith('ERG-')
        ? RISK_CHIP_WIDTH_COMPOUND_PX
        : RISK_CHIP_WIDTH_SIMPLE_PX;
      return { label, colorKey, chipWidthPx };
    }
  }
  const t = (riskFactor?.type ?? '').toString().toLowerCase();
  const rawType = riskFactor?.type;
  const label =
    rawType && rawType in RiskMap
      ? RiskMap[rawType as RiskEnum].name
      : rawType || '';

  return {
    label,
    colorKey: t ? (`risk.${t}` as const) : 'grey.500',
    chipWidthPx: RISK_CHIP_WIDTH_SIMPLE_PX,
  };
}

export const STagRisk = ({
  isEndDate,
  hideRiskName,
  riskFactor,
}: ITagRiskProps) => {
  const { label: displayType, colorKey: riskColorKey, chipWidthPx } =
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
