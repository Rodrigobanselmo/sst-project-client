import type { RiskByOccurrenceAiAdapter } from './by-risk-occurrence/risk-by-occurrence-ai-adapter.types';
import type { AiRiskOccurrenceIdentity } from './by-risk-occurrence/ai-risk-occurrence.identity';
import { useCallback, useMemo, useRef, useState, useLayoutEffect } from 'react';

import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { updateExistingControlSuggestion } from '@v2/services/security/characterization/characterization/existing-control-suggestion/service/existing-control-suggestion.service';
import { useModalState, ModalKeyEnum } from '@v2/hooks/useModal';
import { useSnackbar } from 'notistack';

import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';

import { existenceConfirmationCopy } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/suggestion-apply-plan.util';
import { CharacterizationAiRiskAnalysisState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';

import type { RiskLinkageAiOccurrence } from './risk-linkage-ai-context.util';
import { acceptPendingAiSuggestion } from './accept-pending-ai-suggestion.util';
import {
  existingControlApiField,
  pendingSuggestionsForColumn,
  RiskFactorAiColumn,
  RiskFactorAiPendingRiskData,
  RiskFactorAiPendingSuggestion,
} from './risk-factor-ai-pending.util';

export type RiskFactorAiRowRiskData = RiskFactorAiPendingRiskData &
  Partial<RiskLinkageAiOccurrence> & {
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
  resolvedKeys?: ReadonlySet<string>;
  pendingFor: (params: {
    riskId?: string;
    column: RiskFactorAiColumn;
    riskData?: RiskFactorAiRowRiskData | null;
  }) => RiskFactorAiPendingSuggestion[];
  accept: (params: {
    suggestion: RiskFactorAiPendingSuggestion;
    riskData: RiskFactorAiRowRiskData;
    handleSelect: (
      values: Partial<IUpsertRiskData>,
      context?: { occurrence: AiRiskOccurrenceIdentity },
    ) => Promise<void> | void;
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
  validateOccurrence?: (row: RiskFactorAiRowRiskData) => boolean;
  byRiskOccurrence?: RiskByOccurrenceAiAdapter;
}): RiskFactorAiSuggestionActions {
  const {
    analysis,
    companyId,
    apiWorkspaceId,
    riskGroupId,
    entityId,
    validateOccurrence,
    byRiskOccurrence,
  } = params;
  const { showConfirmation: showConfirmationModal } = useConfirmationModal();
  const pendingConfirmation = useRef<{ cancel: () => void } | null>(null);
  useLayoutEffect(
    () => () => {
      pendingConfirmation.current?.cancel();
      pendingConfirmation.current = null;
    },
    [],
  );
  const showConfirmation = useCallback(
    async (options: Parameters<typeof showConfirmationModal>[0]) => {
      const result = showConfirmationModal(options);
      if (!validateOccurrence) return result;
      const state = useModalState.getState();
      const modal = state.modals[state.modals.length - 1];
      if (modal?.key !== ModalKeyEnum.CONFIRMATION_MODAL) return result;
      const owned = {
        cancel: () => {
          const current = useModalState.getState();
          const onCancel = (
            modal.content as { props?: { onCancel?: () => void } }
          )?.props?.onCancel;
          onCancel?.();
          current.setModals(current.modals.filter((item) => item !== modal));
        },
      };
      pendingConfirmation.current = owned;
      try {
        return await result;
      } finally {
        if (pendingConfirmation.current === owned)
          pendingConfirmation.current = null;
      }
    },
    [showConfirmationModal, validateOccurrence],
  );
  useLayoutEffect(
    () =>
      byRiskOccurrence?.subscribeInactive(() => {
        pendingConfirmation.current?.cancel();
        pendingConfirmation.current = null;
      }),
    [byRiskOccurrence],
  );
  const { enqueueSnackbar } = useSnackbar();
  const { workspaceId: headerWorkspaceId } = useTabWorkspaceId();
  const { refetch } = useQueryRiskDataByGho(riskGroupId || '', entityId, {
    enabled: !byRiskOccurrence,
  });
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
      if (!field || !riskFactorDataId || !apiWorkspaceId)
        return Promise.resolve();
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
      if (
        byRiskOccurrence &&
        column === 'probability' &&
        (!riskData || !byRiskOccurrence.canApproveProbability(riskData))
      )
        return [];
      if (validateOccurrence && !validateOccurrence(riskData)) return [];
      return pendingSuggestionsForColumn({
        reviews: validateOccurrence
          ? existingRiskReviews.filter(
              (review) => review.riskFactorDataId === riskData.id,
            )
          : existingRiskReviews,
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
      validateOccurrence,
      byRiskOccurrence,
    ],
  );

  const accept: RiskFactorAiSuggestionActions['accept'] = useCallback(
    async ({ suggestion, riskData, handleSelect }) => {
      if (!riskGroupId || !belongsToEntity(riskData, entityId)) return;
      const acceptance = byRiskOccurrence?.prepareAcceptance(
        suggestion,
        riskData,
      );
      if (byRiskOccurrence && !acceptance) return;
      const isActive = () =>
        (!acceptance || acceptance.isActive()) &&
        (!validateOccurrence ||
          (validateOccurrence(riskData) &&
            suggestion.riskFactorDataId === riskData.id &&
            suggestion.riskId === riskData.riskId));
      if (!isActive()) return;
      if (applyingLock.current) return;
      applyingLock.current = suggestion.key;
      setApplyingKey(suggestion.key);

      try {
        if (suggestion.action === 'approve-probability') {
          const currentProbability =
            typeof riskData.probability === 'number'
              ? riskData.probability
              : 'não informada';
          const confirmed = await showConfirmation({
            title: 'Aprovar probabilidade sugerida?',
            message: `A probabilidade efetiva atual (${currentProbability}) permanece intacta até você confirmar. Ao aprovar, ela será substituída pela sugerida (${suggestion.value}). A probabilidade residual e demais campos não são alterados por esta ação.`,
            confirmText: 'Aprovar probabilidade',
            cancelText: 'Cancelar',
            variant: 'warning',
          });
          if (!confirmed) return;
        }

        const result = await acceptPendingAiSuggestion({
          isActive,
          beforeWrite: acceptance?.beforeWrite,
          suggestion,
          riskData,
          companyId,
          headerWorkspaceId,
          confirmExistence: (value) =>
            showConfirmation(existenceConfirmationCopy(value)),
          write: (payload) =>
            byRiskOccurrence
              ? handleSelect(payload, { occurrence: byRiskOccurrence.identity })
              : handleSelect(payload),
          readSavedRow: async () => {
            if (byRiskOccurrence) return byRiskOccurrence.readSavedRow();
            const refreshed = await refetch();
            const rows = refreshed.data || [];
            return (
              rows.find((row) => row.id === riskData.id) ||
              (!validateOccurrence
                ? rows.find((row) => row.riskId === suggestion.riskId)
                : undefined)
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
      validateOccurrence,
      byRiskOccurrence,
    ],
  );

  const dismiss: RiskFactorAiSuggestionActions['dismiss'] = useCallback(
    ({ suggestion, riskData }) => {
      if (
        validateOccurrence &&
        (!riskData ||
          !validateOccurrence(riskData) ||
          suggestion.riskFactorDataId !== riskData.id ||
          suggestion.riskId !== riskData.riskId)
      )
        return;
      if (applyingLock.current === suggestion.key) return;
      dismissModularSuggestion(suggestion.key);
      void logExistingControl('dismiss', suggestion, riskData).catch(
        () => undefined,
      );
    },
    [dismissModularSuggestion, logExistingControl, validateOccurrence],
  );

  return useMemo(
    () => ({
      applyingKey, pendingFor, accept, dismiss,
      resolvedKeys: new Set([
        ...appliedModularSuggestionKeysSet,
        ...dismissedModularSuggestionKeysSet,
      ]),
    }),
    [accept, applyingKey, dismiss, pendingFor,
      appliedModularSuggestionKeysSet, dismissedModularSuggestionKeysSet],
  );
}
