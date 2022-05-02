import { StatusEnum } from 'project/enum/status.enum';

export interface IEpi {
  id: number;
  ca: string;
  created_at: Date;
  expiredDate: Date;
  status: StatusEnum;
  observation: string;
  equipment: string;
  description: string;
  report: string;
  restriction: string;
  isValid: boolean;
  national: boolean;
}
