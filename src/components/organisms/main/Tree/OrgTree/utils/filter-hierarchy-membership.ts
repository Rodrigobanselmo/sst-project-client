import { isTechnicalGse } from 'components/organisms/tables/GhoAllTable/is-technical-gse.util';
import { isCharacterizableElementGho } from 'components/organisms/modals/ModalSelectHierarchy/characterization-cargo-membership.util';
import { TreeTypeEnum } from '../enums/tree-type.enums';
import type { ITreeMap, ITreeMapObject } from '../interfaces';
import { getWorkspaceIdFromTreeNode } from './get-org-workspace-id';

export type MembershipFilter = 'withGse' | 'withoutGse' | 'withElements' | 'withoutElements';
export const MEMBERSHIP_FILTERS: { key: MembershipFilter; label: string }[] = [
  { key: 'withGse', label: 'Com GSE' }, { key: 'withoutGse', label: 'Sem GSE' },
  { key: 'withElements', label: 'Com elementos caracterizáveis' }, { key: 'withoutElements', label: 'Sem elementos caracterizáveis' },
];
/** Read-only projection of saved links. Preview suggestions never enter this map. */
export function membershipHiddenIds(nodes: ITreeMap, hidden: ReadonlySet<MembershipFilter>, now = Date.now()): Set<string | number> {
  if (!hidden.size) return new Set();
  const excluded = new Set<string | number>();
  function matches(node: ITreeMapObject) {
    const workspaceId = getWorkspaceIdFromTreeNode(node);
    let gse = false, elements = false;
    const seen = new Set<string>();
    let current: ITreeMapObject | undefined = node;
    while (current && !seen.has(String(current.id))) {
      seen.add(String(current.id));
      const currentWorkspace = getWorkspaceIdFromTreeNode(current);
      if (currentWorkspace && workspaceId && currentWorkspace !== workspaceId) break;
      for (const group of current.ghos || []) {
        if (group.status && group.status !== 'ACTIVE') continue;
        if (group.workspaceIds?.length && workspaceId && !group.workspaceIds.includes(workspaceId)) continue;
        const links = group.hierarchyOnHomogeneous;
        if (links && !links.some(link => link.hierarchyId === String(current!.id).split('//')[0]
          && (!link.workspaceId || link.workspaceId === workspaceId) && !link.deletedAt
          && (!link.startDate || new Date(link.startDate).getTime() <= now)
          && (!link.endDate || new Date(link.endDate).getTime() > now))) continue;
        gse ||= isTechnicalGse(group);
        elements ||= isCharacterizableElementGho(group);
      }
      current = current.parentId == null ? undefined : nodes[current.parentId];
    }
    return !((gse ? hidden.has('withGse') : hidden.has('withoutGse'))
      || (elements ? hidden.has('withElements') : hidden.has('withoutElements')));
  }
  const memo = new Map<string, boolean>(), visiting = new Set<string>();
  function keep(id: string | number): boolean {
    const key = String(id), node = nodes[id];
    if (!node || node.hide || visiting.has(key)) return false;
    if (memo.has(key)) return memo.get(key)!;
    visiting.add(key);
    const children = node.childrenIds.filter(child => nodes[child] && !nodes[child].hide && child !== 'mock_id');
    const childVisible = children.map(keep).some(Boolean);
    const role = node.type === TreeTypeEnum.OFFICE || node.type === TreeTypeEnum.SUB_OFFICE;
    const visible = role ? matches(node) || childVisible : children.length ? childVisible : matches(node);
    visiting.delete(key); memo.set(key, visible);
    if (!visible) excluded.add(id);
    return visible;
  }
  Object.values(nodes).forEach(node => keep(node.id));
  return excluded;
}
