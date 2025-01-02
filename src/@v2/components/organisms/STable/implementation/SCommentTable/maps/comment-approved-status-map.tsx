import DataUsageIcon from '@mui/icons-material/DataUsage';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { CommentApprovedStatusEnum } from '@v2/models/security/enums/comment-approved-status.enum';
import { ActionPlanStatusTypeTranslate } from '@v2/models/security/translations/action-plan-status-type.translaton';
import palette from 'configs/theme/palette';
import { ReactNode } from 'react';
import { SStartAddonIcon } from '../../../addons/addons-rows/SSelectButtonRow/addons/start-addons/SStartAddonIcon';

type CommentApprovedMapValue = {
  label: string;
  startAddon?: ReactNode;
  schema: {
    color: string;
    borderColor: string;
    iconColor: string;
    backgroundColor: string;
  };
};

export const CommentApprovedMap: Record<
  CommentApprovedStatusEnum,
  CommentApprovedMapValue
> = {
  [CommentApprovedStatusEnum.APPROVED]: {
    label: 'Aprovado',
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
  [CommentApprovedStatusEnum.REJECTED]: {
    label: 'Rejeitado',
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
  [CommentApprovedStatusEnum.NONE]: {
    label: 'Sem resposta',
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
};

export const CommentApprovedMapList = Object.entries(CommentApprovedMap).map(
  ([value, { label, startAddon }]) => ({
    value: value as CommentApprovedStatusEnum,
    startAddon,
    label,
  }),
);
