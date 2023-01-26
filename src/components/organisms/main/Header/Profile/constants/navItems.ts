import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import SAlertIcon from 'assets/icons/SAlertIcon';
import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SProfileIcon from 'assets/icons/SProfileIcon';
import { SReportIcon } from 'assets/icons/SReportIcon';
import SSignOutIcon from 'assets/icons/SSignOutIcon';

import { RoutesEnum } from '../../../../../../core/enums/routes.enums';

export enum NavItemsActionEnum {
  CHANGE_COMPANY = 'CHANGE_COMPANY',
  REPORTS = 'REPORTS',
  ALERTS = 'ALERTS',
  SIGN_OUT = 'signOut',
}

interface IAlertList {
  icon: any;
  label: string;
  color?: string;
  href?: RoutesEnum;
  permissions?: PermissionEnum[];
  roles?: RoleEnum[];
  action?: NavItemsActionEnum;
}

export const navItems: IAlertList[] = [
  { href: RoutesEnum.PROFILE, icon: SProfileIcon, label: 'Perfil' },
  {
    icon: SCompanyIcon,
    label: 'Trocar Acesso',
    action: NavItemsActionEnum.CHANGE_COMPANY,
  },
  {
    icon: SReportIcon,
    label: 'Relatórios',
    action: NavItemsActionEnum.REPORTS,
  },
  {
    href: RoutesEnum.ALERTS,
    icon: SAlertIcon,
    label: 'Alertas',
    action: NavItemsActionEnum.ALERTS,
    permissions: [PermissionEnum.ALERT],
  },
  {
    icon: SSignOutIcon,
    label: 'Sair do App',
    action: NavItemsActionEnum.SIGN_OUT,
    color: 'error.dark',
  },
];
