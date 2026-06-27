import { ExamRiskRuleRoutes } from '@v2/constants/routes/exam-risk-rule.routes';
import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import type {
  IExamRiskRuleImportApplyResult,
  IExamRiskRuleImportPreviewResult,
} from './exam-risk-rule.types';

/** Frase de dupla confirmação exigida pela API para aplicar a curadoria. */
export const EXAM_RISK_RULE_APPLY_CONFIRM_TEXT = 'APLICAR CURADORIA EXAME X RISCO';

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

export async function exportExamRiskRules() {
  await downloadXlsx(ExamRiskRuleRoutes.EXPORT);
}

export async function downloadExamRiskRuleTemplate() {
  await downloadXlsx(ExamRiskRuleRoutes.TEMPLATE);
}

export async function importExamRiskRulePreview(
  file: File,
): Promise<IExamRiskRuleImportPreviewResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<IExamRiskRuleImportPreviewResult>(
    ExamRiskRuleRoutes.IMPORT_PREVIEW,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

export async function applyExamRiskRuleImport(
  file: File,
): Promise<IExamRiskRuleImportApplyResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confirmApply', 'true');
  formData.append('confirmText', EXAM_RISK_RULE_APPLY_CONFIRM_TEXT);

  const response = await api.post<IExamRiskRuleImportApplyResult>(
    ExamRiskRuleRoutes.IMPORT_APPLY,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}
