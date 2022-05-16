import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

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
  parentCompanyId?: string;
  license?: ILicense;
  workspace?: IWorkspace[];
}

export interface IWorkspace {
  id: number;
  name: string;
  status: StatusEnum;
  created_at: Date;
  updated_at: Date;
  companyId: string;
  address?: IAddress;
  company?: ICompany;
}

export interface IAddress {
  id: number;
  number: string;
  cep: string;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: StatusEnum;
  workspaceId: number;
  workspace?: IWorkspace;
}

export interface ILicense {
  id: number;
  companyId: string;
  status: StatusEnum;
  created_at: Date;
  companies?: ICompany[];
}
