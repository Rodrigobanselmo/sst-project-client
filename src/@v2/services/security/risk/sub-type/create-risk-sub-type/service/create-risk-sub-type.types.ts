import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

export type CreateRiskSubTypeParams = {
  name: string;
  description?: string;
  type: RiskTypeEnum;
};

export type RiskSubTypeMasterModel = {
  id: number;
  name: string;
  slug: string;
  type: RiskTypeEnum;
  description?: string | null;
  status: StatusEnum;
  system: boolean;
};

export type CreateRiskSubTypeResponse = RiskSubTypeMasterModel;
