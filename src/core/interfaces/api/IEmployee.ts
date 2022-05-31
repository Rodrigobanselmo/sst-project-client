import { StatusEnum } from 'project/enum/status.enum';

import { IWorkspace } from './ICompany';

export interface IEmployee {
  id: number;
  created_at: Date;
  updated_at: Date;
  status: StatusEnum;
  name: string;
  cpf: string;
  companyId: string;
  workspaces: IWorkspace[];
  hierarchyId: string;
}
