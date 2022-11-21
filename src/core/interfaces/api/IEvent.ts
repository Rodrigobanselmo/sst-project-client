import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { ESocialSendEnum } from 'project/enum/esocial';
import { EmployeeESocialEventActionEnum } from 'project/enum/esocial-event-action.enum';
import { EmployeeESocialEventTypeEnum } from 'project/enum/esocial-event-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ICompany } from './ICompany';
import { IEmployee, IEmployeeExamsHistory } from './IEmployee';
import { IUser } from './IUser';

export interface IEvent2220 {
  id?: number;
  doneDate: Date;
  examType: ExamHistoryTypeEnum;
  evaluationType: ExamHistoryEvaluationEnum;
  company: ICompany;
  type: ESocialSendEnum;
  errors: {
    message: string;
  }[];
  employee: IEmployee;
  xml: string;
}

export interface IEvent2240 {
  id?: number;
  risks: string[];
  doneDate: Date;
  errors: {
    message: string;
  }[];
  employee: IEmployee;
  type: ESocialSendEnum.SEND;
  xml: string;
}

export interface IEsocialSendBatchResponse {
  ideEmpregador?: { tpInsc: number; nrInsc: string };
  ideTransmissor?: { tpInsc: number; nrInsc: string };
  status?: { cdResposta: string; descResposta: string };
  dadosRecepcaoLote?: {
    dhRecepcao?: string;
    versaoAplicativoRecepcao?: string;
    protocoloEnvio?: string;
  };
  ocorrencia?: {
    codigo?: string;
    descricao?: string;
    tipo?: string;
    localizacao?: string;
  }[];
}

export interface IESocialEvent {
  id: number;
  created_at: Date;
  updated_at: Date;
  batchId: number;
  environment: number;
  eventsDate: Date;
  status: StatusEnum;
  eventXml: string;
  response: object;
  employeeId: number;
  companyId: string;
  type: EmployeeESocialEventTypeEnum;
  examHistoryId: number;
  action: EmployeeESocialEventActionEnum;
  receipt: string;
  eventId: string;
  company: ICompany;
  employee: IEmployee;
  examHistory: IEmployeeExamsHistory;
}

export interface IESocialBatch {
  id: number;
  created_at: Date;
  updated_at: Date;
  environment: number;
  status: StatusEnum;
  userTransmissionId: number;
  companyId: string;
  response: IEsocialSendBatchResponse;
  protocolId: string;
  type: EmployeeESocialEventTypeEnum;
  events?: IESocialEvent[];
  company?: ICompany;
  userTransmission?: IUser;
}
