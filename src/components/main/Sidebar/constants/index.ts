import { general, test } from './drawer/category';
import { dashboard, team } from './drawer/items';

export const Drawer_Links = [
  {
    data: general,
    items: [dashboard, team],
  },
  {
    data: test,
    items: [],
  },
];
