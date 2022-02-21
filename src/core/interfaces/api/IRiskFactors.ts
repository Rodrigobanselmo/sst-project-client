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

export interface IRecMedCreate {
  recName?: string;
  medName?: string;
  riskId?: number;
  status?: StatusEnum;
}

export interface IRiskFactors {
  id: number;
  name: string;
  type: RiskEnum;
  system: boolean;
  recMed: IRecMed[];
  companyId: string;
  appendix: string;
  propagation: string[];
  created_at: string;
  status: StatusEnum;
}
