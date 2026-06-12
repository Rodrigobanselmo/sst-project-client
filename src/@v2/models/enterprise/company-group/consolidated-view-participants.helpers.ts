import { ConsolidatedViewParticipantModel } from './consolidated-view-participants.model';

export const CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE = 3;
export const CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL = 'Dados Protegidos';
export const CONSOLIDATED_PARTICIPANTS_NO_WORKSPACE_LABEL = 'Sem estabelecimento';

export type ConsolidatedParticipantsViewMode =
  | 'list'
  | 'grouped_company'
  | 'grouped_workspace'
  | 'grouped_sector'
  | 'grouped_hierarchy';

export type ConsolidatedParticipantsAggregateRow = {
  groupKey: string;
  groupLabel: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
  isProtected: boolean;
};

export type ConsolidatedParticipantsFilterSummary = {
  totalParticipants: number;
  respondedCount: number;
  notRespondedCount: number;
  responseRatePercent: number;
};

export type ConsolidatedParticipantsFilters = {
  search: string;
  responseFilter: 'all' | 'responded' | 'not_responded';
  companyIds: string[];
  workspaceLabels: string[];
  sectorLabels: string[];
};

export function shouldProtectConsolidatedParticipantGroup(count: number) {
  return count > 0 && count < CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE;
}

export function getConsolidatedParticipantWorkspaceLabel(
  participant: ConsolidatedViewParticipantModel,
) {
  return participant.workspaceLabel?.trim() || CONSOLIDATED_PARTICIPANTS_NO_WORKSPACE_LABEL;
}

export function buildConsolidatedParticipantsFilterSummary(
  participants: ConsolidatedViewParticipantModel[],
): ConsolidatedParticipantsFilterSummary {
  const totalParticipants = participants.length;
  const respondedCount = participants.filter(
    (participant) => participant.hasAnswered,
  ).length;
  const notRespondedCount = Math.max(totalParticipants - respondedCount, 0);
  const responseRatePercent =
    totalParticipants > 0
      ? Math.round((respondedCount / totalParticipants) * 1000) / 10
      : 0;

  return {
    totalParticipants,
    respondedCount,
    notRespondedCount,
    responseRatePercent,
  };
}

function buildAggregateRows(
  participants: ConsolidatedViewParticipantModel[],
  getGroupKey: (participant: ConsolidatedViewParticipantModel) => string,
  getGroupLabel: (participant: ConsolidatedViewParticipantModel) => string,
): ConsolidatedParticipantsAggregateRow[] {
  const map = new Map<
    string,
    { groupLabel: string; total: number; responded: number }
  >();

  for (const participant of participants) {
    const groupKey = getGroupKey(participant);
    const groupLabel = getGroupLabel(participant);
    const current = map.get(groupKey) ?? {
      groupLabel,
      total: 0,
      responded: 0,
    };

    current.total += 1;
    if (participant.hasAnswered) current.responded += 1;
    map.set(groupKey, current);
  }

  return Array.from(map.entries())
    .map(([groupKey, group]) => {
      const notResponded = Math.max(0, group.total - group.responded);
      const responseRatePercent =
        group.total > 0
          ? Math.round((group.responded / group.total) * 1000) / 10
          : 0;

      return {
        groupKey,
        groupLabel: group.groupLabel,
        total: group.total,
        responded: group.responded,
        notResponded,
        responseRatePercent,
        isProtected: shouldProtectConsolidatedParticipantGroup(group.total),
      };
    })
    .sort((left, right) =>
      left.groupLabel.localeCompare(right.groupLabel, 'pt-BR', {
        sensitivity: 'base',
      }),
    );
}

export function buildConsolidatedCompanyAggregates(
  participants: ConsolidatedViewParticipantModel[],
) {
  return buildAggregateRows(
    participants,
    (participant) => participant.companyId,
    (participant) => participant.companyLabel,
  );
}

export function buildConsolidatedWorkspaceAggregates(
  participants: ConsolidatedViewParticipantModel[],
) {
  return buildAggregateRows(
    participants,
    (participant) =>
      `${participant.companyId}:${getConsolidatedParticipantWorkspaceLabel(participant)}`,
    (participant) => getConsolidatedParticipantWorkspaceLabel(participant),
  );
}

export function buildConsolidatedSectorAggregates(
  participants: ConsolidatedViewParticipantModel[],
) {
  return buildAggregateRows(
    participants,
    (participant) =>
      `${participant.companyId}:${participant.sectorLabel || '—'}`,
    (participant) => participant.sectorLabel || '—',
  );
}

export function buildConsolidatedHierarchyAggregates(
  participants: ConsolidatedViewParticipantModel[],
) {
  return buildAggregateRows(
    participants,
    (participant) =>
      `${participant.companyId}:${participant.hierarchyLabel || '—'}`,
    (participant) => participant.hierarchyLabel || '—',
  );
}

export function filterConsolidatedParticipants(
  participants: ConsolidatedViewParticipantModel[],
  filters: ConsolidatedParticipantsFilters,
) {
  const search = filters.search.trim().toLowerCase();

  return participants.filter((participant) => {
    if (filters.responseFilter === 'responded' && !participant.hasAnswered) {
      return false;
    }

    if (filters.responseFilter === 'not_responded' && participant.hasAnswered) {
      return false;
    }

    if (
      filters.companyIds.length > 0 &&
      !filters.companyIds.includes(participant.companyId)
    ) {
      return false;
    }

    const workspaceLabel = getConsolidatedParticipantWorkspaceLabel(participant);

    if (
      filters.workspaceLabels.length > 0 &&
      !filters.workspaceLabels.includes(workspaceLabel)
    ) {
      return false;
    }

    if (
      filters.sectorLabels.length > 0 &&
      !filters.sectorLabels.includes(participant.sectorLabel || '—')
    ) {
      return false;
    }

    if (!search) return true;

    const haystack = [
      participant.name,
      participant.cpf,
      participant.email,
      participant.phone,
      participant.companyLabel,
      workspaceLabel,
      participant.sectorLabel,
      participant.hierarchyLabel,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function maskConsolidatedParticipantForPrivacy(
  participant: ConsolidatedViewParticipantModel,
  shouldMask: boolean,
): ConsolidatedViewParticipantModel {
  if (!shouldMask) return participant;

  return {
    ...participant,
    name: CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL,
    cpf: CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL,
    email: CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL,
    phone: CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL,
    officeLabel: CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL,
  };
}

export function buildConsolidatedParticipantsRecorteSnapshot(params: {
  filters: ConsolidatedParticipantsFilters;
  viewMode: ConsolidatedParticipantsViewMode;
  filterSummary: ConsolidatedParticipantsFilterSummary;
  participants: ConsolidatedViewParticipantModel[];
  groups: ConsolidatedParticipantsAggregateRow[];
}) {
  return {
    filters: params.filters,
    viewMode: params.viewMode,
    filterSummary: params.filterSummary,
    participants: params.participants,
    groups: params.groups,
  };
}
