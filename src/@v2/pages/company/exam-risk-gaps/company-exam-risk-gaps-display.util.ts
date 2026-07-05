import {
  CompanyExamRiskLibraryCoverageEnum,
  CompanyExamRiskSuggestionStatusEnum,
} from '@v2/services/medicine/company-exam-risk-gaps/company-exam-risk-gaps.types';

export const companyExamRiskSuggestionStatusLabels: Record<
  CompanyExamRiskSuggestionStatusEnum,
  string
> = {
  [CompanyExamRiskSuggestionStatusEnum.MISSING_LINK]: 'Lacuna',
  [CompanyExamRiskSuggestionStatusEnum.ALREADY_LINKED]: 'Já vinculado',
  [CompanyExamRiskSuggestionStatusEnum.CONFIG_DRIFT]: 'Divergência de config',
};

export const companyExamRiskSuggestionStatusColors: Record<
  CompanyExamRiskSuggestionStatusEnum,
  'default' | 'success' | 'warning' | 'error' | 'info'
> = {
  [CompanyExamRiskSuggestionStatusEnum.MISSING_LINK]: 'error',
  [CompanyExamRiskSuggestionStatusEnum.ALREADY_LINKED]: 'success',
  [CompanyExamRiskSuggestionStatusEnum.CONFIG_DRIFT]: 'info',
};

export const companyExamRiskLibraryCoverageLabels: Record<
  CompanyExamRiskLibraryCoverageEnum,
  string
> = {
  [CompanyExamRiskLibraryCoverageEnum.MATCHED_BY_RULE]: 'Biblioteca ACTIVE',
  [CompanyExamRiskLibraryCoverageEnum.BIOLOGICAL_INDIRECT_ONLY]:
    'Indicador biológico',
  [CompanyExamRiskLibraryCoverageEnum.NO_GLOBAL_REFERENCE]:
    'Sem referência global',
};

export const companyExamRiskLibraryCoverageColors: Record<
  CompanyExamRiskLibraryCoverageEnum,
  'default' | 'success' | 'warning' | 'info'
> = {
  [CompanyExamRiskLibraryCoverageEnum.MATCHED_BY_RULE]: 'success',
  [CompanyExamRiskLibraryCoverageEnum.BIOLOGICAL_INDIRECT_ONLY]: 'info',
  [CompanyExamRiskLibraryCoverageEnum.NO_GLOBAL_REFERENCE]: 'warning',
};

export const formatCompanyExamRiskDriftFields = (fields: string[]) => {
  if (!fields.length) return '—';
  return fields.join(', ');
};
