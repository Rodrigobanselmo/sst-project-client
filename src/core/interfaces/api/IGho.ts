import { StatusEnum } from 'project/enum/status.enum';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';

import { IWorkspace } from './ICompany';
import { IHierarchy } from './IHierarchy';

interface IHierarchyGho extends Omit<IHierarchy, 'workspaceIds'> {
  workspaceId: string;
}

export interface IGho {
  id: string;
  created_at: Date;
  status: StatusEnum;
  name: string;
  description: string;
  companyId: string;
  hierarchies?: IHierarchyGho[];
  hierarchy?: IHierarchyGho;
  employeeCount: number;
  hierarchyOnHomogeneous?: IHierarchyOnHomogeneous[];
  workspaceIds: string[];
  type?: HomoTypeEnum;
}

export interface IHierarchyOnHomogeneous {
  id: number;
  hierarchyId: string;
  homogeneousGroupId: string;
  workspaceId: string;
  hierarchy?: IHierarchy;
  workspace?: IWorkspace;
  homogeneousGroup?: IGho;
  endDate: Date;
  startDate: Date;
}
