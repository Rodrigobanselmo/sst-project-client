import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum ActionPlanOrderByEnum {
  ORIGIN = 'ORIGIN',
  ORIGIN_TYPE = 'ORIGIN_TYPE',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  LEVEL = 'LEVEL',
  RECOMMENDATION = 'RECOMMENDATION',
  RISK = 'RISK',
  STATUS = 'STATUS',
  START_DATE = 'START_DATE',
  DONE_DATE = 'DONE_DATE',
  CANCEL_DATE = 'CANCEL_DATE',
  VALID_DATE = 'VALID_DATE',
  RESPONSIBLE = 'RESPONSIBLE',
}

export interface BrowseActionPlanParams {
  companyId: string;
  workspaceId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<ActionPlanOrderByEnum>[];
  filters?: {
    search?: string;
    status?: ActionPlanStatusEnum[];
    responisbleIds?: number[];
    workspaceIds?: string[];
    hierarchyIds?: string[];
    recommendationIds?: string[];
    generateSourceIds?: string[];
    riskIds?: string[];
    ocupationalRisks?: number[];
    isStarted?: boolean;
    isDone?: boolean;
    isCanceled?: boolean;
    isExpired?: boolean;
  };
}
