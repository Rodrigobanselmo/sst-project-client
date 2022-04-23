import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

export interface IRecMed {
  id: number;
  recName: string;
  medName: string;
  riskId: number;
  companyId: string;
  system: true;
  status: StatusEnum;
  created_at: string;
}

export interface IAdmMeasures {
  id: number;
  name: string;
  riskId: number;
  companyId: string;
  system: true;
  status: StatusEnum;
  created_at: string;
}

export interface IGenerateSource {
  id: number;
  name: string;
  riskId: number;
  companyId: string;
  system: true;
  status: StatusEnum;
  created_at: string;
}

export interface IRecMedCreate {
  recName?: string;
  medName?: string;
  riskId?: number;
  status?: StatusEnum;
  localId?: string | number;
}

export interface IGenerateSourceCreate {
  name?: string;
  riskId?: number;
  status?: StatusEnum;
  localId?: string | number;
}

export interface IRiskFactors {
  id: number;
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
