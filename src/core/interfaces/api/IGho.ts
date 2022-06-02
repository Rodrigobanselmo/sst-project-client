import { StatusEnum } from 'project/enum/status.enum';

import { IHierarchy } from './IHierarchy';

interface IHierarchyGho extends Omit<IHierarchy, 'workspaceIds'> {
  workspaceId: string;
}

export interface IGho {
  id: string;
  created_at: Date;
  status: StatusEnum;
  name: string;
  companyId: string;
  hierarchies?: IHierarchyGho[];
}
