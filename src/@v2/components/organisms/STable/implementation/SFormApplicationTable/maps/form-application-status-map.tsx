import DataUsageIcon from '@mui/icons-material/DataUsage';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormApplicationStatusTranslate } from '@v2/models/form/translations/form-application-status.translation';
import palette from 'configs/theme/palette';
import { ReactNode } from 'react';
import { SStartAddonIcon } from '../../../addons/addons-rows/SSelectButtonRow/addons/start-addons/SStartAddonIcon';

type FormApplicationStatusEnumTypeMapValue = {
  label: string;
  startAddon?: ReactNode;
  schema: {
    color: string;
    borderColor: string;
    iconColor: string;
    backgroundColor: string;
  };
};

export const FormApplicationStatusMap: Record<
  FormApplicationStatusEnum,
  FormApplicationStatusEnumTypeMapValue
> = {
  [FormApplicationStatusEnum.PENDING]: {
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.PENDING],
    startAddon: (
      <SStartAddonIcon
        item={<DataUsageIcon sx={{ fontSize: 15, color: palette.grey[500] }} />}
      />
    ),
    schema: {
      color: palette.schema.yellow,
      borderColor: palette.schema.yellow,
      iconColor: palette.schema.yellow,
      backgroundColor: palette.schema.yellowFade,
    },
  },
  [FormApplicationStatusEnum.PROGRESS]: {
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.PROGRESS],
    startAddon: (
      <SStartAddonIcon
        item={
          <DataUsageIcon sx={{ fontSize: 15, color: palette.schema.blue }} />
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
  [FormApplicationStatusEnum.DONE]: {
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.DONE],
    startAddon: (
      <SStartAddonIcon
        item={
          <DonutLargeIcon sx={{ fontSize: 15, color: palette.schema.green }} />
        }
      />
    ),
    schema: {
      color: palette.grey[600],
      borderColor: palette.grey[600],
      iconColor: palette.grey[500],
      backgroundColor: palette.grey[500] + '11',
    },
  },
  [FormApplicationStatusEnum.CANCELED]: {
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.CANCELED],
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
  [FormApplicationStatusEnum.INACTIVE]: {
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.INACTIVE],
    startAddon: (
      <SStartAddonIcon
        item={
          <NotInterestedIcon sx={{ fontSize: 15, color: palette.schema.red }} />
        }
      />
    ),
    schema: {
      color: palette.schema.yellow,
      borderColor: palette.schema.yellow,
      iconColor: palette.schema.yellow,
      backgroundColor: palette.schema.yellowFade,
    },
  },
};

export const FormApplicationStatusFilterList = Object.entries(
  FormApplicationStatusMap,
).map(([value, { label, startAddon }]) => ({
  value: value as FormApplicationStatusEnum,
  startAddon,
  label,
}));

export const FormApplicationStatusList = FormApplicationStatusFilterList.filter(
  (option) => option.value !== FormApplicationStatusEnum.PENDING,
);
