import { EsocialProcedureRoutes } from '@v2/constants/routes/esocial-procedure.routes';
import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import type {
  IEsocialProcedureImportApplyResult,
  IEsocialProcedureImportPreviewResult,
} from './esocial-procedure.types';

/** Frase de dupla confirmação exigida pela API para aplicar a curadoria. */
export const ESOCIAL_PROCEDURE_APPLY_CONFIRM_TEXT = 'APLICAR CURADORIA TABELA 27';

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

export async function exportEsocialProcedures() {
  await downloadXlsx(EsocialProcedureRoutes.EXPORT);
}

export async function downloadEsocialProcedureTemplate() {
  await downloadXlsx(EsocialProcedureRoutes.TEMPLATE);
}

export async function importEsocialProcedurePreview(
  file: File,
): Promise<IEsocialProcedureImportPreviewResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<IEsocialProcedureImportPreviewResult>(
    EsocialProcedureRoutes.IMPORT_PREVIEW,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

export async function applyEsocialProcedureImport(
  file: File,
): Promise<IEsocialProcedureImportApplyResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confirmApply', 'true');
  formData.append('confirmText', ESOCIAL_PROCEDURE_APPLY_CONFIRM_TEXT);

  const response = await api.post<IEsocialProcedureImportApplyResult>(
    EsocialProcedureRoutes.IMPORT_APPLY,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}
