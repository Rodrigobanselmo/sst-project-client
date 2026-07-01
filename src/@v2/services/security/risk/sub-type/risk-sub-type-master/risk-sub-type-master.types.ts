import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

export type IRiskSubTypeMasterItem = {
  id: number;
  name: string;
  slug: string;
  type: RiskTypeEnum;
  description?: string | null;
  status: StatusEnum;
  system: boolean;
};

export type IBrowseRiskSubTypesMasterParams = {
  page?: number;
  limit?: number;
  type?: RiskTypeEnum;
  search?: string;
  status?: StatusEnum;
};

export type IBrowseRiskSubTypesMasterResponse = {
  results: IRiskSubTypeMasterItem[];
  pagination: { page: number; limit: number; total: number };
};

export type IUpdateRiskSubTypeMasterPayload = {
  id: number;
  name?: string;
  description?: string;
  status?: StatusEnum;
};
