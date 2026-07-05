import {
  EXAM_RISK_AI_DEFAULT_LIMIT,
  EXAM_RISK_AI_MAX_LIMIT,
} from './exam-risk-ai-assistant.constants';
import type { ExamRiskAiAssistantFormValues } from './exam-risk-ai-assistant.types';
import type {
  IExamRiskRuleRiskToExamAiPreset,
  IExamRiskRuleRiskToExamAiPresetConfig,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

const trimOptionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

export type BuildRiskToExamAiPresetConfigParams = {
  formValues: ExamRiskAiAssistantFormValues;
  includeExistingRules: boolean;
  includeIndirectCoverage: boolean;
  onlyWithoutExamCoverage: boolean;
};

export const buildRiskToExamAiPresetConfig = (
  params: BuildRiskToExamAiPresetConfigParams,
): IExamRiskRuleRiskToExamAiPresetConfig => {
  const limit = Math.min(
    EXAM_RISK_AI_MAX_LIMIT,
    Math.max(1, Number(params.formValues.limit) || EXAM_RISK_AI_DEFAULT_LIMIT),
  );

  return {
    examFilters: {
      search: trimOptionalText(params.formValues.examSearch),
      examType: params.formValues.examType || undefined,
      onlyESocial: params.formValues.onlyESocial,
      limit,
    },
    options: {
      includeExistingRules: params.includeExistingRules,
      includeIndirectCoverage: params.includeIndirectCoverage,
      onlyWithoutExamCoverage: params.onlyWithoutExamCoverage,
    },
    aiConfig: {
      instructions: trimOptionalText(params.formValues.instructions),
      positiveExamples: trimOptionalText(params.formValues.positiveExamples),
      negativeExamples: trimOptionalText(params.formValues.negativeExamples),
      cautionRules: trimOptionalText(params.formValues.cautionRules),
      sessionInstruction: trimOptionalText(params.formValues.sessionInstruction),
      model: trimOptionalText(params.formValues.model),
    },
  };
};

export type ExamRiskAiPresetMappedState = {
  formValues: ExamRiskAiAssistantFormValues;
  includeExistingRules: boolean;
  includeIndirectCoverage: boolean;
  onlyWithoutExamCoverage: boolean;
};

export const mapExamRiskAiPresetToState = (
  preset: IExamRiskRuleRiskToExamAiPreset,
): ExamRiskAiPresetMappedState => {
  const { config } = preset;
  return {
    formValues: {
      examSearch: config.examFilters?.search ?? '',
      examType: config.examFilters?.examType ?? '',
      onlyESocial: config.examFilters?.onlyESocial ?? false,
      limit: config.examFilters?.limit ?? 30,
      instructions: config.aiConfig?.instructions ?? '',
      positiveExamples: config.aiConfig?.positiveExamples ?? '',
      negativeExamples: config.aiConfig?.negativeExamples ?? '',
      cautionRules: config.aiConfig?.cautionRules ?? '',
      sessionInstruction: config.aiConfig?.sessionInstruction ?? '',
      model: config.aiConfig?.model ?? '',
    },
    includeExistingRules: config.options?.includeExistingRules ?? true,
    includeIndirectCoverage: config.options?.includeIndirectCoverage ?? true,
    onlyWithoutExamCoverage: config.options?.onlyWithoutExamCoverage ?? false,
  };
};

export const mapCompanyPresetToState = (
  preset: IExamRiskRuleRiskToExamAiPreset,
) => {
  const mapped = mapExamRiskAiPresetToState(preset);
  return {
    formValues: mapped.formValues,
    includeExistingLinks: mapped.includeExistingRules,
    onlyWithoutCompanyLink: mapped.onlyWithoutExamCoverage,
  };
};
