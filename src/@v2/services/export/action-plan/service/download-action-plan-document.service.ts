import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import { DownloadActionPlanDocumentParams } from './download-action-plan-document.types';

export async function downloadActionPlanDocument({
  companyId,
  ...body
}: DownloadActionPlanDocumentParams) {
  const { token } = await refreshToken();
  const response = await api.post(
    ApiRoutesEnum.DOCUMENTS_PGR_PLAN,
    {
      companyId,
      ...body,
    },
    {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const contentType = String(response.headers['content-type'] || '');
  if (contentType.includes('application/json')) {
    const text = await (response.data as Blob).text();
    const parsed = JSON.parse(text);
    throw { response: { data: parsed } };
  }

  downloadFile(response);
}
