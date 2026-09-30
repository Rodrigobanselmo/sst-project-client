import { SectorRiskPresenceRoutes } from '@v2/constants/routes/sector-risk-presence.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  BrowseSectorRiskPresenceParams,
  SectorRiskPresence,
} from './sector-risk-presence.types';

export async function browseSectorRiskPresence(
  params: BrowseSectorRiskPresenceParams,
  options?: { signal?: AbortSignal },
): Promise<SectorRiskPresence> {
  const response = await api.get<SectorRiskPresence>(
    bindUrlParams({
      path: SectorRiskPresenceRoutes.BROWSE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    options?.signal ? { signal: options.signal } : undefined,
  );

  return response.data;
}
