import { EsocialRoutes } from '@v2/constants/routes/esocial.routes';
import { api } from 'core/services/apiClient';

import type { EsocialTable27Response } from './esocial-table-27.types';

export async function browseEsocialTable27(): Promise<EsocialTable27Response> {
  const response = await api.get<EsocialTable27Response>(EsocialRoutes.TABLE_27);
  return response.data;
}
