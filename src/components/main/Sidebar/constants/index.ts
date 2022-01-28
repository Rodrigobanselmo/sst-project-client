/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoutesEnum } from '../../../../core/enums/routes.enums';
import { general, test } from './drawer/category';
import { dashboard, team } from './drawer/items';

interface IDrawerLinks {
  data: {
    id: string;
    search: string;
    text: string;
  };

  items: {
    text: string;
    Icon: any;
    description: string;
    id: string;
    href: RoutesEnum;
    shouldMatchExactHref?: boolean;
  }[];
}

export const Drawer_Links = [
  {
    data: general,
    items: [dashboard, team],
  },
  {
    data: test,
    items: [],
  },
] as IDrawerLinks[];
