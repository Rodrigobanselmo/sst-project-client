export enum QuantityTypeEnum {
  RADIATION = 'RADIATION',
  QUI = 'QUI',
  NOISE = 'NOISE',
  HEAT = 'HEAT',
  VL = 'VL',
  VFB = 'VFB',
}

export const quantityRiskMap = {
  [QuantityTypeEnum.QUI]: {
    value: QuantityTypeEnum.QUI,
    label: 'Valor obtido da medição',
  },
};
