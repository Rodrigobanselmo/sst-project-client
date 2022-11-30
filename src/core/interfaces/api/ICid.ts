import { SexTypeEnum } from 'project/enum/sex.enums';

import { IEmployee } from './IEmployee';

export interface ICid {
  cid: string;
  description: string;
  employees: IEmployee[];
  class: string;
  sex: SexTypeEnum;
  kill: boolean;
}
