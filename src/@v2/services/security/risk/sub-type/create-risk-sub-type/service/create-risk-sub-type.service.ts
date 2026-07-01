import { RiskSubTypeMasterRoutes } from '@v2/constants/routes/risk-sub-type-master.routes';
import { api } from 'core/services/apiClient';

import {
  CreateRiskSubTypeParams,
  CreateRiskSubTypeResponse,
} from './create-risk-sub-type.types';

export async function createRiskSubType(params: CreateRiskSubTypeParams) {
  const response = await api.post<CreateRiskSubTypeResponse>(
    RiskSubTypeMasterRoutes.BASE,
    params,
  );

  return response.data;
}
