import { IRiskFactors } from './IRiskFactors';

export interface IProtocol {
  id: number;
  name: string;
  created_at: Date;
  deleted_at: Date;
  updated_at: Date;
  companyId: string;
  protocolToRisk: IProtocolToRisk[];
  system: boolean;
}

export interface IProtocolToRisk {
  id: number;
  riskId: string;
  protocolId: number;
  updated_at: Date;
  minRiskDegree: number;
  companyId: string;
  risk: IRiskFactors;
  protocol: IProtocol;
}
