import { SStartAddonCircle } from '../../../addons/addons-rows/SSelectButtonRow/addons/start-addons/SStartAddonCircle';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { ReactNode } from 'react';

type ActionPlanStatusEnumTypeMapValue = {
  label: string;
  startAddon?: ReactNode;
  schema: {
    color: string;
    borderColor: string;
    iconColor: string;
    backgroundColor: string;
  };
};

export const ActionPlanStatusTypeMap: Record<
  ActionPlanStatusEnum,
  ActionPlanStatusEnumTypeMapValue
> = {
  [ActionPlanStatusEnum.PROGRESS]: {
    label: 'Inciado',
    startAddon: <SStartAddonCircle color="#4559c9" />,
    schema: {
      color: '#4559c9',
      borderColor: '#4559c9',
      iconColor: '#4559c9',
      backgroundColor: '#4559c911',
    },
  },
  [ActionPlanStatusEnum.DONE]: {
    label: 'Concluído',
    startAddon: <SStartAddonCircle color="#3cbe7d" />,
    schema: {
      color: '#3cbe7d',
      borderColor: '#3cbe7d',
      iconColor: '#3cbe7d',
      backgroundColor: '#3cbe7d11',
    },
  },
  [ActionPlanStatusEnum.PENDING]: {
    label: 'Pendente',
    startAddon: <SStartAddonCircle color="#cac109" />,
    schema: {
      color: '#cac109',
      borderColor: '#cac109',
      iconColor: '#cac109',
      backgroundColor: '#cac10911',
    },
  },
  [ActionPlanStatusEnum.CANCELED]: {
    label: 'Cancelado',
    startAddon: <SStartAddonCircle color="#F44336" />,
    schema: {
      color: '#F44336',
      borderColor: '#F44336',
      iconColor: '#F44336',
      backgroundColor: '#F4433611',
    },
  },
};

export const ActionPlanStatusTypeList = Object.entries(
  ActionPlanStatusTypeMap,
).map(([value, { label, startAddon }]) => ({
  value,
  startAddon,
  label,
}));
