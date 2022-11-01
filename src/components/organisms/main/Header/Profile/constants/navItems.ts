import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SProfileIcon from 'assets/icons/SProfileIcon';

import { RoutesEnum } from '../../../../../../core/enums/routes.enums';

export const navItems = [
  { href: RoutesEnum.PROFILE, icon: SProfileIcon, label: 'Perfil' },
  { icon: SCompanyIcon, label: 'Trocar Acesso', action: 'changeCompany' },
  { icon: ExitToAppIcon, label: 'Sair do App', action: 'signOut' },
];
