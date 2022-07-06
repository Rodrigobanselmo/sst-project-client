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
    return {};

  if (riskNameNormalized === stringNormalize('Ruído contínuo ou Intermitente'))
    return {};

  if (riskNameNormalized === stringNormalize('Temperaturas anormais (calor)'))
    return {};

  if (riskNameNormalized === stringNormalize('Vibrações de Corpo Inteiro'))
    return {};

  if (riskNameNormalized === stringNormalize('Radiações Ionizantes')) return {};

  return null;
};
