import { RiskEnum } from 'project/enum/risk.enums';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { stringNormalize } from '../strings/stringNormalize';

export const isQuantity = (risk?: IRiskFactors | null) => {
  if (!risk) return;

  const riskNameNormalized = stringNormalize(risk.name);

  if (risk.type === RiskEnum.QUI) return QuantityTypeEnum.QUI;

  if (
    riskNameNormalized === stringNormalize('Vibrações Localizadas (Mão-Braço)')
  )
    return QuantityTypeEnum.VL;

  if (riskNameNormalized === stringNormalize('Ruído contínuo ou Intermitente'))
    return QuantityTypeEnum.NOISE;

  if (riskNameNormalized === stringNormalize('Temperaturas anormais (calor)'))
    return QuantityTypeEnum.HEAT;

  if (riskNameNormalized === stringNormalize('Vibrações de Corpo Inteiro'))
    return QuantityTypeEnum.VFB;

  if (riskNameNormalized.includes(stringNormalize('Radiações Ionizantes')))
    return QuantityTypeEnum.RADIATION;

  return null;
};
