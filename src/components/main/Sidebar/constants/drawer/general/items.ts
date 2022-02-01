import { IoPeople } from '@react-icons/all-files/io5/IoPeople';
import { MdDashboard } from '@react-icons/all-files/md/MdDashboard';

import { RoutesEnum } from '../../../../../../core/enums/routes.enums';

const dashboard = {
  text: 'Home',
  Icon: MdDashboard,
  description: 'Download dos dados obtidos em campo utilizando o App SimpleSST',
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

export const generalArray = [dashboard, team];
