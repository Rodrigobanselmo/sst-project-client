import { StatusEnum } from 'project/enum/status.enum';

export interface IChecklist {
  id: number;
  status: StatusEnum;
  name: string;
  companyId: string;
  system: boolean;
  created_at: Date;
  data: {
    json: string;
    checklistId: number;
  };
}
