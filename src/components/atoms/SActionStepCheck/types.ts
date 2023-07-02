/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxProps } from '@mui/material';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  ClinicActionEnum,
  CompanyActionEnum,
} from 'core/enums/company-action.enum';

export interface ISActionButtonProps extends Partial<BoxProps> {
  text: string;
  nextStepLabel?: string;
  icon?: any;
  tooltipText?: string;
  active?: boolean;
  count?: number;
  index?: number;
  disabled?: boolean;
  loading?: boolean;
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  type?: CompanyActionEnum | ClinicActionEnum;
}
