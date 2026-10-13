import { useCallback, useMemo, useRef, useState } from 'react';

import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { updateExistingControlSuggestion } from '@v2/services/security/characterization/characterization/existing-control-suggestion/service/existing-control-suggestion.service';
import { useSnackbar } from 'notistack';

import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';

import { existenceConfirmationCopy } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/suggestion-apply-plan.util';
import { CharacterizationAiRiskAnalysisState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';

import { acceptPendingAiSuggestion } from './accept-pending-ai-suggestion.util';
import {
  existingControlApiField,
  pendingSuggestionsForColumn,
  RiskFactorAiColumn,
  RiskFactorAiPendingRiskData,
  RiskFactorAiPendingSuggestion,
} from './risk-factor-ai-pending.util';

export type RiskFactorAiRowRiskData = RiskFactorAiPendingRiskData & {
  id?: string;
  riskId?: string;
  homogeneousGroupId?: string;
};

const belongsToEntity = (
  riskData: RiskFactorAiRowRiskData | null | undefined,
  entityId: string,
): riskData is RiskFactorAiRowRiskData =>
  !!riskData?.id &&
  !!entityId &&
  (!riskData.homogeneousGroupId || riskData.homogeneousGroupId === entityId);

export type RiskFactorAiSuggestionActions = {
  applyingKey: string | null;
  pendingFor: (params: {
    riskId?: string;
    column: RiskFactorAiColumn;
    riskData?: RiskFactorAiRowRiskData | null;
  }) => RiskFactorAiPendingSuggestion[];
  accept: (params: {
    suggestion: RiskFactorAiPendingSuggestion;
    riskData: RiskFactorAiRowRiskData;
    handleSelect: (values: Partial<IUpsertRiskData>) => Promise<void> | void;
  }) => Promise<void>;
  dismiss: (params: {
    suggestion: RiskFactorAiPendingSuggestion;
    riskData?: RiskFactorAiRowRiskData | null;
  }) => void;
};

export function useRiskFactorAiSuggestionActions(params: {
  analysis: CharacterizationAiRiskAnalysisState;
  companyId: string;
  apiWorkspaceId?: string;
  riskGroupId?: string;
  entityId: string;
}): RiskFactorAiSuggestionActions {
  const { analysis, companyId, apiWorkspaceId, riskGroupId, entityId } = params;
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const { workspaceId: headerWorkspaceId } = useTabWorkspaceId();
  const { refetch } = useQueryRiskDataByGho(riskGroupId || '', entityId);
  const applyingLock = useRef<string | null>(null);
  const [applyingKey, setApplyingKey] = useState<string | null>(null);

  const {
    existingRiskReviews,
    appliedModularSuggestionKeysSet,
    dismissedModularSuggestionKeysSet,
    markModularSuggestionApplied,
    dismissModularSuggestion,
  } = analysis;

  const logExistingControl = useCallback(
    (
      action: 'confirm' | 'dismiss',
      suggestion: RiskFactorAiPendingSuggestion,
      riskData?: RiskFactorAiRowRiskData | null,
    ) => {
      const field = existingControlApiField(suggestion.field);
      const riskFactorDataId = suggestion.riskFactorDataId || riskData?.id;
      if (!field || !riskFactorDataId || !apiWorkspaceId) return Promise.resolve();
      return updateExistingControlSuggestion({
        companyId,
        workspaceId: apiWorkspaceId,
        riskFactorDataId,
        action,
        field,
        text: suggestion.value,
      }).then(() => undefined);
    },
    [apiWorkspaceId, companyId],
  );

  const pendingFor: RiskFactorAiSuggestionActions['pendingFor'] = useCallback(
    ({ riskId, column, riskData }) => {
      if (!riskId || !belongsToEntity(riskData, entityId)) return [];
      return pendingSuggestionsForColumn({
        reviews: existingRiskReviews,
        riskId,
        column,
        riskData,
        appliedKeys: appliedModularSuggestionKeysSet,
        dismissedKeys: dismissedModularSuggestionKeysSet,
      });
    },
    [
      appliedModularSuggestionKeysSet,
      dismissedModularSuggestionKeysSet,
      entityId,
      existingRiskReviews,
    ],
  );

  const accept: RiskFactorAiSuggestionActions['accept'] = useCallback(
    async ({ suggestion, riskData, handleSelect }) => {
      if (!riskGroupId || !belongsToEntity(riskData, entityId)) return;
      if (applyingLock.current) return;
      applyingLock.current = suggestion.key;
      setApplyingKey(suggestion.key);

      try {
        const result = await acceptPendingAiSuggestion({
          suggestion,
          riskData,
          companyId,
          headerWorkspaceId,
          confirmExistence: (value) =>
            showConfirmation(existenceConfirmationCopy(value)),
          write: handleSelect,
          readSavedRow: async () => {
            const refreshed = await refetch();
            const rows = refreshed.data || [];
            return (
              rows.find((row) => row.id === riskData.id) ||
              rows.find((row) => row.riskId === suggestion.riskId)
            );
          },
          markApplied: markModularSuggestionApplied,
          onExistenceConfirmed: () =>
            logExistingControl('confirm', suggestion, riskData),
        });

        if (result === 'failed') {
          enqueueSnackbar(
            'Não foi possível gravar a sugestão. Ela continua pendente para nova tentativa.',
            { variant: 'warning' },
          );
        }
      } finally {
        applyingLock.current = null;
        setApplyingKey(null);
      }
    },
    [
      companyId,
      enqueueSnackbar,
      entityId,
      headerWorkspaceId,
      logExistingControl,
      markModularSuggestionApplied,
      refetch,
      riskGroupId,
      showConfirmation,
    ],
  );

  const dismiss: RiskFactorAiSuggestionActions['dismiss'] = useCallback(
    ({ suggestion, riskData }) => {
      if (applyingLock.current === suggestion.key) return;
      dismissModularSuggestion(suggestion.key);
      void logExistingControl('dismiss', suggestion, riskData).catch(
        () => undefined,
      );
    },
    [dismissModularSuggestion, logExistingControl],
  );

  return useMemo(
    () => ({ applyingKey, pendingFor, accept, dismiss }),
    [accept, applyingKey, dismiss, pendingFor],
  );
}
