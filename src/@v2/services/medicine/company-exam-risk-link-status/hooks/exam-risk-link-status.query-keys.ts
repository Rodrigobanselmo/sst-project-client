import type { IBrowseExamRiskLinkStatusParams } from '../company-exam-risk-link-status.types';

export const examRiskLinkStatusQueryKeys = {
  all: () => ['exam-risk-link-status'],
  browse: (params: IBrowseExamRiskLinkStatusParams) => [
    'exam-risk-link-status',
    'browse',
    params,
  ],
};
