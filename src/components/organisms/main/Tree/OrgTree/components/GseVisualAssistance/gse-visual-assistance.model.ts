import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import type { IGho } from 'core/interfaces/api/IGho';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import type { ITreeMap } from '../../interfaces';
import { getWorkspaceIdFromTreeNode } from '../../utils/get-org-workspace-id';

export type ReviewState = 'pending' | 'accepted' | 'rejected';
export type VisualProposal = {
  id: string;
  sector: string;
  name: string;
  targetId: string | null;
  roleIds: string[];
  state: ReviewState;
  reason: string;
};
export type VisualAnalysis = {
  companyId: string;
  workspaceId: string;
  signature: string;
  guidance: string;
  roles: {
    id: string;
    name: string;
    sector: string;
    existingIds: string[];
    inheritedIds: string[];
  }[];
  groups: { id: string; name: string }[];
  proposals: VisualProposal[];
};
export const ASSISTANCE_STATES = {
  existing: {
    label: 'Vínculo cadastrado',
    color: '#1D4ED8',
    background: '#DBEAFE',
  },
  pending: {
    label: 'Sugestão pendente',
    color: '#6D28D9',
    background: '#EDE9FE',
  },
  accepted: {
    label: 'Aceita nesta revisão',
    color: '#166534',
    background: '#DCFCE7',
  },
  rejected: {
    label: 'Rejeitada nesta revisão',
    color: '#991B1B',
    background: '#FEE2E2',
  },
  review: {
    label: 'Exige revisão técnica',
    color: '#854D0E',
    background: '#FEF9C3',
  },
} as const;

const isRole = (type: TreeTypeEnum) =>
  type === TreeTypeEnum.OFFICE || type === TreeTypeEnum.SUB_OFFICE;
const belongs = (g: IGho, companyId: string, workspaceId: string) =>
  g.companyId === companyId &&
  (g.type == null || g.type === HomoTypeEnum.GSE) &&
  g.status === 'ACTIVE' &&
  (g.workspaceIds?.includes(workspaceId) ||
    g.workspaces?.some((w) => w.id === workspaceId));

/** Only analysis data, not expansion/search/zoom, invalidates a review. No mutation or I/O. */
export function visualScopeSignature(
  nodes: ITreeMap,
  companyId: string,
  workspaceId: string,
): string {
  return JSON.stringify([
    companyId,
    workspaceId,
    Object.values(nodes)
      .filter((n) => getWorkspaceIdFromTreeNode(n) === workspaceId)
      .map((n) => [
        String(n.id),
        n.parentId,
        n.type,
        n.label,
        n.realDescription || n.description || '',
        (n.ghos || [])
          .map((g) => [
            g.id,
            g.name,
            g.companyId,
            g.type,
            g.status,
            g.workspaceIds,
            g.workspaces?.map((w) => w.id),
          ])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
      ])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  ]);
}

/** Structural candidates only: sharing a sector NEVER establishes homogeneous exposure.
 * Free text is retained for human review; it is not interpreted as a model instruction.
 */
export function analyzeVisualGseScope(
  nodes: ITreeMap,
  companyId: string,
  workspaceId: string,
  guidance: string,
  identities: { temporaryId: string; groupId: string }[] = [],
): VisualAnalysis {
  const groups = new Map<string, { id: string; name: string }>();
  const scoped = Object.values(nodes).filter(
    (n) =>
      workspaceId &&
      getWorkspaceIdFromTreeNode(n) === workspaceId &&
      !n.showRef,
  );
  for (const node of scoped)
    for (const g of node.ghos || [])
      if (belongs(g, companyId, workspaceId))
        groups.set(g.id, { id: g.id, name: g.name });
  const roles = scoped
    .filter((n) => isRole(n.type))
    .map((n) => {
      const inherited = new Set<string>();
      const visited = new Set([String(n.id)]);
      let parent = n.parentId == null ? undefined : nodes[n.parentId];
      let sector = 'Sem setor identificado';
      let sectorFound = false;
      while (parent && !visited.has(String(parent.id))) {
        visited.add(String(parent.id));
        if (getWorkspaceIdFromTreeNode(parent) !== workspaceId) break;
        if (!sectorFound && parent.type === TreeTypeEnum.SECTOR) {
          sector = parent.label;
          sectorFound = true;
        }
        for (const g of parent.ghos || [])
          if (belongs(g, companyId, workspaceId)) inherited.add(g.id);
        parent = parent.parentId == null ? undefined : nodes[parent.parentId];
      }
      const existingIds = (n.ghos || [])
        .filter((g) => belongs(g, companyId, workspaceId))
        .map((g) => g.id);
      return {
        id: String(n.id),
        name: n.label,
        sector,
        existingIds: [...new Set(existingIds)],
        inheritedIds: [...inherited],
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  // Use the actual sector identity, not its name: equally named sectors must not be merged.
  const buckets = new Map<string, typeof roles>();
  for (const role of roles) {
    let node = nodes[role.id];
    const seen = new Set<string>();
    let sectorId = role.id;
    while (
      node &&
      !seen.has(String(node.id)) &&
      getWorkspaceIdFromTreeNode(node) === workspaceId
    ) {
      seen.add(String(node.id));
      if (node.type === TreeTypeEnum.SECTOR) {
        sectorId = String(node.id);
        break;
      }
      node = nodes[String(node.parentId)];
    }
    const bucket = buckets.get(sectorId) || [];
    bucket.push(role);
    buckets.set(sectorId, bucket);
  }
  const proposals: VisualProposal[] = [];
  for (const [id, bucket] of buckets) {
    const related = [
      ...new Set(bucket.flatMap((r) => [...r.existingIds, ...r.inheritedIds])),
    ];
    const proven = [
      ...new Set(
        identities
          .filter((entry) => entry.temporaryId === `@visual-gse:${id}`)
          .map((entry) => entry.groupId),
      ),
    ];
    if (proven.length > 1)
      throw new Error(
        'Há mais de um GSE associado à mesma origem estrutural. Confirme o destino antes de continuar.',
      );
    const targetId = proven[0] || (related.length === 1 ? related[0] : null);
    const uncovered = bucket.filter((r) =>
      targetId
        ? !r.existingIds.includes(targetId) &&
          !r.inheritedIds.includes(targetId)
        : !r.existingIds.length && !r.inheritedIds.length,
    );
    if (!uncovered.length) continue;
    proposals.push({
      id,
      sector: bucket[0].sector,
      name: `GSE — ${bucket[0].sector === 'Sem setor identificado' ? uncovered[0].name : bucket[0].sector}`,
      targetId,
      roleIds: uncovered.map((r) => r.id),
      state: 'pending',
      reason:
        proven.length === 1
          ? 'GSE criado anteriormente pela assistência para esta origem estrutural. Revise os vínculos ainda não atendidos; a estrutura não comprova exposição equivalente.'
          : targetId
            ? 'Há um GSE cadastrado em cargos ou unidades deste setor. Avalie se os cargos sem vínculo podem reutilizá-lo; a estrutura não comprova exposição equivalente.'
            : 'Cargos sem vínculo exibido foram separados pelo setor estrutural. É um candidato para revisão, sem evidência suficiente de exposição homogênea. Nomes semelhantes não foram usados como critério.',
    });
  }
  return {
    companyId,
    workspaceId,
    signature: visualScopeSignature(nodes, companyId, workspaceId),
    guidance,
    roles,
    groups: [...groups.values()].sort((a, b) => a.name.localeCompare(b.name)),
    proposals,
  };
}

export function reviseVisualProposal(
  analysis: VisualAnalysis,
  id: string,
  patch: Partial<
    Pick<VisualProposal, 'name' | 'targetId' | 'roleIds' | 'state'>
  >,
): VisualAnalysis {
  const p = analysis.proposals.find((p) => p.id === id);
  if (!p) throw Error('Proposta não encontrada.');
  if (patch.targetId && !analysis.groups.some((g) => g.id === patch.targetId))
    throw Error('GSE fora do estabelecimento analisado.');
  if (patch.roleIds?.some((id) => !analysis.roles.some((r) => r.id === id)))
    throw Error('Cargo fora do estabelecimento analisado.');
  const next = {
    ...p,
    ...patch,
    roleIds: [...new Set(patch.roleIds || p.roleIds)],
  };
  // Editing an accepted composition requires explicit acceptance again.
  if (
    patch.name !== undefined ||
    patch.targetId !== undefined ||
    patch.roleIds !== undefined
  )
    next.state = 'pending';
  const targetName = next.targetId
    ? analysis.groups.find((g) => g.id === next.targetId)?.name
    : next.name;
  if (
    next.state === 'accepted' &&
    (!next.roleIds.length || !targetName?.trim())
  )
    throw Error('Informe o destino e selecione ao menos um cargo.');
  return {
    ...analysis,
    proposals: analysis.proposals.map((old) => (old.id === id ? next : old)),
  };
}
