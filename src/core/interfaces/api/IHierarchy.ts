import { StatusEnum } from 'project/enum/status.enum';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import { IWorkspace } from './ICompany';

export interface IHierarchy {
  id: string;
  created_at: Date;
  status: StatusEnum;
  type: HierarchyEnum;
  name: string;
  companyId: string;
  parentId: string | null;
  workspaces?: IWorkspace[];
  workspaceIds: string[];
  parent?: IHierarchy;
}

export type IHierarchyMap = Record<
  string,
  IHierarchy & {
    children: (string | number)[];
  }
>;
