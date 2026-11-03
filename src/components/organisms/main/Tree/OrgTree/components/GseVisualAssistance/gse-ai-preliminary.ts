import type { IntegratedReview } from './gse-integrated-review.model';
import type { ITreeMap } from '../../interfaces';
import type { AiPreliminaryGroup } from './gse-ai-consultative';
/** No state mutation: a local accepted proposal is still NOT a persisted link. */
export function preliminaryGseDistribution(review: IntegratedReview, nodes: ITreeMap, groups: {id:string; name:string}[]): AiPreliminaryGroup[] {
  const ids = [...new Set([...review.newGroups.map((g) => g.id), ...review.changes.map((c) => c.groupId)])];
  return ids.map((id) => {
    const draft = review.newGroups.find((g) => g.id === id);
    const group = groups.find((g) => g.id === id);
    return {
      key: id, existingGroupId: draft ? null : id,
      name: draft?.name || group?.name || 'GSE preliminar', decision: draft?.decision || 'pending',
      changes: review.changes.filter((c) => c.groupId === id).map((c) => ({
        hierarchyId: String(nodes[c.nodeId]?.id || c.nodeId).split('//')[0], kind: c.kind, decision: c.decision,
      })),
    };
  });
}
