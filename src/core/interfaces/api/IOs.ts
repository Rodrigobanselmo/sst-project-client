import { StatusEnum } from 'project/enum/status.enum';

import { ICompany } from 'core/interfaces/api/ICompany';

import { IDraftTypes } from '../IDraftBlocks';

export type IOs = {
  id: number;
  created_at: Date;
  updated_at: Date;
  status: StatusEnum;
  socialName: IDraftTypes.RootObject;
  med: IDraftTypes.RootObject;
  rec: IDraftTypes.RootObject;
  obligations: IDraftTypes.RootObject;
  prohibitions: IDraftTypes.RootObject;
  procedures: IDraftTypes.RootObject;
  cipa: IDraftTypes.RootObject;
  declaration: IDraftTypes.RootObject;
  companyId: string;
  company: ICompany;
};
