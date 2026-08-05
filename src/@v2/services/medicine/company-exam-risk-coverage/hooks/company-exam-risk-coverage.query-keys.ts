import type {
  IBrowseCompanyExamRiskCoverageParams,
  IFetchCompanyExamRiskCoverageDetailParams,
} from '../company-exam-risk-coverage.types';

export const companyExamRiskCoverageQueryKeys = {
  all: () => ['company-exam-risk-coverage'],
  browse: (params: IBrowseCompanyExamRiskCoverageParams) => [
    'company-exam-risk-coverage',
    'browse',
    params,
  ],
  detail: (params: IFetchCompanyExamRiskCoverageDetailParams) => [
    'company-exam-risk-coverage',
    'detail',
    params,
  ],
};
