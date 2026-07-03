import { ExamRiskRuleRoutes } from '@v2/constants/routes/exam-risk-rule.routes';
import { api } from 'core/services/apiClient';

import type {
  IBrowseExamRiskRulesParams,
  IBrowseExamRiskRulesResponse,
  ICreateExamRiskRulePayload,
  IExamRiskRule,
  IExamRiskRuleExamCandidate,
  IExamRiskRuleNr07SyncSummary,
  IExamRiskRuleAcgihSyncParams,
  IExamRiskRuleAcgihSyncResponse,
  IExamRiskRuleReference,
  IExamRiskRuleRiskCandidate,
  IExamRiskRuleAiSuggestionRequest,
  IExamRiskRuleAiSuggestionResponse,
  IExamRiskRuleAiPreset,
  IBrowseExamRiskRuleAiPresetsParams,
  ICreateExamRiskRuleAiPresetPayload,
  IUpdateExamRiskRuleAiPresetPayload,
  IUpdateExamRiskRulePayload,
  ExamRiskRuleCategoryEnum,
  ExamRiskRuleStatusEnum,
} from './exam-risk-rule.types';
import type {
  IBrowseExamRiskRuleCoverageGapsParams,
  IExamRiskRuleCoverageGapsResponse,
} from './exam-risk-rule-coverage-gaps.types';

export async function browseExamRiskRules(
  params: IBrowseExamRiskRulesParams,
): Promise<IBrowseExamRiskRulesResponse> {
  const response = await api.get<IBrowseExamRiskRulesResponse>(
    ExamRiskRuleRoutes.BASE,
    { params },
  );
  return response.data;
}

export async function getExamRiskRuleById(id: string): Promise<IExamRiskRule> {
  const response = await api.get<IExamRiskRule>(
    ExamRiskRuleRoutes.BY_ID.replace(':id', id),
  );
  return response.data;
}

export async function createExamRiskRule(
  payload: ICreateExamRiskRulePayload,
): Promise<IExamRiskRule> {
  const response = await api.post<IExamRiskRule>(
    ExamRiskRuleRoutes.BASE,
    payload,
  );
  return response.data;
}

export async function updateExamRiskRule(params: {
  id: string;
  payload: IUpdateExamRiskRulePayload;
}): Promise<IExamRiskRule> {
  const response = await api.patch<IExamRiskRule>(
    ExamRiskRuleRoutes.BY_ID.replace(':id', params.id),
    params.payload,
  );
  return response.data;
}

export async function updateExamRiskRuleStatus(params: {
  id: string;
  status: ExamRiskRuleStatusEnum;
}): Promise<IExamRiskRule> {
  const response = await api.patch<IExamRiskRule>(
    ExamRiskRuleRoutes.STATUS.replace(':id', params.id),
    { status: params.status },
  );
  return response.data;
}

export async function deleteExamRiskRule(id: string): Promise<void> {
  await api.delete(ExamRiskRuleRoutes.BY_ID.replace(':id', id));
}

export async function syncExamRiskRulesNr07(): Promise<IExamRiskRuleNr07SyncSummary> {
  const response = await api.post<IExamRiskRuleNr07SyncSummary>(
    ExamRiskRuleRoutes.SYNC_NR07,
  );
  return response.data;
}

/** Sincroniza indicadores ACGIH/BEI consolidados com a Biblioteca Risco × Exame. */
export async function syncExamRiskRulesAcgihBei(
  params: IExamRiskRuleAcgihSyncParams,
): Promise<IExamRiskRuleAcgihSyncResponse> {
  const response = await api.post<IExamRiskRuleAcgihSyncResponse>(
    ExamRiskRuleRoutes.SYNC_ACGIH_BEI,
    {
      confirmText: params.confirmText,
      dryRun: params.dryRun,
    },
  );
  return response.data;
}

export async function searchExamRiskRuleRiskCandidates(params: {
  search?: string;
  type?: ExamRiskRuleCategoryEnum;
  limit?: number;
}): Promise<IExamRiskRuleRiskCandidate[]> {
  const response = await api.get<IExamRiskRuleRiskCandidate[]>(
    ExamRiskRuleRoutes.RISK_CANDIDATES,
    { params },
  );
  return response.data;
}

export async function searchExamRiskRuleExamCandidates(params: {
  search?: string;
  limit?: number;
}): Promise<IExamRiskRuleExamCandidate[]> {
  const response = await api.get<IExamRiskRuleExamCandidate[]>(
    ExamRiskRuleRoutes.EXAM_CANDIDATES,
    { params },
  );
  return response.data;
}

export async function dryRunExamRiskRuleAiSuggestions(
  payload: IExamRiskRuleAiSuggestionRequest,
): Promise<IExamRiskRuleAiSuggestionResponse> {
  const response = await api.post<IExamRiskRuleAiSuggestionResponse>(
    ExamRiskRuleRoutes.AI_SUGGESTIONS_DRY_RUN,
    payload,
  );
  return response.data;
}

export async function browseExamRiskRuleAiPresets(
  params: IBrowseExamRiskRuleAiPresetsParams = {},
): Promise<IExamRiskRuleAiPreset[]> {
  const response = await api.get<IExamRiskRuleAiPreset[]>(
    ExamRiskRuleRoutes.AI_SUGGESTION_PRESETS,
    { params },
  );
  return response.data;
}

export async function getExamRiskRuleAiPresetById(
  presetId: string,
): Promise<IExamRiskRuleAiPreset> {
  const response = await api.get<IExamRiskRuleAiPreset>(
    ExamRiskRuleRoutes.AI_SUGGESTION_PRESET_BY_ID.replace(
      ':presetId',
      presetId,
    ),
  );
  return response.data;
}

export async function createExamRiskRuleAiPreset(
  payload: ICreateExamRiskRuleAiPresetPayload,
): Promise<IExamRiskRuleAiPreset> {
  const response = await api.post<IExamRiskRuleAiPreset>(
    ExamRiskRuleRoutes.AI_SUGGESTION_PRESETS,
    payload,
  );
  return response.data;
}

export async function updateExamRiskRuleAiPreset(params: {
  presetId: string;
  payload: IUpdateExamRiskRuleAiPresetPayload;
}): Promise<IExamRiskRuleAiPreset> {
  const response = await api.patch<IExamRiskRuleAiPreset>(
    ExamRiskRuleRoutes.AI_SUGGESTION_PRESET_BY_ID.replace(
      ':presetId',
      params.presetId,
    ),
    params.payload,
  );
  return response.data;
}

export async function deleteExamRiskRuleAiPreset(presetId: string): Promise<void> {
  await api.delete(
    ExamRiskRuleRoutes.AI_SUGGESTION_PRESET_BY_ID.replace(
      ':presetId',
      presetId,
    ),
  );
}

// ── Fontes complementares (Fase 4I) ─────────────────────────────────────────

export async function listExamRiskRuleReferences(
  ruleId: string,
): Promise<IExamRiskRuleReference[]> {
  const response = await api.get<IExamRiskRuleReference[]>(
    ExamRiskRuleRoutes.REFERENCES.replace(':ruleId', ruleId),
  );
  return response.data;
}

export async function deleteExamRiskRuleReference(params: {
  ruleId: string;
  referenceId: string;
}): Promise<void> {
  await api.delete(
    ExamRiskRuleRoutes.REFERENCE_BY_ID.replace(
      ':ruleId',
      params.ruleId,
    ).replace(':referenceId', params.referenceId),
  );
}

export async function browseExamRiskRuleCoverageGaps(
  params: IBrowseExamRiskRuleCoverageGapsParams,
): Promise<IExamRiskRuleCoverageGapsResponse> {
  const response = await api.get<IExamRiskRuleCoverageGapsResponse>(
    ExamRiskRuleRoutes.COVERAGE_GAPS,
    { params },
  );
  return response.data;
}
