import { AlertsTypeEnum } from 'core/constants/maps/alert.map';
import { ICompany } from 'core/interfaces/api/ICompany';

import { ICompanyGroup } from './ICompanyGroup';
import { IUser } from './IUser';

export type IAlert = {
  id: number;
  type: AlertsTypeEnum;
  companyId: string;
  system: boolean;
  emails: string[];
  nextAlert: Date;
  configJson: { time: number; everyNumbersOfWeeks: number; weekDays: number[] };

  users?: IUser[];
  groups?: ICompanyGroup[];
  systemGroups?: ICompanyGroup[];
  company?: ICompany;
};
