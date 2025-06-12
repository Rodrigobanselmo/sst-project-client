import { RiskTypeEnum } from '../enums/risk-type.enum';

type RiskTypeEnumTranslationMap = Record<RiskTypeEnum, string>;

export const riskTypeEnumTranslation: RiskTypeEnumTranslationMap = {
  [RiskTypeEnum.ACI]: 'Acidente',
  [RiskTypeEnum.BIO]: 'Biológico',
  [RiskTypeEnum.ERG]: 'Ergonômico',
  [RiskTypeEnum.FIS]: 'Físico',
  [RiskTypeEnum.OUTROS]: 'Outros',
  [RiskTypeEnum.QUI]: 'Químico',
};
