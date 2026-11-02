import type { AssistanceContextValue } from './GseVisualAssistance.context';
import {
  canReviewNode,
  directGroupIds,
  inheritedSources,
  scopedExistingGroups,
} from './gse-integrated-review.model';

export type ApprovedGseAddition = {
  groupId: string;
  name: string;
  description?: string;
  links: { nodeId: string; hierarchyId: string; label: string }[];
};
export type ApprovedGseAdditionSummary = {
  newGroups: ApprovedGseAddition[];
  existingGroups: ApprovedGseAddition[];
  issues: string[];
  skippedCovered: number;
  excludedRemovals: number;
  applicable: boolean;
};
/** Local summary only. This is NOT a server authorization, execution contract or persistence adapter. */
export function summarizeApprovedGseAdditions(
  ctx: Pick<
    AssistanceContextValue,
    'companyId' | 'workspaceId' | 'nodes' | 'groups' | 'review' | 'stale'
  >,
): ApprovedGseAdditionSummary {
  const result: ApprovedGseAdditionSummary = {
    newGroups: [],
    existingGroups: [],
    issues: [],
    skippedCovered: 0,
    excludedRemovals: 0,
    applicable: false,
  };
  if (ctx.stale || !ctx.companyId || !ctx.workspaceId) {
    result.issues.push('O contexto precisa ser analisado novamente.');
    return result;
  }
  const groups = scopedExistingGroups(
    ctx.groups,
    ctx.companyId,
    ctx.workspaceId,
  );
  const approvedNew = ctx.review.newGroups.filter(
    (g) => g.decision === 'accepted',
  );
  const names = new Set(
    groups.map((g) => g.name.trim().toLocaleLowerCase('pt-BR')),
  );
  for (const g of approvedNew) {
    const name = g.name.trim(),
      key = name.toLocaleLowerCase('pt-BR');
    if (!name || names.has(key))
      result.issues.push(`Revise o nome do novo GSE: ${name || '(vazio)'}.`);
    if ((g.description || '').length > 2000)
      result.issues.push(
        `A descrição do novo GSE deve ter no máximo 2000 caracteres: ${name}.`,
      );
    names.add(key);
    result.newGroups.push({
      groupId: g.id,
      name,
      description: g.description ?? '',
      links: [],
    });
  }
  result.excludedRemovals = ctx.review.changes.filter(
    (c) => c.kind === 'REMOVE' && c.decision === 'accepted',
  ).length;
  const unique = new Set<string>();
  const approved = ctx.review.changes
    .filter((c) => c.kind === 'ADD' && c.decision === 'accepted')
    .filter((c) => {
      const proposed = ctx.review.newGroups.find((g) => g.id === c.groupId);
      return !proposed || proposed.decision === 'accepted';
    });
  for (const c of approved) {
    const node = ctx.nodes[c.nodeId],
      proposed = result.newGroups.find((g) => g.groupId === c.groupId),
      group = groups.find((g) => g.id === c.groupId);
    if (
      !node ||
      !canReviewNode(node, ctx.workspaceId) ||
      (!proposed && !group)
    ) {
      result.issues.push(
        'Há uma inclusão aprovada fora do contexto disponível. Analise novamente.',
      );
      continue;
    }
    const key = JSON.stringify([c.groupId, c.nodeId]);
    if (unique.has(key)) continue;
    unique.add(key);
    let covered =
      !!group &&
      (directGroupIds(node, groups).includes(c.groupId) ||
        inheritedSources(
          ctx.nodes,
          c.nodeId,
          c.groupId,
          ctx.workspaceId,
          groups,
        ).length > 0);
    const seen = new Set<string>([c.nodeId]);
    let parent = String(node.parentId || '');
    while (parent && ctx.nodes[parent] && !seen.has(parent)) {
      seen.add(parent);
      if (
        approved.some(
          (a) =>
            a.groupId === c.groupId &&
            a.nodeId === parent &&
            canReviewNode(ctx.nodes[parent], ctx.workspaceId),
        )
      )
        covered = true;
      parent = String(ctx.nodes[parent].parentId || '');
    }
    if (covered) {
      result.skippedCovered++;
      continue;
    }
    let target =
      proposed || result.existingGroups.find((g) => g.groupId === c.groupId);
    if (!target) {
      target = { groupId: c.groupId, name: group!.name, links: [] };
      result.existingGroups.push(target);
    }
    target.links.push({
      nodeId: c.nodeId,
      hierarchyId: c.nodeId.split('//')[0],
      label: node.label,
    });
  }
  result.applicable =
    !result.issues.length &&
    (result.newGroups.length > 0 ||
      result.existingGroups.some((g) => g.links.length > 0));
  return result;
}
