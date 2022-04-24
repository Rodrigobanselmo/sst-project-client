import { StatusEnum } from 'project/enum/status.enum';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export interface IHierarchy {
  id: string;
  created_at: Date;
  status: StatusEnum;
  type: HierarchyEnum;
  name: string;
  companyId: string;
  parentId: string | null;
  workplaceId: string;
}

export type IHierarchyMap = Record<
  string,
  IHierarchy & {
    children: (string | number)[];
  }
>;
