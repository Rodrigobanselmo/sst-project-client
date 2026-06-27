import { AcgihBeiIndicatorRoutes } from '@v2/constants/routes/acgih-bei-indicator.routes';
import { api } from 'core/services/apiClient';

import type {
  AcgihBeiIndicatorStatusEnum,
  IAcgihBeiIndicator,
  IBrowseAcgihBeiIndicatorsParams,
  IBrowseAcgihBeiIndicatorsResponse,
  IUpsertAcgihBeiIndicatorPayload,
} from './acgih-bei-indicator.types';

export async function browseAcgihBeiIndicators(
  params: IBrowseAcgihBeiIndicatorsParams,
): Promise<IBrowseAcgihBeiIndicatorsResponse> {
  const response = await api.get<IBrowseAcgihBeiIndicatorsResponse>(
    AcgihBeiIndicatorRoutes.BASE,
    { params },
  );
  return response.data;
}

export async function getAcgihBeiIndicatorById(
  id: string,
): Promise<IAcgihBeiIndicator> {
  const response = await api.get<IAcgihBeiIndicator>(
    AcgihBeiIndicatorRoutes.BY_ID.replace(':id', id),
  );
  return response.data;
}

export async function createAcgihBeiIndicator(
  payload: IUpsertAcgihBeiIndicatorPayload,
): Promise<IAcgihBeiIndicator> {
  const response = await api.post<IAcgihBeiIndicator>(
    AcgihBeiIndicatorRoutes.BASE,
    payload,
  );
  return response.data;
}

export async function updateAcgihBeiIndicator(params: {
  id: string;
  payload: IUpsertAcgihBeiIndicatorPayload;
}): Promise<IAcgihBeiIndicator> {
  const response = await api.patch<IAcgihBeiIndicator>(
    AcgihBeiIndicatorRoutes.BY_ID.replace(':id', params.id),
    params.payload,
  );
  return response.data;
}

export async function updateAcgihBeiIndicatorStatus(params: {
  id: string;
  status: AcgihBeiIndicatorStatusEnum;
}): Promise<IAcgihBeiIndicator> {
  const response = await api.patch<IAcgihBeiIndicator>(
    AcgihBeiIndicatorRoutes.STATUS.replace(':id', params.id),
    { status: params.status },
  );
  return response.data;
}

export async function deleteAcgihBeiIndicator(id: string): Promise<void> {
  await api.delete(AcgihBeiIndicatorRoutes.BY_ID.replace(':id', id));
}
