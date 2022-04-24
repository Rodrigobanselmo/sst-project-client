import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

export interface IRecMed {
  id: string;
  recName: string;
  medName: string;
  riskId: string;
  companyId: string;
  system: true;
  status: StatusEnum;
  created_at: string;
}

export interface IAdmMeasures {
  id: string;
  name: string;
  riskId: string;
  companyId: string;
  system: true;
  status: StatusEnum;
  created_at: string;
}

export interface IGenerateSource {
  id: string;
  name: string;
  riskId: string;
  companyId: string;
  system: true;
  status: StatusEnum;
  created_at: string;
}

export interface IRecMedCreate {
  recName?: string;
  medName?: string;
  riskId?: string;
  status?: StatusEnum;
  localId?: string | number;
}

export interface IGenerateSourceCreate {
  name?: string;
  riskId?: string;
  status?: StatusEnum;
  localId?: string | number;
}

export interface IRiskFactors {
  id: string;
  name: string;
  type: RiskEnum;
  system: boolean;
  representAll: boolean;
  recMed: IRecMed[];
  generateSource: IGenerateSource[];
  companyId: string;
  appendix: string;
  propagation: string[];
  created_at: string;
  status: StatusEnum;
}
