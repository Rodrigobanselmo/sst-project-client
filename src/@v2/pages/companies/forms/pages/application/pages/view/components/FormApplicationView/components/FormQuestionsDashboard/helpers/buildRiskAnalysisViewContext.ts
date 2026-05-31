import { FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment';
import { isStructuralIndicatorGroupingKey } from '@v2/models/form/helpers/form-indicators-structural-grouping.config';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { FormParticipantStructureBrowseModel } from '@v2/models/form/models/form-questions-answers/form-participant-structure-browse.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

import type { ParticipantGroupForIndicators } from './buildParticipantGroupsForIndicators';
import { resolveEstablishmentLabelForHierarchyId } from './resolveEstablishmentLabelForHierarchyId';
import { resolveEstablishmentLabelFromSectorName } from './resolveEstablishmentLabelFromSectorName';
import { resolveParticipantStructuresForGrouping } from './resolveParticipantStructuresForGrouping';

type EntityInfo = { id: string; name: string; type: HierarchyTypeEnum };

type RiskInfo = {
  id: string;
  name: string;
  type: RiskTypeEnum;
  subTypes: { sub_type: { id: number; name: string } }[];
};

function resolveEntityIdForParticipant(
  structure: FormParticipantStructureBrowseModel,
  entityMap: Record<string, EntityInfo>,
): string | null {
  const candidates = structure.hierarchies.filter((h) => entityMap[h.id]);
  if (candidates.length === 0) return null;

  const sector = candidates.find((h) => h.type === HierarchyTypeEnum.SECTOR);
  return (sector ?? candidates[0]).id;
}

function buildAllowedEntityIdsForStructuralGrouping(params: {
  selectedGroupingQuestionId: string;
  visibleParticipantGroups: ParticipantGroupForIndicators[];
  entityMap: Record<string, EntityInfo>;
  hierarchyIdToWorkspaceName: Map<string, string>;
  applicationWorkspaceNames: string[];
}): Set<string> {
  const allowedEntityIds = new Set<string>();

  for (const group of params.visibleParticipantGroups) {
    if (params.selectedGroupingQuestionId === '__participant_sector') {
      const match = group.id.match(/__participant_sector::[^:]+::(.+)$/);
      if (match?.[1]) {
        allowedEntityIds.add(match[1]);
      }
      continue;
    }

    if (params.selectedGroupingQuestionId === '__participant_workspace') {
      const groupName = group.name.trim();
      Object.keys(params.entityMap).forEach((entityId) => {
        const establishment = resolveEstablishmentLabelForHierarchyId({
          hierarchyId: entityId,
          entityMap: params.entityMap,
          hierarchyIdToWorkspaceName: params.hierarchyIdToWorkspaceName,
          applicationWorkspaceNames: params.applicationWorkspaceNames,
        })?.trim();

        if (establishment && establishment === groupName) {
          allowedEntityIds.add(entityId);
        }
      });
    }
  }

  return allowedEntityIds;
}

export function buildRiskAnalysisViewContext(params: {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel | null | undefined;
  visibleParticipantGroups: ParticipantGroupForIndicators[];
  selectedGroupingQuestionId: string | null;
  entityMap: Record<string, EntityInfo>;
  entityEstablishmentMapFromApi?: Record<string, string>;
  hierarchyIdToWorkspaceName?: Map<string, string>;
  applicationWorkspaceNames?: string[];
}): {
  allowedEntityIds: Set<string> | null;
  entityEstablishmentMap: Map<string, string>;
} {
  const {
    formQuestionsAnswers,
    visibleParticipantGroups,
    selectedGroupingQuestionId,
    entityMap,
    entityEstablishmentMapFromApi,
    hierarchyIdToWorkspaceName,
    applicationWorkspaceNames = [],
  } = params;

  const participantStructures =
    resolveParticipantStructuresForGrouping(formQuestionsAnswers);

  const visibleParticipantIds = new Set<string>();
  visibleParticipantGroups.forEach((group) => {
    group.participantIds.forEach((id) => visibleParticipantIds.add(id));
  });

  const structuresForEstablishmentLabel = selectedGroupingQuestionId
    ? participantStructures.filter((s) =>
        visibleParticipantIds.has(s.participantsAnswersId),
      )
    : participantStructures;

  const entityEstablishmentMap = new Map<string, string>();

  if (entityEstablishmentMapFromApi) {
    Object.entries(entityEstablishmentMapFromApi).forEach(([entityId, establishment]) => {
      const label = establishment?.trim();
      if (label) {
        entityEstablishmentMap.set(entityId, label);
      }
    });
  }

  for (const structure of structuresForEstablishmentLabel) {
    const entityId = resolveEntityIdForParticipant(structure, entityMap);
    if (!entityId) continue;

    if (entityEstablishmentMap.has(entityId)) continue;

    const establishment =
      structure.workspaceName?.trim() || FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL;

    entityEstablishmentMap.set(entityId, establishment);
  }

  if (hierarchyIdToWorkspaceName) {
    hierarchyIdToWorkspaceName.forEach((workspaceName, hierarchyId) => {
      if (entityEstablishmentMap.has(hierarchyId)) return;
      const label = workspaceName.trim();
      if (label) {
        entityEstablishmentMap.set(hierarchyId, label);
      }
    });
  }

  if (applicationWorkspaceNames.length > 0) {
    for (const entityId of Object.keys(entityMap)) {
      if (entityEstablishmentMap.has(entityId)) continue;

      const sectorName = entityMap[entityId]?.name;
      if (!sectorName) continue;

      const matchedLabel = resolveEstablishmentLabelFromSectorName(
        sectorName,
        applicationWorkspaceNames,
      );
      if (matchedLabel) {
        entityEstablishmentMap.set(entityId, matchedLabel);
      }
    }
  }

  if (!selectedGroupingQuestionId) {
    return { allowedEntityIds: null, entityEstablishmentMap };
  }

  if (isStructuralIndicatorGroupingKey(selectedGroupingQuestionId)) {
    return {
      allowedEntityIds: buildAllowedEntityIdsForStructuralGrouping({
        selectedGroupingQuestionId,
        visibleParticipantGroups,
        entityMap,
        hierarchyIdToWorkspaceName:
          hierarchyIdToWorkspaceName ?? new Map<string, string>(),
        applicationWorkspaceNames,
      }),
      entityEstablishmentMap,
    };
  }

  const allowedEntityIds = new Set<string>();

  const registerVisibleParticipantEntity = (participantsAnswersId: string) => {
    if (!visibleParticipantIds.has(participantsAnswersId)) return;

    const structure = participantStructures.find(
      (s) => s.participantsAnswersId === participantsAnswersId,
    );

    const entityIdFromStructure = structure
      ? resolveEntityIdForParticipant(structure, entityMap)
      : null;

    if (entityIdFromStructure) {
      allowedEntityIds.add(entityIdFromStructure);
      return;
    }

    // Fallback alinhado à API de riscos: hierarchyId em answer.value do identificador
    const [identifierGroup] = formQuestionsAnswers?.results ?? [];
    for (const question of identifierGroup?.questions ?? []) {
      const answer = question.answers.find(
        (a) => a.participantsAnswersId === participantsAnswersId,
      );
      if (answer?.value && entityMap[answer.value]) {
        allowedEntityIds.add(answer.value);
        break;
      }
    }
  };

  visibleParticipantIds.forEach((participantsAnswersId) => {
    registerVisibleParticipantEntity(participantsAnswersId);
  });

  return { allowedEntityIds, entityEstablishmentMap };
}

export function isFrpsRisk(risk: RiskInfo): boolean {
  return risk.subTypes?.some((s) => s.sub_type.name === 'Psicossociais') ?? false;
}

export function isIndicatorRisk(risk: RiskInfo): boolean {
  if (isFrpsRisk(risk)) return false;
  return (
    risk.type === RiskTypeEnum.OUTROS ||
    risk.name.trim().toLowerCase().startsWith('indicador')
  );
}

export function sortRiskIdsForAnalysis(
  riskIds: string[],
  riskMap: Record<string, RiskInfo>,
): string[] {
  const categoryOrder = (riskId: string) => {
    const risk = riskMap[riskId];
    if (!risk) return 2;
    if (isFrpsRisk(risk)) return 0;
    if (isIndicatorRisk(risk)) return 1;
    return 2;
  };

  return [...riskIds].sort((a, b) => {
    const orderDiff = categoryOrder(a) - categoryOrder(b);
    if (orderDiff !== 0) return orderDiff;
    const nameA = riskMap[a]?.name ?? '';
    const nameB = riskMap[b]?.name ?? '';
    return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
  });
}

export function shouldGroupEntitiesByEstablishment(
  entityIds: string[],
  entityMap: Record<string, EntityInfo>,
  entityEstablishmentMap: Map<string, string>,
): boolean {
  const establishmentNames = new Set(
    entityIds
      .map((id) => entityEstablishmentMap.get(id))
      .filter((name): name is string => Boolean(name)),
  );
  if (establishmentNames.size > 1) return true;

  const sectorNames = entityIds.map((id) => entityMap[id]?.name ?? '');
  return new Set(sectorNames).size < sectorNames.length;
}

export function groupEntityIdsByEstablishment(
  entityIds: string[],
  entityMap: Record<string, EntityInfo>,
  entityEstablishmentMap: Map<string, string>,
): Array<{ establishment: string; entityIds: string[] }> {
  const groups = new Map<string, string[]>();

  entityIds.forEach((entityId) => {
    const establishment =
      entityEstablishmentMap.get(entityId) ??
      FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL;
    if (!groups.has(establishment)) {
      groups.set(establishment, []);
    }
    groups.get(establishment)!.push(entityId);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
    .map(([establishment, ids]) => ({
      establishment,
      entityIds: [...ids].sort((a, b) =>
        (entityMap[a]?.name ?? '').localeCompare(
          entityMap[b]?.name ?? '',
          'pt-BR',
          { sensitivity: 'base' },
        ),
      ),
    }));
}
