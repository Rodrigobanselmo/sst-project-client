import { SexTypeEnum } from 'project/enum/risk.enums copy';
import { StatusEnum } from 'project/enum/status.enum';

import { IHierarchy } from './IHierarchy';

export interface IEmployee {
  id: number;
  created_at: Date;
  updated_at: Date;
  status: StatusEnum;
  name: string;
  cpf: string;
  companyId: string;
  hierarchyId: string;
  hierarchy: IHierarchy;

  esocialCode: string;
  socialName: string;
  nickname: string;
  phone: string;
  email: string;
  isComorbidity: boolean;
  sex: SexTypeEnum;
  cidId: string;
  shiftId: number;
  birthday: Date;
  admissionDate: Date;
  subOffices?: IHierarchy[];
}
