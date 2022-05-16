import { CompanyTypesEnum } from 'project/enum/company-type.enum';

import { ActivityDto } from 'core/interfaces/api/ICompany';

export interface GetCNPJResponse {
  cnpj: string;
  name: string;
  size: string;
  fantasy: string;
  primary_activity?: ActivityDto[];
  secondary_activity?: ActivityDto[];
  phone: string;
  legal_nature: string;
  cadastral_situation: string;
  activity_start_date: string;
  cadastral_situation_date: string;
  legal_nature_code: string;
  type: CompanyTypesEnum;
  cadastral_situation_description: string;
  address: {
    neighborhood: string;
    number: string;
    city: string;
    street: string;
    cep: string;
    complement: string;
    state: string;
  };
}
