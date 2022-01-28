import { RiMenuLine } from '@react-icons/all-files/ri/RiMenuLine';
import { RiZzzLine } from '@react-icons/all-files/ri/RiZzzLine';

import { RoutesEnum } from '../../../../../core/enums/routes.enums';

export const dashboard = {
  text: 'Home',
  Icon: RiMenuLine,
  description: 'Download dos dados obtidos em campo utilizando o App SimpleSST',
  id: 'oRH0CjLLpN',
  href: RoutesEnum.DASHBOARD,
  shouldMatchExactHref: true,
};

export const team = {
  text: 'Gerenciar Usuários',
  Icon: RiZzzLine,
  description: 'Download dos dados obtidos em campo utilizando o App SimpleSST',
  id: 'Tu09jfdGCC',
  href: RoutesEnum.TEAM,
};
