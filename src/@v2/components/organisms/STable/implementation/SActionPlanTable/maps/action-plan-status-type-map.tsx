import { SStartAddonCircle } from '../../../addons/addons-rows/SSelectButtonRow/addons/start-addons/SStartAddonCircle';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import palette from 'configs/theme/palette';
import { ReactNode } from 'react';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import { SStartAddonIcon } from '../../../addons/addons-rows/SSelectButtonRow/addons/start-addons/SStartAddonIcon';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

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
  [ActionPlanStatusEnum.PENDING]: {
    label: 'Pendente',
    startAddon: (
      <SStartAddonIcon
        item={<DataUsageIcon sx={{ fontSize: 15, color: palette.grey[500] }} />}
      />
    ),
    schema: {
      color: palette.grey[600],
      borderColor: palette.grey[600],
      iconColor: palette.grey[500],
      backgroundColor: palette.grey[500] + '11',
    },
  },
  [ActionPlanStatusEnum.PROGRESS]: {
    label: 'Inciado',
    startAddon: (
      <SStartAddonIcon
        item={
          <DataUsageIcon sx={{ fontSize: 15, color: palette.schema.blue }} />
        }
      />
    ),
    schema: {
      color: palette.schema.blue,
      borderColor: palette.schema.blue,
      iconColor: palette.schema.blue,
      backgroundColor: palette.schema.blueFade,
    },
  },
  [ActionPlanStatusEnum.DONE]: {
    label: 'Concluído',
    startAddon: (
      <SStartAddonIcon
        item={
          <DonutLargeIcon sx={{ fontSize: 15, color: palette.schema.green }} />
        }
      />
    ),
    schema: {
      color: palette.schema.green,
      borderColor: palette.schema.green,
      iconColor: palette.schema.green,
      backgroundColor: palette.schema.greenFade,
    },
  },

  [ActionPlanStatusEnum.CANCELED]: {
    label: 'Cancelado',
    startAddon: (
      <SStartAddonIcon
        item={
          <NotInterestedIcon sx={{ fontSize: 15, color: palette.schema.red }} />
        }
      />
    ),
    schema: {
      color: palette.schema.red,
      borderColor: palette.schema.red,
      iconColor: palette.schema.red,
      backgroundColor: palette.schema.redFade,
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
