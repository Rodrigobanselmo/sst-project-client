import { ExportRoutes } from '@v2/constants/routes/export.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import { ExportActionPlanParams } from './export-action-plan.types';

export async function exportActionPlan({
  companyId,
  workspaceId,
  ...body
}: ExportActionPlanParams) {
  const { token } = await refreshToken();
  const response = await api.post(
    bindUrlParams({
      path: ExportRoutes.ACTION_PLAN.EXPORT,
      pathParams: { companyId, workspaceId },
    }),
    body,
    {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.headers['content-type'] === 'application/json; charset=utf-8') {
    return response.data;
  }

  downloadFile(response);
}
