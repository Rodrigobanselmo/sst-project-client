import type { IBrowseCompanyExamRiskGapsParams } from '../company-exam-risk-gaps.types';

export const companyExamRiskGapsQueryKeys = {
  all: () => ['company-exam-risk-gaps'],
  browse: (params: IBrowseCompanyExamRiskGapsParams) => [
    'company-exam-risk-gaps',
    'browse',
    params,
  ],
};
