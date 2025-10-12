import { IOrderByParams } from '@v2/types/order-by-params.type';
import { SStatusButtonRowProps } from '../../addons/addons-rows/SStatusButtonRow/SStatusButtonRow';
import { TablesSelectEnum } from '../../hooks/useTableSelect';
import { ReactNode } from 'react';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { ActionPlanColumnsEnum } from './enums/action-plan-columns.enum';
import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan/browse-action-plan/service/browse-action-plan.types';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { IRiskLevelValues } from '@v2/models/security/types/risk-level-values.type';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

export interface IActionPlanFilterProps {
  search?: string;
  status?: ActionPlanStatusEnum[];
  isExpired?: boolean | null;
  occupationalRisks?: IRiskLevelValues[];
  riskTypes?: RiskTypeEnum[];
  riskSubTypes?: {
    id: number;
    name: string;
  }[];
  hierarchies?: {
    id: string;
    name: string;
  }[];
  responsibles?: {
    id: string;
    name: string;
  }[];
  generateSources?: {
    id: string;
    name: string;
  }[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<ActionPlanOrderByEnum>[];
}

export interface IActionPlanTableTableProps {
  companyId: string;
  data?: ActionPlanBrowseResultModel[];
  table: TablesSelectEnum;
  hiddenColumns: Record<ActionPlanColumnsEnum, boolean>;
  filterColumns: Partial<Record<ActionPlanColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Partial<Record<ActionPlanColumnsEnum, boolean>>,
  ) => void;
  isLoading?: boolean;
  filters: IActionPlanFilterProps;
  setFilters: (values: IActionPlanFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<ActionPlanOrderByEnum>) => void;
  disabledResponisble?: boolean;
  onSelectRow: (row: ActionPlanBrowseResultModel) => void;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
