import { AI_MODEL_OPTIONS } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/ai-model-options';
import { CATALOG_ONLY_AI_MODEL_OPTIONS, CATALOG_ONLY_DEFAULT_AI_MODEL } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/suggest-catalog-risks-ai/catalog-only-ai-model-options.constants';

export const EXAM_RISK_AI_DEFAULT_MODEL = CATALOG_ONLY_DEFAULT_AI_MODEL;
export const EXAM_RISK_AI_MODEL_OPTIONS = [
  ...CATALOG_ONLY_AI_MODEL_OPTIONS.filter(option => option.value === EXAM_RISK_AI_DEFAULT_MODEL),
  ...AI_MODEL_OPTIONS,
];
