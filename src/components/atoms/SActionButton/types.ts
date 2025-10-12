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
  icon: any;
  tooltipText?: string;
  count?: number;
  active?: boolean;
  primary?: boolean;
  success?: boolean;
  disabled?: boolean;
  loading?: boolean;
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  infos?: { label: string; value: string | number }[];
  type?: CompanyActionEnum | ClinicActionEnum;
  showIf?: {
    isClinic?: boolean;
    isConsulting?: boolean;
    isCompany?: boolean;
    isDocuments?: boolean;
    isSchedule?: boolean;
    isAbs?: boolean;
    isEsocial?: boolean;
    isCat?: boolean;
    isForms?: boolean;
  };
}
