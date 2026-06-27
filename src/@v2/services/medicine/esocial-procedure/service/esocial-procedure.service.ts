import { EsocialProcedureRoutes } from '@v2/constants/routes/esocial-procedure.routes';
import { api } from 'core/services/apiClient';

import type {
  EsocialProcedureStatusEnum,
  IBrowseEsocialProceduresParams,
  IBrowseEsocialProceduresResponse,
  IEsocialProcedureCuration,
  IEsocialProcedureItem,
  IUpsertEsocialProcedurePayload,
} from './esocial-procedure.types';

export async function browseEsocialProcedures(
  params: IBrowseEsocialProceduresParams,
): Promise<IBrowseEsocialProceduresResponse> {
  const response = await api.get<IBrowseEsocialProceduresResponse>(
    EsocialProcedureRoutes.BASE,
    { params },
  );
  return response.data;
}

export async function getEsocialProcedureByCode(
  procedureCode: string,
): Promise<IEsocialProcedureItem> {
  const response = await api.get<IEsocialProcedureItem>(
    EsocialProcedureRoutes.BY_CODE.replace(':procedureCode', procedureCode),
  );
  return response.data;
}

export async function upsertEsocialProcedure(params: {
  procedureCode: string;
  payload: IUpsertEsocialProcedurePayload;
}): Promise<IEsocialProcedureCuration> {
  const response = await api.put<IEsocialProcedureCuration>(
    EsocialProcedureRoutes.BY_CODE.replace(':procedureCode', params.procedureCode),
    params.payload,
  );
  return response.data;
}

export async function updateEsocialProcedureStatus(params: {
  id: string;
  status: EsocialProcedureStatusEnum;
}): Promise<IEsocialProcedureCuration> {
  const response = await api.patch<IEsocialProcedureCuration>(
    EsocialProcedureRoutes.STATUS.replace(':id', params.id),
    { status: params.status },
  );
  return response.data;
}

export async function deleteEsocialProcedure(id: string): Promise<void> {
  await api.delete(EsocialProcedureRoutes.BY_ID.replace(':id', id));
}
