import DataUsageIcon from '@mui/icons-material/DataUsage';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormApplicationStatusTranslate } from '@v2/models/form/translations/form-application-status.translation';
import palette from 'configs/theme/palette';
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
        item={<DataUsageIcon sx={{ fontSize: 15, color: palette.grey[500] }} />}
      />
    ),
    schema: {
      color: palette.schema.gray,
      borderColor: palette.schema.gray,
      iconColor: palette.schema.gray,
      backgroundColor: palette.schema.grayFade,
    },
  },
  [FormApplicationStatusEnum.PROGRESS]: {
    value: FormApplicationStatusEnum.PROGRESS,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.PROGRESS],
    startAddon: (
      <SStartAddonIcon
        item={
          <SecurityUpdateGoodOutlinedIcon
            sx={{ fontSize: 15, color: palette.schema.blue }}
          />
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
  [FormApplicationStatusEnum.DONE]: {
    value: FormApplicationStatusEnum.DONE,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.DONE],
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
  [FormApplicationStatusEnum.CANCELED]: {
    value: FormApplicationStatusEnum.CANCELED,
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
    value: FormApplicationStatusEnum.INACTIVE,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.INACTIVE],
    startAddon: (
      <SStartAddonIcon
        item={
          <PanToolOutlinedIcon
            sx={{ fontSize: 15, color: palette.schema.red }}
          />
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
  [FormApplicationStatusEnum.TESTING]: {
    value: FormApplicationStatusEnum.TESTING,
    label: FormApplicationStatusTranslate[FormApplicationStatusEnum.TESTING],
    startAddon: (
      <SStartAddonIcon
        item={
          <ScienceOutlinedIcon
            sx={{ fontSize: 15, color: palette.schema.yellow }}
          />
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
