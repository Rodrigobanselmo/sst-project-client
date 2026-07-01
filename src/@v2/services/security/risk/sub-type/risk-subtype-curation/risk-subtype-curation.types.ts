import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

export enum RiskSubtypeCurationFilterEnum {
  ALL = 'ALL',
  NONE = 'NONE',
  SPECIFIC = 'SPECIFIC',
}

export type ICurationRiskItem = {
  riskFactorId: string;
  name: string;
  type: RiskTypeEnum;
  cas: string | null;
  esocialCode: string | null;
  subTypes: { id: number; name: string }[];
  status: StatusEnum;
  isPCMSO: boolean;
};

export type IBrowseCurationRisksParams = {
  page?: number;
  limit?: number;
  type?: RiskTypeEnum;
  search?: string;
  status?: StatusEnum;
  onlyPcmso?: boolean;
  subtypeFilter?: RiskSubtypeCurationFilterEnum;
  subtypeId?: number;
};

export type IBrowseCurationRisksResponse = {
  results: ICurationRiskItem[];
  pagination: { page: number; limit: number; total: number };
};

export type IBulkRiskSubtypeResult = {
  totalRequested: number;
  updated: number;
  skipped: number;
  errors: { riskFactorId: string; message: string }[];
};
