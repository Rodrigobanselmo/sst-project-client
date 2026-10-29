import type { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import {
  buildPendingAcceptPayload,
  RiskFactorAiPendingRiskData,
  RiskFactorAiPendingSuggestion,
} from './risk-factor-ai-pending.util';
import { riskDataAlreadyContainsFieldValue } from './risk-factors-ai-scope.util';

export type AcceptPendingAiSuggestionResult =
  | 'applied'
  | 'already-registered'
  | 'cancelled'
  | 'invalid'
  | 'failed';

/**
 * Ordem obrigatória: confirmação humana, gravação pela linha, releitura do cadastro
 * e só então a marcação como aplicada. Qualquer falha mantém a sugestão pendente.
 */
export async function acceptPendingAiSuggestion(params: {
  isActive?: () => boolean;
  beforeWrite?: () => Promise<boolean>;
  suggestion: RiskFactorAiPendingSuggestion;
  riskData: RiskFactorAiPendingRiskData & { id?: string; riskId?: string };
  companyId: string;
  headerWorkspaceId?: string | null;
  confirmExistence: (value: string) => Promise<boolean>;
  write: (payload: Partial<IUpsertRiskData>) => Promise<void> | void;
  readSavedRow: () => Promise<RiskFactorAiPendingRiskData | null | undefined>;
  markApplied: (key: string) => void;
  onExistenceConfirmed?: () => Promise<void> | void;
}): Promise<AcceptPendingAiSuggestionResult> {
  if (params.isActive && !params.isActive()) return 'cancelled';
  const { suggestion } = params;
  const isExistingControl = suggestion.action === 'confirm-existence';

  if (
    riskDataAlreadyContainsFieldValue(
      suggestion.field,
      suggestion.value,
      params.riskData,
    )
  ) {
    try {
      if (params.beforeWrite && !(await params.beforeWrite()))
        return 'cancelled';
    } catch {
      return 'failed';
    }
    if (params.isActive && !params.isActive()) return 'cancelled';
    params.markApplied(suggestion.key);
    return 'already-registered';
  }

  if (isExistingControl) {
    const confirmed = await params.confirmExistence(suggestion.value);
    if (!confirmed) return 'cancelled';
  }

  if (params.isActive && !params.isActive()) return 'cancelled';
  const payload = buildPendingAcceptPayload({
    suggestion,
    riskData: params.riskData,
    companyId: params.companyId,
    headerWorkspaceId: params.headerWorkspaceId,
  });
  if (!payload) return 'invalid';

  try {
    if (params.beforeWrite && !(await params.beforeWrite())) return 'cancelled';
    if (params.isActive && !params.isActive()) return 'cancelled';
    await params.write(payload);
    const saved = await params.readSavedRow();
    if (params.isActive && !params.isActive()) return 'cancelled';
    if (
      !saved ||
      !riskDataAlreadyContainsFieldValue(
        suggestion.field,
        suggestion.value,
        saved,
      )
    ) {
      return 'failed';
    }
  } catch {
    return 'failed';
  }

  params.markApplied(suggestion.key);
  if (isExistingControl && params.onExistenceConfirmed) {
    try {
      await params.onExistenceConfirmed();
    } catch {
      // O controle já está cadastrado; o registro de confirmação é auxiliar.
    }
  }
  return 'applied';
}
