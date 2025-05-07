import { OccupationalRiskLevelTranslation } from '@v2/models/security/translations/ocupational-risk-level.translation';
import { IRiskLevelValues } from '@v2/models/security/types/risk-level-values.type';

type IActionPlanLevelMapValue = {
  label: string;
};

export const ActionPlanLevelMap: Record<
  IRiskLevelValues,
  IActionPlanLevelMapValue
> = {
  [0]: {
    label: OccupationalRiskLevelTranslation[0],
  },
  [1]: {
    label: OccupationalRiskLevelTranslation[1],
  },
  [2]: {
    label: OccupationalRiskLevelTranslation[2],
  },
  [3]: {
    label: OccupationalRiskLevelTranslation[3],
  },
  [4]: {
    label: OccupationalRiskLevelTranslation[4],
  },
  [5]: {
    label: OccupationalRiskLevelTranslation[5],
  },
  [6]: {
    label: OccupationalRiskLevelTranslation[6],
  },
};

export const ActionPlanLevelList = Object.entries(ActionPlanLevelMap)
  .map(([value, { label }]) => ({
    value: Number(value) as IRiskLevelValues,
    label,
  }))
  .filter(({ value }) => value !== 0);
