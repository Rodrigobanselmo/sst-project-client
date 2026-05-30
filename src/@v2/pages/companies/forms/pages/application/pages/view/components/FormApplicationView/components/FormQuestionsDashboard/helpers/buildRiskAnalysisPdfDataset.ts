import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { FormQuestionsAnswersAnalysisBrowseModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse.model';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import type { Result as RisksBrowseResult } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/service/browse-form-questions-answers-risks.service';

import type { ParticipantGroupForIndicators } from './buildParticipantGroupsForIndicators';
import {
  buildRiskAnalysisViewContext,
  groupEntityIdsByEstablishment,
  isFrpsRisk,
  sortRiskIdsForAnalysis,
} from './buildRiskAnalysisViewContext';
import { expandRiskAnalysisEntitiesForHierarchyGroups } from './expandRiskAnalysisEntitiesForHierarchyGroups';
import {
  resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback,
  type AiAnalysisResolutionSource,
} from './resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback';
import { buildSectorRiskClassificationPdf } from './riskAnalysisMatrixLabels';

export type RiskAnalysisPdfRecommendationItem = {
  nome: string;
  justificativa?: string;
};

export type RiskAnalysisPdfSector = {
  sectorTypeLabel: string;
  sectorName: string;
  classification: ReturnType<typeof buildSectorRiskClassificationPdf>;
  fontesGeradoras: RiskAnalysisPdfRecommendationItem[];
  medidasEngenharia: RiskAnalysisPdfRecommendationItem[];
  medidasAdministrativas: RiskAnalysisPdfRecommendationItem[];
  aiAnalysisSource?: Exclude<AiAnalysisResolutionSource, 'absent'>;
  sourceHierarchyId?: string;
  aiConfidencePercent?: number;
};

export type RiskAnalysisPdfEstablishmentBlock = {
  establishment: string;
  sectors: RiskAnalysisPdfSector[];
};

export type RiskAnalysisPdfFactor = {
  riskId: string;
  name: string;
  typeLabel: string;
  establishmentBlocks: RiskAnalysisPdfEstablishmentBlock[];
};

export type RiskAnalysisPdfDataset = {
  grouping:
    | { active: false }
    | { active: true; questionLabel: string };
  narrativeDiagnosticMarkdown?: string | null;
  factors: RiskAnalysisPdfFactor[];
};

function getRiskTypeLabel(risk: RisksBrowseResult['riskMap'][string]): string {
  return isFrpsRisk(risk) ? 'PSIC' : risk.type;
}

function mapAnalysisItems(
  items: Array<{ nome: string; justificativa?: string }> | undefined,
): RiskAnalysisPdfRecommendationItem[] {
  if (!items?.length) return [];
  return items.map((item) => ({
    nome: item.nome,
    ...(item.justificativa?.trim()
      ? { justificativa: item.justificativa.trim() }
      : {}),
  }));
}

export function buildRiskAnalysisPdfDataset(params: {
  risksData: RisksBrowseResult;
  analysisData: FormQuestionsAnswersAnalysisBrowseModel | null;
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel | null | undefined;
  visibleParticipantGroups: ParticipantGroupForIndicators[];
  selectedGroupingQuestionId: string | null;
  selectedGroupingLabel?: string | null;
  narrativeDiagnosticMarkdown?: string | null;
  hierarchyIdToWorkspaceName?: Map<string, string>;
  applicationWorkspaceNames?: string[];
}): RiskAnalysisPdfDataset {
  const {
    risksData,
    analysisData,
    formQuestionsAnswers,
    visibleParticipantGroups,
    selectedGroupingQuestionId,
    selectedGroupingLabel,
    narrativeDiagnosticMarkdown,
    hierarchyIdToWorkspaceName,
    applicationWorkspaceNames,
  } = params;

  const {
    entityMap,
    riskMap,
    entityRiskMap,
    groupedEntityRiskMap,
    hierarchyGroups,
  } = risksData;

  const { allowedEntityIds, entityEstablishmentMap } =
    buildRiskAnalysisViewContext({
      formQuestionsAnswers,
      visibleParticipantGroups,
      selectedGroupingQuestionId,
      entityMap,
      entityEstablishmentMapFromApi: risksData.entityEstablishmentMap,
      hierarchyIdToWorkspaceName,
      applicationWorkspaceNames,
    });

  const isEntityVisible = (entityId: string) =>
    allowedEntityIds === null || allowedEntityIds.has(entityId);

  const getEffectiveProbability = (entityId: string, riskId: string): number => {
    if (hierarchyGroups.length > 0) {
      const group = hierarchyGroups.find((g) =>
        g.hierarchyIds.includes(entityId),
      );
      if (group && groupedEntityRiskMap[group.id]?.[riskId]) {
        return groupedEntityRiskMap[group.id][riskId].probability;
      }
    }
    return entityRiskMap[entityId]?.[riskId]?.probability ?? 0;
  };

  const getEntitiesWithRisk = (riskId: string) =>
    expandRiskAnalysisEntitiesForHierarchyGroups({
      riskId,
      entityRiskMap,
      groupedEntityRiskMap,
      entityMap,
      hierarchyGroups,
      isEntityVisible,
    });

  const analysisResults = analysisData?.results ?? [];

  const riskIds = sortRiskIdsForAnalysis(
    Object.keys(riskMap).filter(
      (riskId) => getEntitiesWithRisk(riskId).length > 0,
    ),
    riskMap,
  );

  const factors: RiskAnalysisPdfFactor[] = riskIds.map((riskId) => {
    const risk = riskMap[riskId];
    const entitiesWithRisk = getEntitiesWithRisk(riskId);
    // PDF: sempre exibir estabelecimento quando houver contexto (inclusive com 1 só).
    const hasEstablishmentContext = entitiesWithRisk.some((entityId) =>
      entityEstablishmentMap.has(entityId),
    );

    const entityDisplayGroups = hasEstablishmentContext
      ? groupEntityIdsByEstablishment(
          entitiesWithRisk,
          entityMap,
          entityEstablishmentMap,
        )
      : [{ establishment: '', entityIds: entitiesWithRisk }];

    const establishmentBlocks: RiskAnalysisPdfEstablishmentBlock[] =
      entityDisplayGroups.map(({ establishment, entityIds }) => ({
        establishment,
        sectors: entityIds.map((entityId) => {
          const entity = entityMap[entityId];
          const probability = getEffectiveProbability(entityId, riskId);
          const classification = buildSectorRiskClassificationPdf(
            risk.severity,
            probability,
          );

          const resolved =
            resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback({
              riskId,
              entityId,
              results: analysisResults,
              hierarchyGroups,
            });
          const analysisPayload = resolved.analysis?.analysis;

          return {
            sectorTypeLabel:
              hierarchyTypeTranslation[entity.type as HierarchyTypeEnum] ??
              'Setor',
            sectorName: entity.name,
            classification,
            fontesGeradoras: mapAnalysisItems(
              analysisPayload?.fontesGeradoras,
            ),
            medidasEngenharia: mapAnalysisItems(
              analysisPayload?.medidasEngenhariaRecomendadas,
            ),
            medidasAdministrativas: mapAnalysisItems(
              analysisPayload?.medidasAdministrativasRecomendadas,
            ),
            ...(resolved.source !== 'absent' && resolved.analysis
              ? {
                  aiAnalysisSource: resolved.source,
                  ...(resolved.sourceHierarchyId
                    ? { sourceHierarchyId: resolved.sourceHierarchyId }
                    : {}),
                  ...(resolved.analysis.confidence != null
                    ? {
                        aiConfidencePercent: Math.round(
                          resolved.analysis.confidence * 100,
                        ),
                      }
                    : {}),
                }
              : {}),
          };
        }),
      }));

    return {
      riskId,
      name: risk.name,
      typeLabel: getRiskTypeLabel(risk),
      establishmentBlocks,
    };
  });

  const grouping = selectedGroupingQuestionId
    ? {
        active: true as const,
        questionLabel: selectedGroupingLabel?.trim() || 'Identificação',
      }
    : { active: false as const };

  return { grouping, factors, narrativeDiagnosticMarkdown };
}
