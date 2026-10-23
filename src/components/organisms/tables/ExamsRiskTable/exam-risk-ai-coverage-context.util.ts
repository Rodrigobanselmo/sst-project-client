import type { ICompanyExamRiskCoverageItem } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';

export const coverageAiOpenOptions = (
  item: Pick<ICompanyExamRiskCoverageItem, 'hasAnyAdoptedExam'>,
): { mode: 'SUGGEST' | 'REVIEW'; autoStart: false } => ({
  mode: item.hasAnyAdoptedExam ? 'REVIEW' : 'SUGGEST',
  autoStart: false,
});
