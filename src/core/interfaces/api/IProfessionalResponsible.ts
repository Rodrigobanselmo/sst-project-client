import { ProfessionalRespTypeEnum } from 'project/enum/professional-responsible-type.enum';

import { ICompany } from './ICompany';
import { IProfessional } from './IProfessional';

export type IProfessionalResponsible = {
  id: number;
  created_at: Date;
  updated_at: Date;
  startDate: Date;
  professionalCouncilId: number;
  companyId: string;
  professional?: IProfessional;
  type: ProfessionalRespTypeEnum;
  company?: ICompany;
};
