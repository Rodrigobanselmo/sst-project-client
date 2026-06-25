import { BiologicalIndicatorRoutes } from '@v2/constants/routes/biological-indicator.routes';
import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import type {
  ImportApplyResult,
  ImportPreviewResult,
} from './biological-indicator.types';

export const BIOLOGICAL_INDICATOR_APPLY_CONFIRM_TEXT = 'APLICAR NR07';

async function downloadXlsx(path: string) {
  const { token } = await refreshToken();
  const response = await api.get(path, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await downloadFile(response);
}

export async function exportBiologicalIndicators() {
  await downloadXlsx(BiologicalIndicatorRoutes.EXPORT);
}

export async function downloadBiologicalIndicatorTemplate() {
  await downloadXlsx(BiologicalIndicatorRoutes.TEMPLATE);
}

export async function importBiologicalIndicatorPreview(
  file: File,
): Promise<ImportPreviewResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ImportPreviewResult>(
    BiologicalIndicatorRoutes.IMPORT_PREVIEW,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

export async function applyBiologicalIndicatorImport(
  file: File,
): Promise<ImportApplyResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confirmApply', 'true');
  formData.append('confirmText', BIOLOGICAL_INDICATOR_APPLY_CONFIRM_TEXT);

  const response = await api.post<ImportApplyResult>(
    BiologicalIndicatorRoutes.IMPORT_APPLY,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}
