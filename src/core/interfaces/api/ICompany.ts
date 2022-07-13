import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { GetCNPJResponse } from 'core/services/hooks/mutations/useMutationCnpj/types';

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
  legal_nature: string;
  cadastral_situation: string;
  addressId: string;
  activity_start_date: string;
  cadastral_situation_date: string;
  legal_nature_code: string;
  cadastral_situation_description: string;
  responsibleName: string;
  operationTime: string;
  primary_activity: ActivityDto[];
  secondary_activity: ActivityDto[];
  employeeCount: number;
  riskGroupCount: number;
  hierarchyCount: number;
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
export interface ActivityDto {
  name: string;
  code: string;
}
