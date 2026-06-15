import type { RiskFactorAiSuggestionApplyMode } from '@v2/components/molecules/RiskFactorAiSuggestion/RiskFactorAiSuggestionApplyDialog';

type RiskFactorAiSuggestionDebugPayload = {
  severityAi?: unknown;
  severityFinal: unknown;
  severityAdjusted?: boolean;
  severityAdjustmentReason?: string;
  previousFormSeverity: unknown;
  previousRiskDataSeverity: unknown;
  mode: RiskFactorAiSuggestionApplyMode;
  appliedFormSeverity: string;
  appliedRiskDataSeverity: number;
  finalWatchedSeverity?: unknown;
  severityWarning?: string;
};

export const logRiskFactorAiSuggestionApply = (
  payload: RiskFactorAiSuggestionDebugPayload,
) => {
  if (process.env.NODE_ENV === 'production') return;

  // eslint-disable-next-line no-console
  console.group('[RiskFactorAiSuggestion] apply');
  // eslint-disable-next-line no-console
  console.log('severity AI:', payload.severityAi ?? payload.severityFinal);
  // eslint-disable-next-line no-console
  console.log('severity final:', payload.severityFinal);
  // eslint-disable-next-line no-console
  console.log('severity adjusted:', payload.severityAdjusted ? 'yes' : 'no');
  if (payload.severityAdjustmentReason) {
    // eslint-disable-next-line no-console
    console.log('adjustment reason:', payload.severityAdjustmentReason);
  }
  // eslint-disable-next-line no-console
  console.log('previous form severity:', payload.previousFormSeverity);
  // eslint-disable-next-line no-console
  console.log('previous riskData severity:', payload.previousRiskDataSeverity);
  // eslint-disable-next-line no-console
  console.log('mode:', payload.mode);
  // eslint-disable-next-line no-console
  console.log('applied form severity:', payload.appliedFormSeverity);
  // eslint-disable-next-line no-console
  console.log('applied riskData severity:', payload.appliedRiskDataSeverity);
  if (payload.severityWarning) {
    // eslint-disable-next-line no-console
    console.warn('severity warning:', payload.severityWarning);
  }
  if (payload.finalWatchedSeverity !== undefined) {
    // eslint-disable-next-line no-console
    console.log('final watched severity:', payload.finalWatchedSeverity);
  }
  // eslint-disable-next-line no-console
  console.groupEnd();
};

export const formatRiskFactorAiSuggestionDebugLine = (params: {
  severityAi?: number;
  severityFinal?: number;
  severityAdjusted?: boolean;
  formSeverity?: unknown;
  riskDataSeverity?: unknown;
}) => {
  const severityAi = params.severityAi ?? params.severityFinal ?? '—';
  const severityFinal = params.severityFinal ?? '—';
  const adjusted =
    params.severityAdjusted === true
      ? 'yes'
      : params.severityAdjusted === false
        ? 'no'
        : '—';

  return `[debug] severity AI: ${severityAi} · severity final: ${severityFinal} · form: ${String(params.formSeverity ?? '—')} · riskData: ${String(params.riskDataSeverity ?? '—')} · adjusted: ${adjusted}`;
};
