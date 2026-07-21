import { useEffect, type MutableRefObject } from 'react';
import { useFrpsExplainability } from './FrpsExplainabilityContext';
import { FrpsExplainabilityDrawer } from './FrpsExplainabilityDrawer';
import type { FrpsAnalysisListItemType } from '@v2/services/forms/form-questions-answers-analysis/frps-explainability';

export type FrpsExplainabilityApi = {
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

/** Expõe a API do contexto via ref (edit/remove handlers definidos fora do provider). */
export function FrpsExplainabilityBridge({
  apiRef,
}: {
  apiRef: MutableRefObject<FrpsExplainabilityApi | null>;
}) {
  const { invalidateByAnalysisId, invalidateItem, notifyItemRemoved } =
    useFrpsExplainability();

  useEffect(() => {
    apiRef.current = {
      invalidateByAnalysisId,
      invalidateItem,
      notifyItemRemoved,
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, invalidateByAnalysisId, invalidateItem, notifyItemRemoved]);

  return <FrpsExplainabilityDrawer />;
}
