import {
  suggestGseName,
  describeGseProposal,
} from './gse-proposal-registration';
import type { IGho } from 'core/interfaces/api/IGho';
import type { ITreeMap, ITreeMapObject } from '../../interfaces';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import { getWorkspaceIdFromTreeNode } from '../../utils/get-org-workspace-id';
import { analyzeVisualGseScope } from './gse-visual-assistance.model';
import type { ReviewState } from './gse-visual-assistance.model';

export const REVIEW_COLORS = {
  existing: { color: '#2E7D5B', background: '#E1F2E9' },
  add: { color: '#3478C0', background: '#E5F0FC' },
  remove: { color: '#C44B4B', background: '#FBEAEA' },
  newGroup: { color: '#7C3DB5', background: '#F0E6FA' },
  changedGroup: { color: '#946000', background: '#FFF1CD' },
  neutral: { color: '#637381', background: '#EDF0F2' },
} as const;
export type GroupVisualState =
  | 'EXISTENTE_SEM_ALTERACOES'
  | 'EXISTENTE_COM_ALTERACOES'
  | 'NOVO_SUGERIDO';
export type LinkChange = {
  id: string;
  groupId: string;
  nodeId: string;
  kind: 'ADD' | 'REMOVE';
  decision: ReviewState;
  reason: string;
};
export type IntegratedReview = {
  newGroups: {
    id: string;
    name: string;
    description?: string;
    nameEdited?: boolean;
    descriptionEdited?: boolean;
    decision: ReviewState;
  }[];
  changes: LinkChange[];
};
export const emptyIntegratedReview = (): IntegratedReview => ({
  newGroups: [],
  changes: [],
});
export const canReviewNode = (
  node: ITreeMapObject | undefined,
  workspaceId: string,
) =>
  !!node &&
  !node.showRef &&
  getWorkspaceIdFromTreeNode(node) === workspaceId &&
  ![
    TreeTypeEnum.COMPANY,
    TreeTypeEnum.ESTABLISHMENT_GROUP,
    TreeTypeEnum.WORKSPACE,
  ].includes(node.type);
export function scopedExistingGroups(
  groups: IGho[],
  companyId: string,
  workspaceId: string,
): IGho[] {
  return groups.filter(
    (g) =>
      g.companyId === companyId &&
      (g.type == null || g.type === 0) &&
      g.status === 'ACTIVE' &&
      !(g as IGho & { deletedAt?: unknown }).deletedAt &&
      (g.workspaceIds?.includes(workspaceId) ||
        g.workspaces?.some((w) => w.id === workspaceId)),
  );
}
export function directGroupIds(node: ITreeMapObject, groups: IGho[]): string[] {
  const valid = new Set(groups.map((g) => g.id));
  return [
    ...new Set(
      (node.ghos || []).filter((g) => valid.has(g.id)).map((g) => g.id),
    ),
  ];
}
export function inheritedSources(
  nodes: ITreeMap,
  nodeId: string,
  groupId: string,
  workspaceId: string,
  groups: IGho[],
): string[] {
  const seen = new Set([nodeId]);
  const sources: string[] = [];
  let parent = nodes[nodeId]?.parentId;
  while (parent != null && !seen.has(String(parent))) {
    const node = nodes[parent];
    if (!node || getWorkspaceIdFromTreeNode(node) !== workspaceId) break;
    seen.add(String(parent));
    if (directGroupIds(node, groups).includes(groupId))
      sources.push(String(parent));
    parent = node.parentId;
  }
  return sources;
}
export function groupVisualState(
  review: IntegratedReview,
  id: string,
): GroupVisualState {
  if (review.newGroups.some((g) => g.id === id)) return 'NOVO_SUGERIDO';
  return review.changes.some(
    (c) => c.groupId === id && c.decision !== 'rejected',
  )
    ? 'EXISTENTE_COM_ALTERACOES'
    : 'EXISTENTE_SEM_ALTERACOES';
}
export function generateIntegratedReview(
  nodes: ITreeMap,
  groups: IGho[],
  companyId: string,
  workspaceId: string,
  guidance: string,
  identities: {
    companyId: string;
    workspaceId: string;
    entries: { temporaryId: string; groupId: string }[];
  } | null = null,
  registration: {
    companyName?: string;
    workspaceName?: string;
    previous?: IntegratedReview;
  } = {},
): IntegratedReview {
  const review = emptyIntegratedReview();
  const analysis = analyzeVisualGseScope(
    nodes,
    companyId,
    workspaceId,
    guidance,
    identities?.companyId === companyId &&
      identities.workspaceId === workspaceId
      ? identities.entries.filter((entry) =>
          scopedExistingGroups(groups, companyId, workspaceId).some(
            (g) => g.id === entry.groupId,
          ),
        )
      : [],
  );
  for (const proposal of analysis.proposals) {
    const target =
      proposal.targetId && groups.some((g) => g.id === proposal.targetId)
        ? proposal.targetId
        : null;
    const groupId = target || `@visual-gse:${proposal.id}`;
    if (!target)
      review.newGroups.push({
        id: groupId,
        name: suggestGseName(
          proposal.name.replace(/^GSE — /, ''),
          scopedExistingGroups(groups, companyId, workspaceId),
          review.newGroups.map((g) => g.name),
        ),
        description: describeGseProposal({
          company: registration.companyName || companyId,
          workspace: registration.workspaceName || workspaceId,
          sector: proposal.sector,
          roles: proposal.roleIds.map((id) => nodes[id]?.label || id),
        }),
        decision: 'pending',
      });
    for (const nodeId of proposal.roleIds)
      review.changes.push({
        id: JSON.stringify([groupId, nodeId]),
        groupId,
        nodeId,
        kind: 'ADD',
        decision: 'pending',
        reason: proposal.reason,
      });
  }
  for (const group of review.newGroups) {
    const previous = registration.previous?.newGroups.find(
      (g) => g.id === group.id,
    );
    if (previous?.nameEdited || previous?.decision === 'accepted') {
      group.name = previous.name;
      group.nameEdited = previous.nameEdited;
    }
    if (
      previous?.descriptionEdited ||
      (previous?.decision === 'accepted' && previous.description !== undefined)
    ) {
      group.description = previous.description;
      group.descriptionEdited = previous.descriptionEdited;
    }
  }
  // A real structural redundancy is a review candidate, never an authorization to delete history.
  for (const node of Object.values(nodes)) {
    if (!canReviewNode(node, workspaceId)) continue;
    for (const groupId of directGroupIds(node, groups)) {
      const sources = inheritedSources(
        nodes,
        String(node.id),
        groupId,
        workspaceId,
        groups,
      );
      if (sources.length)
        review.changes.push({
          id: JSON.stringify([groupId, String(node.id)]),
          groupId,
          nodeId: String(node.id),
          kind: 'REMOVE',
          decision: 'pending',
          reason: `Vínculo direto também abrangido por ${nodes[sources[0]].label}. Revisar possível redundância estrutural; exposições e vigências podem ser diferentes. A execução dependerá das regras de integridade histórica do PPP/eSocial.`,
        });
    }
  }
  return review;
}
export function addReviewChange(
  review: IntegratedReview,
  nodes: ITreeMap,
  groups: IGho[],
  workspaceId: string,
  groupId: string,
  nodeId: string,
  kind: 'ADD' | 'REMOVE',
  manualAddition = false,
): IntegratedReview {
  if (!canReviewNode(nodes[nodeId], workspaceId))
    throw Error('Selecione uma hierarquia deste estabelecimento.');
  if (
    !groups.some((g) => g.id === groupId) &&
    !review.newGroups.some((g) => g.id === groupId)
  )
    throw Error('GSE fora da revisão atual.');
  const accepted = manualAddition && kind === 'ADD' && groups.some((g) => g.id === groupId);
  if (accepted && inheritedSources(nodes, nodeId, groupId, workspaceId, groups).length)
    throw Error('Este cargo ou setor já está abrangido por um vínculo superior.');
  const direct = directGroupIds(nodes[nodeId], groups).includes(groupId);
  if (kind === 'REMOVE' && !direct)
    throw Error(
      'Abrangência herdada não é vínculo direto removível. Revise o vínculo superior.',
    );
  if (kind === 'ADD' && direct) throw Error('Vínculo direto já cadastrado.');
  const change: LinkChange = {
    id: JSON.stringify([groupId, nodeId]),
    groupId,
    nodeId,
    kind,
    decision: accepted ? 'accepted' : 'pending',
    reason:
      kind === 'ADD'
        ? accepted
          ? 'Inclusão manual selecionada. Confirme e salve no painel.'
          : 'Inclusão direta proposta na revisão humana; exposição homogênea não confirmada.'
        : 'Retirada de vínculo direto proposta na revisão humana. A execução dependerá das regras de integridade histórica do PPP/eSocial.',
  };
  return {
    ...review,
    changes: [...review.changes.filter((c) => c.id !== change.id), change],
  };
}
export function decideReviewChange(
  review: IntegratedReview,
  id: string,
  decision: ReviewState,
): IntegratedReview {
  if (!review.changes.some((c) => c.id === id))
    throw Error('Sugestão não encontrada.');
  return {
    ...review,
    changes: review.changes.map((c) => (c.id === id ? { ...c, decision } : c)),
  };
}
export function decideCreation(
  review: IntegratedReview,
  id: string,
  decision: ReviewState,
): IntegratedReview {
  if (!review.newGroups.some((g) => g.id === id))
    throw Error('GSE sugerido não encontrado.');
  if (
    decision === 'accepted' &&
    !review.changes.some(
      (c) => c.groupId === id && c.kind === 'ADD' && c.decision !== 'rejected',
    )
  )
    throw Error('A proposta precisa de pelo menos um vínculo não rejeitado.');
  return {
    ...review,
    newGroups: review.newGroups.map((g) =>
      g.id === id ? { ...g, decision } : g,
    ),
  };
}
export type LinkVisual = {
  kind: 'existing' | 'add' | 'remove' | 'inherited' | 'inherited-add' | 'empty';
  change?: LinkChange;
  sources: string[];
  proposedSources: string[];
  dependency: boolean;
};
export function linkVisual(
  review: IntegratedReview,
  nodes: ITreeMap,
  groups: IGho[],
  workspaceId: string,
  groupId: string,
  nodeId: string,
): LinkVisual {
  const node = nodes[nodeId];
  if (!canReviewNode(node, workspaceId))
    return {
      kind: 'empty',
      sources: [],
      proposedSources: [],
      dependency: false,
    };
  const sources = inheritedSources(nodes, nodeId, groupId, workspaceId, groups);
  const change = review.changes.find(
    (c) => c.groupId === groupId && c.nodeId === nodeId,
  );
  const direct = directGroupIds(node, groups).includes(groupId);
  const groupRejected = review.newGroups.some(
    (g) => g.id === groupId && g.decision === 'rejected',
  );
  const proposedSources: string[] = [];
  const ancestors = new Set<string>();
  let parent = node.parentId;
  while (parent != null && !ancestors.has(String(parent))) {
    const ancestor = nodes[parent];
    if (!ancestor || getWorkspaceIdFromTreeNode(ancestor) !== workspaceId)
      break;
    ancestors.add(String(parent));
    if (
      !groupRejected &&
      review.changes.some(
        (c) =>
          c.groupId === groupId &&
          c.nodeId === String(parent) &&
          c.kind === 'ADD' &&
          c.decision !== 'rejected',
      )
    )
      proposedSources.push(String(parent));
    parent = ancestor.parentId;
  }
  const activeChange =
    change && change.decision !== 'rejected' && !groupRejected;
  const dependency = sources.some((id) =>
    review.changes.some(
      (c) =>
        c.groupId === groupId &&
        c.nodeId === id &&
        c.kind === 'REMOVE' &&
        c.decision !== 'rejected',
    ),
  );
  return {
    kind: activeChange
      ? change.kind === 'ADD'
        ? 'add'
        : 'remove'
      : direct
        ? 'existing'
        : sources.length
          ? 'inherited'
          : proposedSources.length
            ? 'inherited-add'
            : 'empty',
    change,
    sources,
    proposedSources,
    dependency,
  };
}

/** Rejected creations suspend their edges without destroying individual decisions. */
export function effectiveReviewChanges(review: IntegratedReview): LinkChange[] {
  return review.changes.filter(
    (c) =>
      !review.newGroups.some(
        (g) => g.id === c.groupId && g.decision === 'rejected',
      ),
  );
}

/** Editing registration fields invalidates only the creation approval, never persists anything. */
export function editProposedGse(
  review: IntegratedReview,
  id: string,
  patch: { name?: string; description?: string },
): IntegratedReview {
  return {
    ...review,
    newGroups: review.newGroups.map((g) =>
      g.id === id
        ? {
            ...g,
            ...patch,
            decision: 'pending',
            nameEdited: patch.name !== undefined ? true : g.nameEdited,
            descriptionEdited:
              patch.description !== undefined ? true : g.descriptionEdited,
          }
        : g,
    ),
  };
}
