import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';

import { RoutesEnum } from '../../../../../core/enums/routes.enums';

export const navItems = [
  { href: RoutesEnum.PROFILE, icon: PersonIcon, label: 'Perfil' },
  { icon: ExitToAppIcon, label: 'Sair do App', action: 'signOut' },
];
