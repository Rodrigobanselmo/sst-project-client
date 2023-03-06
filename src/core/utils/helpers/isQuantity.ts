import { RiskEnum } from 'project/enum/risk.enums';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { EsocialCodeEnum } from 'core/enums/esocial-code.enum';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export const isQuantity = (risk?: IRiskFactors | null) => {
  if (!risk) return;

  const code = risk?.esocialCode;

  if (risk.type === RiskEnum.QUI) return QuantityTypeEnum.QUI;

  if (code == EsocialCodeEnum.VIBRACAO_LOCALIZADA) return QuantityTypeEnum.VL;

  if (code == EsocialCodeEnum.RUIDO) return QuantityTypeEnum.NOISE;

  if (code == EsocialCodeEnum.CALOR) return QuantityTypeEnum.HEAT;

  if (
    code == EsocialCodeEnum.VIBRACAO_CORPO ||
    code == EsocialCodeEnum.VIBRACAO_CORPO_2
  )
    return QuantityTypeEnum.VFB;

  if (code == EsocialCodeEnum.RADIACAO) return QuantityTypeEnum.RADIATION;

  return null;
};
