import { EffectivenessStatusEnum } from '@v2/models/security/enums/effectiveness-status.enum';
import { EffectivenessStatusTranslate } from '@v2/models/security/translations/effectiveness-status.translation';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import palette from 'configs/theme/palette';
import { ReactNode } from 'react';
import { SStartAddonCircle } from '../../../addons/addons-rows/SSelectButtonRow/addons/start-addons/SStartAddonCircle';

type EffectivenessStatusTypeMapValue = {
  label: string;
  startAddon?: ReactNode;
  schema: {
    color: string;
    borderColor: string;
    iconColor: string;
    backgroundColor: string;
  };
};

const effectivenessNeutralSchema = {
  color: palette.grey[600],
  borderColor: palette.grey[400],
  iconColor: palette.grey[500],
  backgroundColor: palette.grey[100],
} as const;

const effectivenessOrange = palette.graph.orange;
const effectivenessOrangeSchema = {
  color: effectivenessOrange,
  borderColor: effectivenessOrange,
  iconColor: effectivenessOrange,
  backgroundColor: `${effectivenessOrange}22`,
} as const;

export const EffectivenessStatusTypeMap: Record<
  EffectivenessStatusEnum,
  EffectivenessStatusTypeMapValue
> = {
  [EffectivenessStatusEnum.NOT_EVALUATED]: {
    label: EffectivenessStatusTranslate[EffectivenessStatusEnum.NOT_EVALUATED],
    startAddon: <SStartAddonCircle color={palette.grey[400]} />,
    schema: effectivenessNeutralSchema,
  },
  [EffectivenessStatusEnum.EFFECTIVE]: {
    label: EffectivenessStatusTranslate[EffectivenessStatusEnum.EFFECTIVE],
    startAddon: <SStartAddonCircle color={palette.schema.green} />,
    schema: {
      color: palette.schema.green,
      borderColor: palette.schema.green,
      iconColor: palette.schema.green,
      backgroundColor: palette.schema.greenFade,
    },
  },
  [EffectivenessStatusEnum.PARTIALLY_EFFECTIVE]: {
    label:
      EffectivenessStatusTranslate[EffectivenessStatusEnum.PARTIALLY_EFFECTIVE],
    startAddon: <SStartAddonCircle color={effectivenessOrange} />,
    schema: effectivenessOrangeSchema,
  },
  [EffectivenessStatusEnum.INEFFECTIVE]: {
    label: EffectivenessStatusTranslate[EffectivenessStatusEnum.INEFFECTIVE],
    startAddon: <SStartAddonCircle color={palette.schema.red} />,
    schema: {
      color: palette.schema.red,
      borderColor: palette.schema.red,
      iconColor: palette.schema.red,
      backgroundColor: palette.schema.redFade,
    },
  },
  [EffectivenessStatusEnum.NOT_APPLICABLE]: {
    label: EffectivenessStatusTranslate[EffectivenessStatusEnum.NOT_APPLICABLE],
    startAddon: <SStartAddonCircle color={palette.grey[500]} />,
    schema: {
      color: palette.grey[700],
      borderColor: palette.grey[500],
      iconColor: palette.grey[600],
      backgroundColor: palette.grey[200],
    },
  },
};

export const EffectivenessStatusTypeList = Object.entries(
  EffectivenessStatusTypeMap,
).map(([value, { label, startAddon }]) => ({
  value: value as EffectivenessStatusEnum,
  startAddon,
  label,
}));

export const getEffectivenessOptionsForStatus = (
  executionStatus: ActionPlanStatusEnum,
) => {
  if (executionStatus === ActionPlanStatusEnum.CANCELED) {
    return EffectivenessStatusTypeList.filter(
      (option) => option.value === EffectivenessStatusEnum.NOT_APPLICABLE,
    );
  }

  if (executionStatus === ActionPlanStatusEnum.DONE) {
    return EffectivenessStatusTypeList.filter(
      (option) => option.value !== EffectivenessStatusEnum.NOT_APPLICABLE,
    );
  }

  return EffectivenessStatusTypeList;
};

export const resolveEffectivenessOption = (
  status: EffectivenessStatusEnum | undefined | null,
  executionStatus: ActionPlanStatusEnum,
) => {
  const options = getEffectivenessOptionsForStatus(executionStatus);
  const normalizedStatus = status ?? EffectivenessStatusEnum.NOT_EVALUATED;
  const found = options.find((option) => option.value === normalizedStatus);

  if (found) return found;

  const notEvaluatedOption = options.find(
    (option) => option.value === EffectivenessStatusEnum.NOT_EVALUATED,
  );

  return notEvaluatedOption ?? options[0] ?? EffectivenessStatusTypeList[0];
};

export const getEffectivenessDisplay = (
  status: EffectivenessStatusEnum | undefined | null,
  executionStatus: ActionPlanStatusEnum,
) => {
  const normalizedStatus = status ?? EffectivenessStatusEnum.NOT_EVALUATED;

  const isPendingReview =
    executionStatus === ActionPlanStatusEnum.DONE &&
    normalizedStatus === EffectivenessStatusEnum.NOT_EVALUATED;

  if (isPendingReview) {
    return {
      label: 'Eficácia pendente',
      schema: effectivenessNeutralSchema,
    };
  }

  const mapEntry =
    EffectivenessStatusTypeMap[normalizedStatus] ??
    EffectivenessStatusTypeMap[EffectivenessStatusEnum.NOT_EVALUATED];

  return {
    label: mapEntry.label,
    schema: mapEntry.schema,
  };
};
