import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { IHierarchy } from './IHierarchy';
import { IRiskData } from './IRiskData';

export interface IRecMed {
  id: string;
  recName: string;
  medName: string;
  riskId: string;
  companyId: string;
  system: true;
  status: StatusEnum;
  medType?: MedTypeEnum;
  recType?: RecTypeEnum;
  created_at: string;
  engsRiskData: IEngsRiskData;
}

export interface IEngsRiskData {
  recMedId: string;
  riskFactorDataId?: string;
  efficientlyCheck?: boolean;
  recMed?: IRecMed;
}

export interface IRecMedRiskData {
  recMedId: number;
  riskFactorDataId?: string;
  efficientlyCheck?: boolean;
  recMed?: IRecMed;
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

export interface IRiskDocInfo {
  id: number;
  riskId: string;
  companyId: string;
  hierarchyId: string;
  hierarchy: IHierarchy;
  isAso: boolean;
  isPGR: boolean;
  isPCMSO: boolean;
  isPPP: boolean;
  created_at: Date;
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
  vmp?: string;
  twa?: string;
  stel?: string;
  ipvs?: string;
  pv?: string;
  pe?: string;
  isEmergency?: boolean;
  carnogenicityACGIH?: string;
  carnogenicityLinach?: string;
  docInfo?: IRiskDocInfo[];
  riskFactorData?: IRiskData[];
}
