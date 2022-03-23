import { StatusEnum } from 'project/enum/status.enum';

export interface IEmployee {
  id: number;
  created_at: Date;
  updated_at: Date;
  status: StatusEnum;
  name: string;
  cpf: string;
  companyId: string;
  workplaceId: number;
  hierarchyId: string;
}
