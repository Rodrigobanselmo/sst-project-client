import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import SProfileIcon from 'assets/icons/SProfileIcon';

import { RoutesEnum } from '../../../../../../core/enums/routes.enums';

export const navItems = [
  { href: RoutesEnum.PROFILE, icon: SProfileIcon, label: 'Perfil' },
  { icon: ExitToAppIcon, label: 'Sair do App', action: 'signOut' },
];
