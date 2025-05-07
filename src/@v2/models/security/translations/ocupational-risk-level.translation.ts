import { IRiskLevelValues } from '../types/risk-level-values.type';

type OccupationalRiskLevelTranslationMap = Record<IRiskLevelValues, string>;

export const OccupationalRiskLevelTranslation: OccupationalRiskLevelTranslationMap =
  {
    [0]: '-',
    [1]: 'Muito Baixo',
    [2]: 'Baixo',
    [3]: 'Médio',
    [4]: 'Alto',
    [5]: 'Muito Alto',
    [6]: 'Interromper',
  };
