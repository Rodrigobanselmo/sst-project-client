/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoleEnum } from 'project/enum/roles.enums';

import { RoutesEnum } from '../../../../../core/enums/routes.enums';

export interface IDrawerLinks {
  data: {
    id: string;
    search: string;
    text: string;
    roles?: RoleEnum[];
    removeWithRoles?: RoleEnum[];
  };

  items: {
    text: string;
    Icon: any;
    description: string;
    id: string;
    roles?: RoleEnum[];
    removeWithRoles?: RoleEnum[];
    href: RoutesEnum;
    shouldMatchExactHref?: boolean;
  }[];
}
