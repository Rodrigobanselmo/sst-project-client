import type {
  InventoryMatchStatus,
  InventoryReviewedGroup,
  InventoryReviewedLink,
  InventoryReviewedRole,
  InventoryReviewedStructure,
  InventoryReviewPlanAction,
} from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';
import { parentTypeLabel } from './inventory-parent-path';

export type StructureDecisionMode = 'create' | 'reuse' | 'ignore';

export type StepTone = 'informative' | 'resolved' | 'pending' | 'updating';

export type LinkOperationalStatus =
  | 'ready'
  | 'exists'
  | 'ignored'
  | 'blocked-role'
  | 'blocked-gse';

export function structureDecisionMode(params: {
  included: boolean;
  reuseParentHierarchyId?: string | null;
}): StructureDecisionMode {
  if (!params.included) return 'ignore';
  if (params.reuseParentHierarchyId) return 'reuse';
  return 'create';
}

export function structureHeadline(structure: InventoryReviewedStructure): string {
  const name = structure.appliedName || structure.proposedName;
  const type = parentTypeLabel(structure.appliedType || structure.proposedType);
  if (!structure.included || structure.planAction === 'skip') {
    return `Ignorado: ${type} “${name}”`;
  }
  if (structure.planAction === 'reuse') {
    return `Será usada a estrutura existente: ${type} “${
      structure.reusedParentName || name
    }”`;
  }
  if (structure.planAction === 'create') {
    return `Será criado: ${type} “${name}”`;
  }
  return 'Decisão necessária';
}

export function roleParentLabel(
  role: InventoryReviewedRole,
  structures: InventoryReviewedStructure[],
): { typeLabel: string; name: string } | null {
  const proposal =
    structures.find((item) => item.key === role.selectedProposedStructureKey) ||
    structures.find(
      (item) => item.key === role.structuralParent?.proposedStructureKey,
    ) ||
    null;
  const name =
    role.selectedParentName ||
    proposal?.appliedName ||
    proposal?.proposedName ||
    role.structuralParent?.suggestedParentName ||
    role.structuralParent?.suggestedName;
  if (!name) return null;
  const type =
    proposal?.appliedType ||
    role.structuralParent?.suggestedParentType ||
    role.structuralParent?.proposedType ||
    'SECTOR';
  return { typeLabel: parentTypeLabel(type), name };
}

export function roleHeadline(
  role: InventoryReviewedRole,
  structures: InventoryReviewedStructure[],
): string {
  if (!role.included || role.planAction === 'skip') return 'Ignorado';
  if (role.planAction === 'reuse') {
    const existing =
      role.candidates.find((item) => item.id === role.matchedHierarchyId)?.name ||
      role.sourceName;
    return `Usará cargo existente: ${existing}`;
  }
  if (role.planAction === 'create') {
    const parent = roleParentLabel(role, structures);
    if (parent) return `Será criado em: ${parent.typeLabel} > ${parent.name}`;
    return `Será criado: ${role.sourceName}`;
  }
  return 'Decisão necessária';
}

export function roleResolvedByProposedStructure(
  role: InventoryReviewedRole,
  structures: InventoryReviewedStructure[],
): boolean {
  if (!role.included || role.planAction !== 'create') return false;
  if (role.selectedParentHierarchyId) return true;
  const key =
    role.selectedProposedStructureKey ||
    role.structuralParent?.proposedStructureKey;
  if (!key) return false;
  const proposal = structures.find((item) => item.key === key);
  return Boolean(
    proposal?.included &&
      (proposal.planAction === 'create' || proposal.planAction === 'reuse'),
  );
}

export function ignoredStructureForRole(
  role: InventoryReviewedRole,
  structures: InventoryReviewedStructure[],
): InventoryReviewedStructure | null {
  const key =
    role.selectedProposedStructureKey ||
    role.structuralParent?.proposedStructureKey;
  if (!key) return null;
  const proposal = structures.find((item) => item.key === key);
  if (!proposal) return null;
  if (!proposal.included || proposal.planAction === 'skip') return proposal;
  return null;
}

export function roleBlockedReason(
  role: InventoryReviewedRole,
  structures: InventoryReviewedStructure[],
): string | null {
  if (role.planAction !== 'blocked' && role.matchStatus !== 'PARENT_REQUIRED') {
    return null;
  }
  const ignored = ignoredStructureForRole(role, structures);
  if (ignored) {
    const type = parentTypeLabel(ignored.appliedType || ignored.proposedType);
    const name = ignored.appliedName || ignored.proposedName;
    return `Você ignorou o ${type} “${name}”. Escolha outro pai ou ignore este cargo.`;
  }
  if (role.structuralParent?.structureAction === 'AMBIGUOUS') {
    return 'Este cargo aparece em mais de uma Unidade de Trabalho. Escolha o pai ou ignore o cargo.';
  }
  if (role.matchStatus === 'AMBIGUOUS') {
    return 'Há mais de um cargo existente compatível. Escolha o correspondente ou ignore o item.';
  }
  if (role.matchStatus === 'CONFLICT') {
    return 'O nome aplicado conflita com um item existente. Informe outro nome ou ignore o cargo.';
  }
  return 'Este cargo ainda não tem um pai resolvido. Escolha uma estrutura existente ou ignore o cargo.';
}

export function groupHeadline(group: InventoryReviewedGroup): string {
  if (!group.included || group.planAction === 'skip') return 'Ignorado';
  const name =
    group.persistedName?.trim() ||
    group.appliedName.trim() ||
    group.sourceName.trim() ||
    '—';
  if (group.planAction === 'reuse') {
    return `Será usado o GSE existente: ${group.candidates[0]?.name || name}`;
  }
  if (group.planAction === 'link-workspace') {
    return 'Será vinculado a este estabelecimento';
  }
  if (group.planAction === 'create') {
    return `Será criado GSE: ${name}`;
  }
  return 'Decisão necessária';
}

export function linkOperationalStatus(params: {
  reviewed: InventoryReviewedLink | null;
  fallbackStatus: InventoryMatchStatus;
}): LinkOperationalStatus {
  const reviewed = params.reviewed;
  if (!reviewed) {
    if (params.fallbackStatus === 'ALREADY_LINKED') return 'exists';
    if (params.fallbackStatus === 'BLOCKED_BY_ROLE') return 'blocked-role';
    if (params.fallbackStatus === 'BLOCKED_BY_GSE') return 'blocked-gse';
    if (params.fallbackStatus === 'NEW') return 'ready';
    return 'blocked-role';
  }
  if (
    !reviewed.included ||
    reviewed.planAction === 'skip' ||
    reviewed.excludedBecause
  ) {
    return 'ignored';
  }
  if (reviewed.planAction === 'already-linked') return 'exists';
  if (reviewed.planAction === 'create') return 'ready';
  if (reviewed.matchStatus === 'BLOCKED_BY_GSE') {
    return 'blocked-gse';
  }
  return 'blocked-role';
}

export function linkStatusLabel(status: LinkOperationalStatus): string {
  if (status === 'ready') return 'Pronto para criar';
  if (status === 'exists') return 'Já existe';
  if (status === 'ignored') return 'Ignorado';
  if (status === 'blocked-gse') return 'Bloqueado — resolver GSE';
  return 'Bloqueado — resolver cargo';
}

export function linkIgnoreReason(reviewed: InventoryReviewedLink | null): string | null {
  if (reviewed?.excludedBecause === 'role-skipped') {
    return 'Ignorado porque o cargo ficou fora do plano';
  }
  if (reviewed?.excludedBecause === 'group-skipped') {
    return 'Ignorado porque o GSE ficou fora do plano';
  }
  if (reviewed && !reviewed.included && reviewed.planAction === 'skip') {
    return 'Ignorado neste plano';
  }
  return null;
}

export function stepToneLabel(tone: StepTone, count = 0): string {
  if (tone === 'informative') return 'Somente informativa';
  if (tone === 'resolved') return 'Resolvida automaticamente';
  if (tone === 'updating') return 'Atualizando o plano';
  return count > 0 ? `Requer decisão (${count})` : 'Requer decisão';
}

export type StepVisitState = 'unvisited' | 'current' | 'resolved' | 'pending';

export function stepVisitState(params: {
  isActive: boolean;
  visited: boolean;
  pendingCount: number;
  hasReview: boolean;
}): StepVisitState {
  if (params.isActive) return 'current';
  if (!params.visited) return 'unvisited';
  if (!params.hasReview) return 'unvisited';
  if (params.pendingCount > 0) return 'pending';
  return 'resolved';
}

export function suggestedSplitNames(name: string): string[] {
  const parts = name
    .split('/')
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts;
  return ['', ''];
}

export function countPendingPlanActions(
  items: Array<{ included: boolean; planAction: InventoryReviewPlanAction }>,
): number {
  return items.filter(
    (item) => item.included && item.planAction === 'blocked',
  ).length;
}
