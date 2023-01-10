import { StatusEnum } from 'project/enum/status.enum';

import { ICompany } from './ICompany';

export type IScheduleBlock = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  companyId: string;
  yearRecurrence: boolean;
  allCompanies: boolean;
  status: StatusEnum;
  type: ScheduleBlockTypeEnum;
  updated_at: Date;
  created_at: Date;
  deleted_at: Date;

  applyOnCompanies?: ICompany[];
  company?: ICompany;
};

export enum ScheduleBlockTypeEnum {
  NAT_HOLIDAY = 'NAT_HOLIDAY',
  MUN_HOLIDAY = 'MUN_HOLIDAY',
  ST_HOLIDAY = 'ST_HOLIDAY',
  OTHER = 'OTHER',
}

export interface IScheduleBlockItemMap {
  value: ScheduleBlockTypeEnum;
  name: string;
  content: string;
}

interface IScheduleBlockMap
  extends Record<ScheduleBlockTypeEnum, IScheduleBlockItemMap> {}

export const ScheduleBlockTypeMap = {
  [ScheduleBlockTypeEnum.NAT_HOLIDAY]: {
    value: ScheduleBlockTypeEnum.NAT_HOLIDAY,
    content: 'Feriado Nacional',
    name: 'Feriado Nacional',
  },
  [ScheduleBlockTypeEnum.ST_HOLIDAY]: {
    value: ScheduleBlockTypeEnum.ST_HOLIDAY,
    content: 'Feriado Estadual',
    name: 'Feriado Estadual',
  },
  [ScheduleBlockTypeEnum.MUN_HOLIDAY]: {
    value: ScheduleBlockTypeEnum.MUN_HOLIDAY,
    content: 'Feriado Municipal',
    name: 'Feriado Municipal',
  },
  [ScheduleBlockTypeEnum.OTHER]: {
    value: ScheduleBlockTypeEnum.OTHER,
    content: 'Outros',
    name: 'Outros',
  },
} as IScheduleBlockMap;

export const scheduleBlockOptionsList = [
  ScheduleBlockTypeMap[ScheduleBlockTypeEnum.NAT_HOLIDAY],
  ScheduleBlockTypeMap[ScheduleBlockTypeEnum.ST_HOLIDAY],
  ScheduleBlockTypeMap[ScheduleBlockTypeEnum.MUN_HOLIDAY],
  ScheduleBlockTypeMap[ScheduleBlockTypeEnum.OTHER],
];
