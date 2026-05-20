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
  /** Home operacional — cards de formulários */
  statusLabel?: string;
  participationPercent?: number | null;
  formCardId?: string;
  /** Preenche a célula de grid (largura/altura) sem alterar dados */
  fillGridCell?: boolean;
  /**
   * Cards superiores da home: preenche o grid sem minHeight 240,
   * mantendo infos em duas colunas.
   */
  fillGridCellCompact?: boolean;
  /**
   * Linha Lançamentos: layout vertical compacto (infos em coluna única + barra no rodapé).
   */
  fillGridCellLaunch?: boolean;
}
