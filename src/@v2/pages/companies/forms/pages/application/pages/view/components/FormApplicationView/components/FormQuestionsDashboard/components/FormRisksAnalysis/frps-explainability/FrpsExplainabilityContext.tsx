import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  useMutateGenerateFrpsContextualExplanation,
  useMutateGenerateFrpsItemExplanation,
  useMutatePatchConceptualExplanation,
  useMutatePatchContextualExplanation,
  useMutateReadFrpsItemExplanation,
  useMutateRejectConceptualExplanation,
  useMutateRejectContextualExplanation,
  useMutateValidateConceptualExplanation,
  useMutateValidateContextualExplanation,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability';
import type {
  FormAiConceptualExplanationContent,
  FormAiContextualExplanationContent,
  FrpsAnalysisListItemType,
  FrpsExplanationItemType,
  GenerateFrpsItemExplanationResponse,
  ReadFrpsItemExplanationResponse,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability';
import { FRPS_DEFAULT_CONCEPTUAL_MODEL_FOR_MASTER } from '../ai-model-options';
import { classifyFrpsExplainabilityError } from './frps-explainability-error.util';
import {
  buildFrpsExplainabilityCacheKey,
  buildFrpsExplainabilityCacheKeyPrefix,
  mapAnalysisListItemTypeToExplanationItemType,
} from './frps-explainability.utils';
import { isCompatibleFrpsAvailablePayload } from './frps-explainability-safe-content.util';

export type FrpsExplainabilityTarget = {
  analysisId: string;
  listItemType: FrpsAnalysisListItemType;
  itemType: FrpsExplanationItemType;
  itemName: string;
  itemKey?: string | null;
  riskFactorName?: string | null;
};

export type FrpsExplainabilityPhase =
  | 'idle'
  | 'loading_read'
  | 'unavailable'
  | 'awaiting_master_generate'
  | 'awaiting_contextual_generate'
  | 'loading_generate'
  | 'ready'
  | 'editing'
  | 'saving'
  | 'error';

type AvailablePayload = Extract<
  ReadFrpsItemExplanationResponse,
  { available: true }
>;

type FrpsExplainabilityContextValue = {
  open: boolean;
  target: FrpsExplainabilityTarget | null;
  data: AvailablePayload | GenerateFrpsItemExplanationResponse | null;
  isLoading: boolean;
  phase: FrpsExplainabilityPhase;
  errorMessage: string | null;
  unavailableReason: string | null;
  isMaster: boolean;
  selectedConceptualModel: string;
  setSelectedConceptualModel: (model: string) => void;
  isEditing: boolean;
  draftConceptual: FormAiConceptualExplanationContent | null;
  draftContextual: FormAiContextualExplanationContent | null;
  setDraftConceptual: (content: FormAiConceptualExplanationContent) => void;
  setDraftContextual: (content: FormAiContextualExplanationContent) => void;
  openExplainItem: (params: {
    analysisId: string;
    listItemType: FrpsAnalysisListItemType;
    itemName: string;
    itemKey?: string | null;
    riskFactorName?: string | null;
  }) => void;
  confirmGenerate: () => void;
  confirmGenerateContextual: () => void;
  startEditing: () => void;
  cancelEditing: () => void;
  saveDraft: () => Promise<void>;
  saveAndValidate: () => Promise<void>;
  validateContent: () => Promise<void>;
  rejectContent: () => Promise<void>;
  closeExplainItem: () => void;
  retryExplainItem: () => void;
  invalidateByAnalysisId: (analysisId: string) => void;
  invalidateItem: (params: {
    analysisId: string;
    listItemType: FrpsAnalysisListItemType;
    itemName: string;
    itemKey?: string | null;
  }) => void;
  notifyItemRemoved: (params: {
    analysisId: string;
    listItemType: FrpsAnalysisListItemType;
    itemName: string;
    itemKey?: string | null;
  }) => void;
};

const FrpsExplainabilityContext =
  createContext<FrpsExplainabilityContextValue | null>(null);

type ProviderProps = {
  companyId: string;
  applicationId: string;
  isMaster?: boolean;
  children: ReactNode;
};

function toAvailableShape(
  response: GenerateFrpsItemExplanationResponse,
): AvailablePayload {
  return { available: true, ...response };
}

export function FrpsExplainabilityProvider({
  companyId,
  applicationId,
  isMaster = false,
  children,
}: ProviderProps) {
  const readMutation = useMutateReadFrpsItemExplanation();
  const generateMutation = useMutateGenerateFrpsItemExplanation();
  const generateContextualMutation = useMutateGenerateFrpsContextualExplanation();
  const patchConceptual = useMutatePatchConceptualExplanation();
  const patchContextual = useMutatePatchContextualExplanation();
  const validateConceptual = useMutateValidateConceptualExplanation();
  const validateContextual = useMutateValidateContextualExplanation();
  const rejectConceptual = useMutateRejectConceptualExplanation();
  const rejectContextual = useMutateRejectContextualExplanation();

  const cacheRef = useRef<Map<string, AvailablePayload>>(new Map());
  const inFlightKeyRef = useRef<string | null>(null);

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<FrpsExplainabilityTarget | null>(null);
  const [data, setData] = useState<AvailablePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<FrpsExplainabilityPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(
    null,
  );
  const [selectedConceptualModel, setSelectedConceptualModel] = useState(
    FRPS_DEFAULT_CONCEPTUAL_MODEL_FOR_MASTER,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draftConceptual, setDraftConceptual] =
    useState<FormAiConceptualExplanationContent | null>(null);
  const [draftContextual, setDraftContextual] =
    useState<FormAiContextualExplanationContent | null>(null);

  const resolveCacheKey = useCallback(
    (params: {
      analysisId: string;
      itemType: FrpsExplanationItemType;
      itemName: string;
      itemKey?: string | null;
      response?: AvailablePayload | null;
    }) => {
      const responseKey =
        (params.response?.contextual &&
          'itemKey' in params.response.contextual &&
          params.response.contextual.itemKey) ||
        params.response?.conceptual.itemKey;
      return buildFrpsExplainabilityCacheKey({
        companyId,
        applicationId,
        analysisId: params.analysisId,
        itemType: params.itemType,
        // Só usa itemKey da resposta da mesma análise; evita chave stale entre análises.
        itemKey: params.itemKey || responseKey,
        itemName: params.itemName,
      });
    },
    [applicationId, companyId],
  );

  useEffect(() => {
    cacheRef.current.clear();
    inFlightKeyRef.current = null;
  }, [companyId, applicationId]);

  const fetchRead = useCallback(
    async (nextTarget: FrpsExplainabilityTarget, cacheKey: string) => {
      if (inFlightKeyRef.current === cacheKey) return;

      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        if (!isCompatibleFrpsAvailablePayload(cached)) {
          cacheRef.current.delete(cacheKey);
        } else {
          const conceptualOk =
            isMaster || cached.conceptual.validationStatus === 'VALIDATED';
          const contextualOk =
            cached.contextual.protectedData === true ||
            cached.contextual.validationStatus === 'DRAFT_AI' ||
            cached.contextual.validationStatus === 'VALIDATED';
          if (conceptualOk && contextualOk) {
            setData(cached);
            setUnavailableReason(null);
            setIsLoading(false);
            setErrorMessage(null);
            setPhase('ready');
            return;
          }
          cacheRef.current.delete(cacheKey);
        }
      }

      inFlightKeyRef.current = cacheKey;
      setIsLoading(true);
      setErrorMessage(null);
      setUnavailableReason(null);
      setData(null);
      setIsEditing(false);
      setPhase('loading_read');

      try {
        const response = await readMutation.mutateAsync({
          companyId,
          applicationId,
          analysisId: nextTarget.analysisId,
          itemType: nextTarget.itemType,
          itemName: nextTarget.itemName,
          // itemKey só quando já veio desta mesma análise; itemName é a identidade segura.
          ...(nextTarget.itemKey ? { itemKey: nextTarget.itemKey } : {}),
        });

        if (!response.available) {
          if (response.reason === 'ITEM_NOT_FOUND') {
            setUnavailableReason(response.reason);
            setData(null);
            setErrorMessage(
              'O item não foi encontrado nesta análise. Atualize a tela e tente novamente.',
            );
            setPhase('error');
            return;
          }

          setUnavailableReason(response.reason);
          if (response.conceptual) {
            setData({
              available: true,
              conceptual: response.conceptual,
              contextual: {
                protectedData: true,
                itemType: response.conceptual.itemType,
                itemKey: response.conceptual.itemKey,
                label: 'pending-contextual',
              },
            });
          } else {
            setData(null);
          }

          if (
            response.reason === 'CONTEXTUAL_NOT_GENERATED' &&
            response.canGenerateContextual
          ) {
            setPhase('awaiting_contextual_generate');
            return;
          }

          if (
            isMaster &&
            (response.reason === 'CONCEPTUAL_NOT_GENERATED' ||
              response.canGenerateConceptual)
          ) {
            setPhase('awaiting_master_generate');
            return;
          }

          setPhase('unavailable');
          return;
        }

        if (!isCompatibleFrpsAvailablePayload(response)) {
          setErrorMessage(
            'A resposta da explicação técnica veio em formato inesperado. Atualize a tela e tente novamente.',
          );
          setData(null);
          setPhase('error');
          return;
        }

        const stableKey = resolveCacheKey({
          analysisId: nextTarget.analysisId,
          itemType: nextTarget.itemType,
          itemName: nextTarget.itemName,
          itemKey: nextTarget.itemKey,
          response,
        });
        cacheRef.current.set(stableKey, response);
        if (stableKey !== cacheKey) cacheRef.current.set(cacheKey, response);

        setTarget((current) =>
          current
            ? {
                ...current,
                itemKey:
                  response.contextual.itemKey ||
                  response.conceptual.itemKey ||
                  current.itemKey,
              }
            : current,
        );
        setData(response);
        setPhase('ready');
      } catch (error) {
        const classified = classifyFrpsExplainabilityError(error);
        setErrorMessage(classified.message);
        setData(null);
        setPhase('error');
      } finally {
        if (inFlightKeyRef.current === cacheKey) inFlightKeyRef.current = null;
        setIsLoading(false);
      }
    },
    [applicationId, companyId, isMaster, readMutation, resolveCacheKey],
  );

  const openExplainItem = useCallback(
    (params: {
      analysisId: string;
      listItemType: FrpsAnalysisListItemType;
      itemName: string;
      itemKey?: string | null;
      riskFactorName?: string | null;
    }) => {
      const itemType = mapAnalysisListItemTypeToExplanationItemType(
        params.listItemType,
      );
      const nextTarget: FrpsExplainabilityTarget = {
        analysisId: params.analysisId,
        listItemType: params.listItemType,
        itemType,
        itemName: params.itemName,
        itemKey: params.itemKey,
        riskFactorName: params.riskFactorName,
      };
      const cacheKey = resolveCacheKey({
        analysisId: params.analysisId,
        itemType,
        itemName: params.itemName,
        itemKey: params.itemKey,
      });

      setOpen(true);
      setTarget(nextTarget);
      setErrorMessage(null);
      setIsEditing(false);
      void fetchRead(nextTarget, cacheKey);
    },
    [fetchRead, resolveCacheKey],
  );

  const confirmGenerate = useCallback(async () => {
    if (!target || isLoading || !isMaster) return;
    const cacheKey = resolveCacheKey({
      analysisId: target.analysisId,
      itemType: target.itemType,
      itemName: target.itemName,
      itemKey: target.itemKey,
    });
    if (inFlightKeyRef.current === cacheKey) return;

    inFlightKeyRef.current = cacheKey;
    setIsLoading(true);
    setPhase('loading_generate');
    setErrorMessage(null);

    try {
      const response = await generateMutation.mutateAsync({
        companyId,
        applicationId,
        analysisId: target.analysisId,
        itemType: target.itemType,
        itemName: target.itemName,
        ...(target.itemKey ? { itemKey: target.itemKey } : {}),
        conceptualModel: selectedConceptualModel,
      });
      const available = toAvailableShape(response);
      if (!isCompatibleFrpsAvailablePayload(available)) {
        setErrorMessage(
          'A resposta da explicação técnica veio em formato inesperado. Atualize a tela e tente novamente.',
        );
        setPhase('error');
        return;
      }
      const stableKey = resolveCacheKey({
        analysisId: target.analysisId,
        itemType: target.itemType,
        itemName: target.itemName,
        itemKey: target.itemKey,
        response: available,
      });
      cacheRef.current.set(stableKey, available);
      cacheRef.current.set(cacheKey, available);
      setData(available);
      setUnavailableReason(null);
      setPhase('ready');
    } catch (error) {
      const classified = classifyFrpsExplainabilityError(error);
      setErrorMessage(classified.message);
      setPhase('error');
    } finally {
      if (inFlightKeyRef.current === cacheKey) inFlightKeyRef.current = null;
      setIsLoading(false);
    }
  }, [
    applicationId,
    companyId,
    generateMutation,
    isLoading,
    isMaster,
    resolveCacheKey,
    selectedConceptualModel,
    target,
  ]);

  const confirmGenerateContextual = useCallback(async () => {
    if (!target || isLoading) return;
    const cacheKey = resolveCacheKey({
      analysisId: target.analysisId,
      itemType: target.itemType,
      itemName: target.itemName,
      itemKey: target.itemKey,
    });
    if (inFlightKeyRef.current === cacheKey) return;

    inFlightKeyRef.current = cacheKey;
    setIsLoading(true);
    setPhase('loading_generate');
    setErrorMessage(null);

    try {
      const conceptualStatus = data?.conceptual.validationStatus;
      const useCombinedForMasterDraft =
        isMaster && conceptualStatus === 'DRAFT_AI';

      const response = useCombinedForMasterDraft
        ? await generateMutation.mutateAsync({
            companyId,
            applicationId,
            analysisId: target.analysisId,
            itemType: target.itemType,
            itemName: target.itemName,
            ...(target.itemKey ? { itemKey: target.itemKey } : {}),
          })
        : await generateContextualMutation.mutateAsync({
            companyId,
            applicationId,
            analysisId: target.analysisId,
            itemType: target.itemType,
            itemName: target.itemName,
            ...(target.itemKey ? { itemKey: target.itemKey } : {}),
          });
      const available = toAvailableShape(response);
      if (!isCompatibleFrpsAvailablePayload(available)) {
        setErrorMessage(
          'A resposta da explicação técnica veio em formato inesperado. Atualize a tela e tente novamente.',
        );
        setPhase('error');
        return;
      }
      const stableKey = resolveCacheKey({
        analysisId: target.analysisId,
        itemType: target.itemType,
        itemName: target.itemName,
        itemKey: target.itemKey,
        response: available,
      });
      cacheRef.current.set(stableKey, available);
      cacheRef.current.set(cacheKey, available);
      setData(available);
      setUnavailableReason(null);
      setPhase('ready');
    } catch (error) {
      const classified = classifyFrpsExplainabilityError(error);
      setErrorMessage(classified.message);
      setPhase('error');
    } finally {
      if (inFlightKeyRef.current === cacheKey) inFlightKeyRef.current = null;
      setIsLoading(false);
    }
  }, [
    applicationId,
    companyId,
    data?.conceptual.validationStatus,
    generateContextualMutation,
    generateMutation,
    isLoading,
    isMaster,
    resolveCacheKey,
    target,
  ]);

  const startEditing = useCallback(() => {
    if (!data || !isMaster) return;
    if (data.contextual.protectedData) return;
    setDraftConceptual({ ...(data.conceptual.content || {}) });
    setDraftContextual({ ...(data.contextual.content || {}) });
    setIsEditing(true);
    setPhase('editing');
  }, [data, isMaster]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setDraftConceptual(null);
    setDraftContextual(null);
    setPhase(data ? 'ready' : 'idle');
  }, [data]);

  const persistEdits = useCallback(
    async (andValidate: boolean) => {
      if (!data || !draftConceptual || !draftContextual || !isMaster) return;
      if (data.contextual.protectedData) return;

      setPhase('saving');
      setIsLoading(true);
      setErrorMessage(null);
      try {
        await patchConceptual.mutateAsync({
          id: data.conceptual.id,
          content: draftConceptual as Record<string, unknown>,
          asDraft: !andValidate,
        });
        await patchContextual.mutateAsync({
          id: data.contextual.id,
          content: draftContextual as Record<string, unknown>,
          asDraft: !andValidate,
        });
        if (andValidate) {
          await validateConceptual.mutateAsync(data.conceptual.id);
          await validateContextual.mutateAsync(data.contextual.id);
        }

        // Recarrega via GET para refletir status/auditoria.
        if (target) {
          const cacheKey = resolveCacheKey({
            analysisId: target.analysisId,
            itemType: target.itemType,
            itemName: target.itemName,
            itemKey: target.itemKey,
          });
          cacheRef.current.delete(cacheKey);
          setIsEditing(false);
          setDraftConceptual(null);
          setDraftContextual(null);
          await fetchRead(target, cacheKey);
        }
      } catch (error) {
        const classified = classifyFrpsExplainabilityError(error);
        setErrorMessage(classified.message);
        setPhase('editing');
      } finally {
        setIsLoading(false);
      }
    },
    [
      data,
      draftConceptual,
      draftContextual,
      fetchRead,
      isMaster,
      patchConceptual,
      patchContextual,
      resolveCacheKey,
      target,
      validateConceptual,
      validateContextual,
    ],
  );

  const saveDraft = useCallback(
    () => persistEdits(false),
    [persistEdits],
  );

  const saveAndValidate = useCallback(
    () => persistEdits(true),
    [persistEdits],
  );

  const validateContent = useCallback(async () => {
    if (!data || !isMaster) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await validateConceptual.mutateAsync(data.conceptual.id);
      if (!data.contextual.protectedData) {
        await validateContextual.mutateAsync(data.contextual.id);
      }
      if (target) {
        const cacheKey = resolveCacheKey({
          analysisId: target.analysisId,
          itemType: target.itemType,
          itemName: target.itemName,
          itemKey: target.itemKey,
        });
        cacheRef.current.delete(cacheKey);
        await fetchRead(target, cacheKey);
      }
    } catch (error) {
      const classified = classifyFrpsExplainabilityError(error);
      setErrorMessage(classified.message);
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  }, [
    data,
    fetchRead,
    isMaster,
    resolveCacheKey,
    target,
    validateConceptual,
    validateContextual,
  ]);

  const rejectContent = useCallback(async () => {
    if (!data || !isMaster) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await rejectConceptual.mutateAsync(data.conceptual.id);
      if (!data.contextual.protectedData) {
        await rejectContextual.mutateAsync(data.contextual.id);
      }
      setData(null);
      if (target) {
        const cacheKey = resolveCacheKey({
          analysisId: target.analysisId,
          itemType: target.itemType,
          itemName: target.itemName,
          itemKey: target.itemKey,
        });
        cacheRef.current.delete(cacheKey);
      }
      setPhase(isMaster ? 'awaiting_master_generate' : 'unavailable');
      setUnavailableReason(isMaster ? 'NOT_GENERATED' : 'NOT_AVAILABLE_FOR_USER');
    } catch (error) {
      const classified = classifyFrpsExplainabilityError(error);
      setErrorMessage(classified.message);
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  }, [
    data,
    isMaster,
    rejectConceptual,
    rejectContextual,
    resolveCacheKey,
    target,
  ]);

  const closeExplainItem = useCallback(() => {
    if (isLoading) return;
    setOpen(false);
    setIsEditing(false);
    setPhase((current) => (current === 'ready' ? current : 'idle'));
  }, [isLoading]);

  const retryExplainItem = useCallback(() => {
    if (!target || isLoading) return;
    const cacheKey = resolveCacheKey({
      analysisId: target.analysisId,
      itemType: target.itemType,
      itemName: target.itemName,
      itemKey: target.itemKey,
    });
    cacheRef.current.delete(cacheKey);
    void fetchRead(target, cacheKey);
  }, [fetchRead, isLoading, resolveCacheKey, target]);

  const invalidateByAnalysisId = useCallback(
    (analysisId: string) => {
      const prefix = buildFrpsExplainabilityCacheKeyPrefix({
        companyId,
        applicationId,
        analysisId,
      });
      for (const key of Array.from(cacheRef.current.keys())) {
        if (key.startsWith(prefix)) cacheRef.current.delete(key);
      }
    },
    [applicationId, companyId],
  );

  const invalidateItem = useCallback(
    (params: {
      analysisId: string;
      listItemType: FrpsAnalysisListItemType;
      itemName: string;
      itemKey?: string | null;
    }) => {
      const itemType = mapAnalysisListItemTypeToExplanationItemType(
        params.listItemType,
      );
      cacheRef.current.delete(
        resolveCacheKey({
          analysisId: params.analysisId,
          itemType,
          itemName: params.itemName,
          itemKey: params.itemKey,
        }),
      );
    },
    [resolveCacheKey],
  );

  const notifyItemRemoved = useCallback(
    (params: {
      analysisId: string;
      listItemType: FrpsAnalysisListItemType;
      itemName: string;
      itemKey?: string | null;
    }) => {
      invalidateItem(params);
      if (
        target &&
        target.analysisId === params.analysisId &&
        target.listItemType === params.listItemType &&
        (target.itemKey
          ? target.itemKey === params.itemKey
          : target.itemName === params.itemName)
      ) {
        setOpen(false);
        setTarget(null);
        setData(null);
        setErrorMessage(null);
        setPhase('idle');
      }
    },
    [invalidateItem, target],
  );

  const value = useMemo<FrpsExplainabilityContextValue>(
    () => ({
      open,
      target,
      data,
      isLoading,
      phase,
      errorMessage,
      unavailableReason,
      isMaster,
      selectedConceptualModel,
      setSelectedConceptualModel,
      isEditing,
      draftConceptual,
      draftContextual,
      setDraftConceptual,
      setDraftContextual,
      openExplainItem,
      confirmGenerate,
      confirmGenerateContextual,
      startEditing,
      cancelEditing,
      saveDraft,
      saveAndValidate,
      validateContent,
      rejectContent,
      closeExplainItem,
      retryExplainItem,
      invalidateByAnalysisId,
      invalidateItem,
      notifyItemRemoved,
    }),
    [
      open,
      target,
      data,
      isLoading,
      phase,
      errorMessage,
      unavailableReason,
      isMaster,
      selectedConceptualModel,
      isEditing,
      draftConceptual,
      draftContextual,
      openExplainItem,
      confirmGenerate,
      confirmGenerateContextual,
      startEditing,
      cancelEditing,
      saveDraft,
      saveAndValidate,
      validateContent,
      rejectContent,
      closeExplainItem,
      retryExplainItem,
      invalidateByAnalysisId,
      invalidateItem,
      notifyItemRemoved,
    ],
  );

  return (
    <FrpsExplainabilityContext.Provider value={value}>
      {children}
    </FrpsExplainabilityContext.Provider>
  );
}

export function useFrpsExplainability() {
  const context = useContext(FrpsExplainabilityContext);
  if (!context) {
    throw new Error(
      'useFrpsExplainability must be used within FrpsExplainabilityProvider',
    );
  }
  return context;
}

export function useFrpsExplainabilityOptional() {
  return useContext(FrpsExplainabilityContext);
}
