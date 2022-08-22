import { StatusEnum } from 'project/enum/status.enum';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import { ICompany, IWorkspace } from './ICompany';

export interface IHierarchy {
  id: string;
  created_at: Date;
  status: StatusEnum;
  type: HierarchyEnum;
  name: string;
  companyId: string;
  description: string;
  realDescription: string;
  refName: string;
  parentId: string | null;
  workspaces?: IWorkspace[];
  workspaceIds: string[];
  parent?: IHierarchy;
  parents?: IHierarchy[];
  company?: ICompany;
  employeesCount?: number; //only on find by id
}

export type IHierarchyChildren = IHierarchy & {
  children: (string | number)[];
};

export type IHierarchyMap = Record<
  string,
  IHierarchy & {
    children: (string | number)[];
  }
>;
