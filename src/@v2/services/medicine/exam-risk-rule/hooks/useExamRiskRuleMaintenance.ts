import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  applyExamRiskRuleImport,
  downloadExamRiskRuleTemplate,
  exportExamRiskRules,
  importExamRiskRulePreview,
} from '../service/exam-risk-rule-maintenance.service';
import { examRiskRuleQueryKeys } from './exam-risk-rule.query-keys';

export const useExportExamRiskRules = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: () => exportExamRiskRules(),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useDownloadExamRiskRuleTemplate = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: () => downloadExamRiskRuleTemplate(),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useImportExamRiskRulePreview = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: (file: File) => importExamRiskRulePreview(file),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useApplyExamRiskRuleImport = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: (file: File) => applyExamRiskRuleImport(file),
    invalidateManyQueryKeys: () => [examRiskRuleQueryKeys.all()],
    onSuccess: () => onSuccessMessage('Curadoria Risco × Exame aplicada'),
    onError: onErrorMessage,
  });
};
