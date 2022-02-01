/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoutesEnum } from '../../../../core/enums/routes.enums';

export interface IDrawerLinks {
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
