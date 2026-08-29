import DataUsageIcon from '@mui/icons-material/DataUsage';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormApplicationStatusTranslate } from '@v2/models/form/translations/form-application-status.translation';
import { ReactNode } from 'react';
import { SStartAddonIcon } from '../../../addons/addons-rows/SSelectButtonRow/addons/start-addons/SStartAddonIcon';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import SecurityUpdateGoodOutlinedIcon from '@mui/icons-material/SecurityUpdateGoodOutlined';

type FormApplicationStatusEnumTypeMapValue = {
  value: FormApplicationStatusEnum;
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
    value: FormApplicationStatusEnum.PENDING,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.PENDING],
    startAddon: (
      <SStartAddonIcon
        item={<DataUsageIcon sx={{ fontSize: 15, color: 'text.light' }} />}
      />
    ),
    schema: {
      color: 'text.medium',
      borderColor: 'background.border',
      iconColor: 'text.medium',
      backgroundColor: 'background.box',
    },
  },
  [FormApplicationStatusEnum.PROGRESS]: {
    value: FormApplicationStatusEnum.PROGRESS,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.PROGRESS],
    startAddon: (
      <SStartAddonIcon
        item={
          <SecurityUpdateGoodOutlinedIcon
            sx={{ fontSize: 15, color: 'info.main' }}
          />
        }
      />
    ),
    schema: {
      color: 'info.main',
      borderColor: 'info.main',
      iconColor: 'info.main',
      backgroundColor: 'background.box',
    },
  },
  [FormApplicationStatusEnum.DONE]: {
    value: FormApplicationStatusEnum.DONE,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.DONE],
    startAddon: (
      <SStartAddonIcon
        item={<DonutLargeIcon sx={{ fontSize: 15, color: 'success.main' }} />}
      />
    ),
    schema: {
      color: 'success.main',
      borderColor: 'success.main',
      iconColor: 'success.main',
      backgroundColor: 'background.box',
    },
  },
  [FormApplicationStatusEnum.CANCELED]: {
    value: FormApplicationStatusEnum.CANCELED,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.CANCELED],
    startAddon: (
      <SStartAddonIcon
        item={
          <NotInterestedIcon sx={{ fontSize: 15, color: 'error.main' }} />
        }
      />
    ),
    schema: {
      color: 'error.main',
      borderColor: 'error.main',
      iconColor: 'error.main',
      backgroundColor: 'background.box',
    },
  },
  [FormApplicationStatusEnum.INACTIVE]: {
    value: FormApplicationStatusEnum.INACTIVE,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.INACTIVE],
    startAddon: (
      <SStartAddonIcon
        item={
          <PanToolOutlinedIcon
            sx={{ fontSize: 15, color: 'warning.main' }}
          />
        }
      />
    ),
    schema: {
      color: 'warning.main',
      borderColor: 'warning.main',
      iconColor: 'warning.main',
      backgroundColor: 'background.box',
    },
  },
  [FormApplicationStatusEnum.TESTING]: {
    value: FormApplicationStatusEnum.TESTING,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.TESTING],
    startAddon: (
      <SStartAddonIcon
        item={
          <ScienceOutlinedIcon
            sx={{ fontSize: 15, color: 'warning.main' }}
          />
        }
      />
    ),
    schema: {
      color: 'warning.main',
      borderColor: 'warning.main',
      iconColor: 'warning.main',
      backgroundColor: 'background.box',
    },
  },
};

export const FormApplicationStatusFilterList = [
  FormApplicationStatusMap[FormApplicationStatusEnum.PENDING],
  FormApplicationStatusMap[FormApplicationStatusEnum.TESTING],
  FormApplicationStatusMap[FormApplicationStatusEnum.PROGRESS],
  FormApplicationStatusMap[FormApplicationStatusEnum.INACTIVE],
  FormApplicationStatusMap[FormApplicationStatusEnum.DONE],
  FormApplicationStatusMap[FormApplicationStatusEnum.CANCELED],
];

export const FormApplicationStatusList = FormApplicationStatusFilterList.filter(
  (option) =>
    option.label !==
    FormApplicationStatusTranslate[FormApplicationStatusEnum.PENDING],
);
