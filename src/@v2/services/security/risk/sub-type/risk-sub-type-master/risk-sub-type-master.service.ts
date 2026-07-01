import { RiskSubTypeMasterRoutes } from '@v2/constants/routes/risk-sub-type-master.routes';
import { api } from 'core/services/apiClient';

import type {
  IBrowseRiskSubTypesMasterParams,
  IBrowseRiskSubTypesMasterResponse,
  IRiskSubTypeMasterItem,
  IUpdateRiskSubTypeMasterPayload,
} from './risk-sub-type-master.types';
import { StatusEnum } from 'project/enum/status.enum';

export async function browseRiskSubTypesMaster(
  params: IBrowseRiskSubTypesMasterParams,
): Promise<IBrowseRiskSubTypesMasterResponse> {
  const response = await api.get<IBrowseRiskSubTypesMasterResponse>(
    RiskSubTypeMasterRoutes.BASE,
    { params },
  );
  return response.data;
}

export async function updateRiskSubTypeMaster(
  params: IUpdateRiskSubTypeMasterPayload,
): Promise<IRiskSubTypeMasterItem> {
  const { id, ...body } = params;
  const response = await api.patch<IRiskSubTypeMasterItem>(
    RiskSubTypeMasterRoutes.BY_ID.replace(':id', String(id)),
    body,
  );
  return response.data;
}

export async function updateRiskSubTypeMasterStatus(params: {
  id: number;
  status: StatusEnum;
}): Promise<IRiskSubTypeMasterItem> {
  const response = await api.patch<IRiskSubTypeMasterItem>(
    RiskSubTypeMasterRoutes.STATUS.replace(':id', String(params.id)),
    { status: params.status },
  );
  return response.data;
}
