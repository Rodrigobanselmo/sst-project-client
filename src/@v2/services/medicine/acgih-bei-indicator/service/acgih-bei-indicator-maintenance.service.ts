import { AcgihBeiIndicatorRoutes } from '@v2/constants/routes/acgih-bei-indicator.routes';
import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import type {
  IAcgihBeiImportApplyResult,
  IAcgihBeiImportPreviewResult,
} from './acgih-bei-indicator.types';

/** Frase de dupla confirmação exigida pela API para aplicar a curadoria. */
export const ACGIH_BEI_APPLY_CONFIRM_TEXT = 'APLICAR CURADORIA ACGIH BEI';

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

export async function exportAcgihBeiIndicators() {
  await downloadXlsx(AcgihBeiIndicatorRoutes.EXPORT);
}

export async function downloadAcgihBeiIndicatorTemplate() {
  await downloadXlsx(AcgihBeiIndicatorRoutes.TEMPLATE);
}

export async function importAcgihBeiIndicatorPreview(
  file: File,
): Promise<IAcgihBeiImportPreviewResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<IAcgihBeiImportPreviewResult>(
    AcgihBeiIndicatorRoutes.IMPORT_PREVIEW,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

export async function applyAcgihBeiIndicatorImport(
  file: File,
): Promise<IAcgihBeiImportApplyResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confirmApply', 'true');
  formData.append('confirmText', ACGIH_BEI_APPLY_CONFIRM_TEXT);

  const response = await api.post<IAcgihBeiImportApplyResult>(
    AcgihBeiIndicatorRoutes.IMPORT_APPLY,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}
