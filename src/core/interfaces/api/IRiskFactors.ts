import { MedTypeEnum } from 'project/enum/medType.enum';
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
  medType?: MedTypeEnum;
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
  recMeds?: IRecMed[];
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
  severity: number;
  representAll: boolean;
  recMed: IRecMed[];
  generateSource: IGenerateSource[];
  companyId: string;
  appendix: string;
  propagation: string[];
  created_at: string;
  status: StatusEnum;
  exame?: string;
  symptoms?: string;
  method?: string;
  unit?: string;
  cas?: string;
  breather?: string;
  nr15lt?: string;
  twa?: string;
  stel?: string;
  ipvs?: string;
  pv?: string;
  pe?: string;
  carnogenicityACGIH?: string;
  carnogenicityLinach?: string;
}
