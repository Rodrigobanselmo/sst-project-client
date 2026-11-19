import type { ITreeMap } from '../../interfaces';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import {
  canReviewNode,
  type IntegratedReview,
} from './gse-integrated-review.model';

export type AiApprovedGseDraft = {
  id: string;
  name: string;
  description: string;
  hierarchyIds: string[];
  decision: 'accepted' | 'pending' | 'rejected';
};
/** Explicit human approval only. Produces a local additive draft; never writes to the API. */
export function stageAiApprovedGse(
  review: IntegratedReview,
  draft: AiApprovedGseDraft,
  nodes: ITreeMap,
  workspaceId: string,
): IntegratedReview {
  if (
    !draft.id.startsWith('@visual-gse:ai-') ||
    !draft.id.endsWith(`//${workspaceId}`)
  )
    throw Error('Proposta incompatível com o estabelecimento.');
  const without = {
    newGroups: review.newGroups.filter((g) => g.id !== draft.id),
    changes: review.changes.filter((c) => c.groupId !== draft.id),
  };
  if (draft.decision !== 'accepted') return without;
  const ids = [...new Set(draft.hierarchyIds)];
  const name = draft.name.trim();
  if (
    !name ||
    name.length > 160 ||
    draft.description.length > 2000 ||
    !ids.length
  )
    throw Error(
      'Revise o nome, a descrição (até 2000 caracteres) e os cargos da proposta antes de aceitar.',
    );
  const nodeIds = ids.map((id) => `${id}//${workspaceId}`);
  if (
    nodeIds.some(
      (id) =>
        !canReviewNode(nodes[id], workspaceId) ||
        ![TreeTypeEnum.OFFICE, TreeTypeEnum.SUB_OFFICE].includes(
          nodes[id].type,
        ),
    )
  )
    throw Error(
      'Há cargos da proposta fora do estabelecimento disponível. Atualize a análise.',
    );
  if (
    without.newGroups.some(
      (g) =>
        g.name.trim().toLocaleLowerCase('pt-BR') ===
        name.toLocaleLowerCase('pt-BR'),
    )
  )
    throw Error('Já existe uma proposta com esse nome na prévia de gravação.');
  return {
    newGroups: [
      ...without.newGroups,
      {
        id: draft.id,
        name,
        description: draft.description,
        decision: 'accepted',
      },
    ],
    changes: [
      ...without.changes,
      ...nodeIds.map((nodeId) => ({
        id: JSON.stringify([draft.id, nodeId]),
        groupId: draft.id,
        nodeId,
        kind: 'ADD' as const,
        decision: 'accepted' as const,
        reason:
          'Proposta da IA e composição revisadas e aceitas pelo profissional; aguardando confirmação de gravação.',
      })),
    ],
  };
}
