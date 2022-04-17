import { StatusEnum } from 'project/enum/status.enum';

import { IHierarchy } from './IHierarchy';

export interface IGho {
  id: string;
  created_at: Date;
  status: StatusEnum;
  name: string;
  companyId: string;
  hierarchies?: IHierarchy[];
}
