import type { AnalysisItemInventoryEntry } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse.model';
import type { IFormQuestionsAnswersAnalysisBrowseResultModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import type { IRiskData } from 'core/interfaces/api/IRiskData';

import {
  buildRiskDataInventoryNameSetsForRisk,
  riskDataInventoryHasItemName,
} from './buildRiskDataInventoryNameSets';
import { normalizeInventoryItemName } from './normalizeInventoryItemName';

export type TargetAnalysisItemType =
  | 'fontesGeradoras'
  | 'medidasEngenhariaRecomendadas'
  | 'medidasAdministrativasRecomendadas';

function getAnalysisItemsByType(
  analysis: IFormQuestionsAnswersAnalysisBrowseResultModel['analysis'],
  itemType: TargetAnalysisItemType,
): Array<{ nome: string; justificativa?: string }> {
  if (!analysis) return [];

  switch (itemType) {
    case 'fontesGeradoras':
      return analysis.fontesGeradoras ?? [];
    case 'medidasEngenhariaRecomendadas':
      return analysis.medidasEngenhariaRecomendadas ?? [];
    case 'medidasAdministrativasRecomendadas':
      return analysis.medidasAdministrativasRecomendadas ?? [];
  }
}

function readItemStatusEntry(
  status:
    | {
        fontesGeradoras?: AnalysisItemInventoryEntry[];
        medidasEngenhariaRecomendadas?: AnalysisItemInventoryEntry[];
        medidasAdministrativasRecomendadas?: AnalysisItemInventoryEntry[];
      }
    | undefined,
  itemType: TargetAnalysisItemType,
  itemIndex: number,
): AnalysisItemInventoryEntry | undefined {
  const entry = status?.[itemType]?.[itemIndex];
  if (entry == null || typeof entry !== 'object') return undefined;
  if (
    typeof entry.existsInInventory !== 'boolean' ||
    typeof entry.existsInCatalog !== 'boolean'
  ) {
    return undefined;
  }
  return entry;
}

function resolveOwnAnalysisItemStatusByName(params: {
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[];
  analysisInventoryStatus: Record<
    string,
    {
      fontesGeradoras?: AnalysisItemInventoryEntry[];
      medidasEngenhariaRecomendadas?: AnalysisItemInventoryEntry[];
      medidasAdministrativasRecomendadas?: AnalysisItemInventoryEntry[];
    }
  >;
  riskId: string;
  targetHierarchyId: string;
  itemType: TargetAnalysisItemType;
  itemName: string;
}): AnalysisItemInventoryEntry | undefined {
  const ownAnalysis = params.results.find(
    (item) =>
      item.riskId === params.riskId &&
      item.hierarchyId === params.targetHierarchyId,
  );
  if (!ownAnalysis) return undefined;

  const ownItems = getAnalysisItemsByType(ownAnalysis.analysis, params.itemType);
  const normalizedTargetName = normalizeInventoryItemName(params.itemName);
  const ownIndex = ownItems.findIndex(
    (item) => normalizeInventoryItemName(item.nome) === normalizedTargetName,
  );
  if (ownIndex < 0) return undefined;

  return readItemStatusEntry(
    params.analysisInventoryStatus[ownAnalysis.id],
    params.itemType,
    ownIndex,
  );
}

export function buildLocalAppliedAnalysisItemKey(params: {
  riskId: string;
  targetHierarchyId: string;
  itemType: TargetAnalysisItemType;
  itemName: string;
}) {
  return `${params.riskId}:${params.targetHierarchyId}:${params.itemType}:${normalizeInventoryItemName(params.itemName)}`;
}

/**
 * Status operacional de um item de IA para o setor alvo (próprio ou herdado).
 * Nunca reutiliza existsInInventory do setor fonte.
 */
export function resolveTargetAnalysisItemStatus(params: {
  riskId: string;
  targetHierarchyId: string;
  itemType: TargetAnalysisItemType;
  itemName: string;
  itemIndex: number;
  sourceAnalysisId: string;
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[];
  analysisInventoryStatus: Record<
    string,
    {
      fontesGeradoras?: AnalysisItemInventoryEntry[];
      medidasEngenhariaRecomendadas?: AnalysisItemInventoryEntry[];
      medidasAdministrativasRecomendadas?: AnalysisItemInventoryEntry[];
    }
  >;
  riskDataForHierarchy?: IRiskData[];
  locallyAppliedItemKeys?: Set<string>;
}): AnalysisItemInventoryEntry | undefined {
  const localKey = buildLocalAppliedAnalysisItemKey({
    riskId: params.riskId,
    targetHierarchyId: params.targetHierarchyId,
    itemType: params.itemType,
    itemName: params.itemName,
  });

  const sourceCatalogStatus = readItemStatusEntry(
    params.analysisInventoryStatus[params.sourceAnalysisId],
    params.itemType,
    params.itemIndex,
  );

  if (params.locallyAppliedItemKeys?.has(localKey)) {
    return {
      existsInInventory: true,
      existsInCatalog: sourceCatalogStatus?.existsInCatalog ?? false,
    };
  }

  const normalizedName = normalizeInventoryItemName(params.itemName);
  if (normalizedName && params.riskDataForHierarchy?.length) {
    const inventorySets = buildRiskDataInventoryNameSetsForRisk(
      params.riskDataForHierarchy,
      params.riskId,
    );
    const existsInInventory = riskDataInventoryHasItemName(
      inventorySets,
      params.itemType,
      params.itemName,
    );

    return {
      existsInInventory,
      existsInCatalog: sourceCatalogStatus?.existsInCatalog ?? false,
    };
  }

  const ownStatus = resolveOwnAnalysisItemStatusByName({
    results: params.results,
    analysisInventoryStatus: params.analysisInventoryStatus,
    riskId: params.riskId,
    targetHierarchyId: params.targetHierarchyId,
    itemType: params.itemType,
    itemName: params.itemName,
  });
  if (ownStatus) return ownStatus;

  if (sourceCatalogStatus) {
    return {
      existsInInventory: false,
      existsInCatalog: sourceCatalogStatus.existsInCatalog,
    };
  }

  return undefined;
}

export function countPendingTargetAnalysisItems(params: {
  analysisContent: {
    fontesGeradoras?: Array<{ nome: string }>;
    medidasEngenhariaRecomendadas?: Array<{ nome: string }>;
    medidasAdministrativasRecomendadas?: Array<{ nome: string }>;
  };
  riskId: string;
  targetHierarchyId: string;
  sourceAnalysisId: string;
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[];
  analysisInventoryStatus: Record<
    string,
    {
      fontesGeradoras?: AnalysisItemInventoryEntry[];
      medidasEngenhariaRecomendadas?: AnalysisItemInventoryEntry[];
      medidasAdministrativasRecomendadas?: AnalysisItemInventoryEntry[];
    }
  >;
  riskDataForHierarchy?: IRiskData[];
  locallyAppliedItemKeys?: Set<string>;
}): number {
  let pending = 0;

  const countInArray = (
    items: Array<{ nome: string }> | undefined,
    itemType: TargetAnalysisItemType,
  ) => {
    items?.forEach((item, index) => {
      const status = resolveTargetAnalysisItemStatus({
        riskId: params.riskId,
        targetHierarchyId: params.targetHierarchyId,
        itemType,
        itemName: item.nome,
        itemIndex: index,
        sourceAnalysisId: params.sourceAnalysisId,
        results: params.results,
        analysisInventoryStatus: params.analysisInventoryStatus,
        riskDataForHierarchy: params.riskDataForHierarchy,
        locallyAppliedItemKeys: params.locallyAppliedItemKeys,
      });
      if (status?.existsInInventory !== true) pending += 1;
    });
  };

  countInArray(params.analysisContent.fontesGeradoras, 'fontesGeradoras');
  countInArray(
    params.analysisContent.medidasEngenhariaRecomendadas,
    'medidasEngenhariaRecomendadas',
  );
  countInArray(
    params.analysisContent.medidasAdministrativasRecomendadas,
    'medidasAdministrativasRecomendadas',
  );

  return pending;
}
