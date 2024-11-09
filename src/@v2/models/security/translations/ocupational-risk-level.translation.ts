import { IRiskLevelValues } from '../types/risk-level-values.type';

type OcupationalRiskLevelTranslationMap = Record<IRiskLevelValues, string>;

export const OcupationalRiskLevelTranslation: OcupationalRiskLevelTranslationMap =
  {
    [0]: '-',
    [1]: 'Muito Baixo',
    [2]: 'Baixo',
    [3]: 'Médio',
    [4]: 'Alto',
    [5]: 'Muito Alto',
    [6]: 'Interromper',
  };
