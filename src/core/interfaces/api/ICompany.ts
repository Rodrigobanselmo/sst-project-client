import { CompanyStepEnum } from 'project/enum/company-step.enum';
import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { GetCNPJResponse } from 'core/services/hooks/mutations/general/useMutationCnpj/types';

import { ICompanyGroup } from './ICompanyGroup';
import { IContact } from './IContact';
import { IExamToClinic } from './IExam';

export interface ICompany {
  id: string;
  cnpj: string;
  name: string;
  fantasy: string;
  status: StatusEnum;
  type: CompanyTypesEnum;
  isConsulting: boolean;
  created_at: Date;
  updated_at: Date;
  licenseId?: number;
  logoUrl?: string;
  parentCompanyId?: string;
  license?: ILicense;
  workspace?: IWorkspace[];
  address?: IAddress;
  size: string;
  phone: string;
  group: ICompanyGroup;
  legal_nature: string;
  cadastral_situation: string;
  addressId: string;
  activityStartDate: Date;
  cadastral_situation_date: string;
  legal_nature_code: string;
  cadastral_situation_description: string;
  responsibleName: string;
  operationTime: string;
  riskDegree?: number;
  primary_activity: ICnae[];
  secondary_activity: ICnae[];
  contacts: IContact[];
  employeeCount: number;
  riskGroupCount: number;
  hierarchyCount: number;
  homogenousGroupCount: number;
  professionalCount?: number;
  examCount?: number;
  usersCount?: number;
  step?: CompanyStepEnum;
  steps?: CompanyStepEnum[];
  responsibleNit: string;
  responsibleCpf: string;
  initials: string;
  description: string;
  unit: string;
  obs: string;
  numAsos: number;
  blockResignationExam: boolean;
  esocialStart: Date;
  doctorResponsibleId: number;
  tecResponsibleId: number;
  isClinic: boolean;
  clinicExams: IExamToClinic[];
  clinicsAvailable: {
    clinicId: string;
    companyId: string;
  }[];
}

export interface IWorkspace {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  status: StatusEnum;
  created_at: Date;
  updated_at: Date;
  companyId: string;
  address?: IAddress;
  employeeCount?: number;
  isOwner?: boolean;
  company?: ICompany;
  cnpj?: string;
  companyJson?: GetCNPJResponse;
}

export interface IAddress {
  id?: string;
  number: string;
  cep: string;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  workspaceId?: number;
  workspace?: IWorkspace;
}

export interface ILicense {
  id: number;
  companyId: string;
  status: StatusEnum;
  created_at: Date;
  companies?: ICompany[];
}
export interface ICnae {
  name: string;
  code: string;
  riskDegree: string;
}
