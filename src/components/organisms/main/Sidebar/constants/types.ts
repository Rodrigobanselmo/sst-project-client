/* eslint-disable @typescript-eslint/no-explicit-any */
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import { ModalEnum } from 'core/enums/modal.enums';

import { RoutesEnum } from '../../../../../core/enums/routes.enums';

export interface IDrawerLinksData {
  id: string;
  search: string;
  text: string;
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  removeWithRoles?: RoleEnum[];
}

export interface IDrawerLinksItems {
  text: string;
  Icon?: any;
  description: string;
  image?: string;
  imageType?: 'cat';
  modalName?: ModalEnum;
  id: string;
  roles?: RoleEnum[];
  removeWithRoles?: RoleEnum[];
  permissions?: PermissionEnum[];
  href?: RoutesEnum;
  shouldMatchExactHref?: boolean;
  showIf?: {
    isClinic?: boolean;
    isConsulting?: boolean;
    isCompany?: boolean;
  };
}

export interface IDrawerLinks {
  data: IDrawerLinksData;
  items: IDrawerLinksItems[];
}
