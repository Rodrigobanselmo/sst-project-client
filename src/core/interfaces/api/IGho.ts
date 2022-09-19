import { StatusEnum } from 'project/enum/status.enum';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';

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
  workspaceIds: string[];
  type?: HomoTypeEnum;
}
