import { OcupationalRiskLevelTranslation } from '@v2/models/security/translations/ocupational-risk-level.translation';
import { IRiskLevelValues } from '@v2/models/security/types/risk-level-values.type';

type IActionPlanLevelMapValue = {
  label: string;
};

export const ActionPlanLevelMap: Record<
  IRiskLevelValues,
  IActionPlanLevelMapValue
> = {
  [0]: {
    label: OcupationalRiskLevelTranslation[0],
  },
  [1]: {
    label: OcupationalRiskLevelTranslation[1],
  },
  [2]: {
    label: OcupationalRiskLevelTranslation[2],
  },
  [3]: {
    label: OcupationalRiskLevelTranslation[3],
  },
  [4]: {
    label: OcupationalRiskLevelTranslation[4],
  },
  [5]: {
    label: OcupationalRiskLevelTranslation[5],
  },
  [6]: {
    label: OcupationalRiskLevelTranslation[6],
  },
};

export const ActionPlanLevelList = Object.entries(ActionPlanLevelMap)
  .map(([value, { label }]) => ({
    value: Number(value) as IRiskLevelValues,
    label,
  }))
  .filter(({ value }) => value !== 0);
