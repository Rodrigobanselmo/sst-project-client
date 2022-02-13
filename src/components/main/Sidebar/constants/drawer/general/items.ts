import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { IoPeople } from '@react-icons/all-files/io5/IoPeople';
import { MdDashboard } from '@react-icons/all-files/md/MdDashboard';

import { RoutesEnum } from '../../../../../../core/enums/routes.enums';

const dashboard = {
  text: 'Home',
  Icon: MdDashboard,
  description: 'HOME',
  id: 'oRH0CjLLpN',
  href: RoutesEnum.DASHBOARD,
  shouldMatchExactHref: true,
};

const team = {
  text: 'Gerenciar Usuários',
  Icon: IoPeople,
  description: 'Download dos dados obtidos em campo utilizando o App SimpleSST',
  id: 'Tu09jfdGCC',
  href: RoutesEnum.TEAM,
};

const checklist = {
  text: 'Checklist',
  Icon: LibraryAddCheckIcon,
  description: 'Criação e edição de checklists para captação de dados de campo',
  id: 'ZjP5CN0qar',
  href: RoutesEnum.CHECKLIST,
};

export const generalArray = [dashboard, team, checklist];
