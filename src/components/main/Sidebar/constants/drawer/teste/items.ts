import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MessageRounded from '@mui/icons-material/MessageRounded';

import { RoutesEnum } from '../../../../../../core/enums/routes.enums';

const tree = {
  text: 'DNDTree',
  Icon: AccountTreeIcon,
  description: 'Download dos dados obtidos em campo utilizando o App SimpleSST',
  id: '5NQf8wKlYx',
  href: RoutesEnum.DND_TREE_DEMO,
  shouldMatchExactHref: true,
};

const modal = {
  text: 'Modal',
  Icon: MessageRounded,
  description: 'Download dos dados obtidos em campo utilizando o App SimpleSST',
  id: '5NQf8wKlYpp',
  href: RoutesEnum.MODAL,
  shouldMatchExactHref: true,
};

export const testArray = [tree, modal];
