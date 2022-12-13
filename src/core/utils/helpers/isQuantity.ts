import { RiskEnum } from 'project/enum/risk.enums';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { stringNormalize } from '../strings/stringNormalize';

export const isQuantity = (risk?: IRiskFactors | null) => {
  if (!risk) return;
  if (!risk.esocialCode) return;

  const code = risk.esocialCode;

  if (risk.type === RiskEnum.QUI) return QuantityTypeEnum.QUI;

  if (code == '02.01.002') return QuantityTypeEnum.VL;

  if (code == '02.01.001') return QuantityTypeEnum.NOISE;

  if (code == '02.01.014') return QuantityTypeEnum.HEAT;

  if (code == '02.01.004' || code == '02.01.003') return QuantityTypeEnum.VFB;

  if (code == '02.01.006') return QuantityTypeEnum.RADIATION;

  return null;
};
