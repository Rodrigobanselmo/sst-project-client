import { DateUnitEnum } from 'project/enum/DataUnit.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ICid } from './ICid';
import { IEmployee } from './IEmployee';
import { IEsocialTable18Mot } from './IEsocial';
import { IProfessional } from './IProfessional';

export type IAbsenteeism = {
  id: number;

  startDate: Date;
  endDate: Date;
  // startTime: number;
  // endTime: number;
  timeSpent: number;
  timeUnit: DateUnitEnum;
  isJustified: boolean;
  isExtern: boolean;
  docId: number;
  local: string;
  status: StatusEnum;

  observation: string;
  sameAsBefore: boolean;
  traffic: number;
  vacationStartDate: Date;
  vacationEndDate: Date;
  cnpjSind: string;
  infOnusRemun: number;
  cnpjMandElet: string;
  origRetif: number;
  tpProc: number;
  nrProc: number;
  motiveId: number;
  esocial18Motive: number;
  cidId: string;
  employeeId: number;

  cid?: ICid;
  employee?: IEmployee;
  motive?: AbsenteeismMotive;
  esocial18?: IEsocialTable18Mot;
  doc?: IProfessional;
};

export type AbsenteeismMotive = {
  id: number;
  desc: string;
};

export const isAbsTraffic = (code?: string) =>
  ['01', '03'].includes(code as any); // motive table 18
export const isSame60Days = (code?: string) =>
  ['01', '03'].includes(code as any); // motive table 18
export const isAbsObservation = (code?: string) => code == '21'; // motive table 18
