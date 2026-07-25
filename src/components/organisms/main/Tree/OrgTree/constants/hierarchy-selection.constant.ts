import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMapObject } from '../interfaces';

export const HIERARCHY_SELECTION_PROTECTED_TYPES = [
  TreeTypeEnum.COMPANY,
  TreeTypeEnum.WORKSPACE,
] as const;

export const hierarchyTypePtLabels: Partial<Record<string, string>> = {
  [HierarchyEnum.DIRECTORY]: 'diretória',
  [HierarchyEnum.MANAGEMENT]: 'gerência',
  [HierarchyEnum.SECTOR]: 'setor',
  [HierarchyEnum.SUB_SECTOR]: 'subsetor',
  [HierarchyEnum.OFFICE]: 'cargo',
  [HierarchyEnum.SUB_OFFICE]: 'cargo desenvolvido',
};

export const isHierarchyNodeSelectable = (node?: ITreeMapObject | null) => {
  if (!node || node.showRef) return false;
  if (
    HIERARCHY_SELECTION_PROTECTED_TYPES.includes(
      node.type as (typeof HIERARCHY_SELECTION_PROTECTED_TYPES)[number],
    )
  ) {
    return false;
  }
  return !!node.parentId;
};

export const toHierarchyApiId = (treeNodeId: string | number) =>
  String(treeNodeId).split('//')[0];

export const formatHierarchyTypeSummary = (
  typeSummary: Partial<Record<string, number>> = {},
) => {
  return Object.entries(typeSummary)
    .filter(([, count]) => !!count)
    .map(([type, count]) => {
      if (type === HierarchyEnum.SUB_OFFICE || type === 'SUB_OFFICE') {
        return `${count} ${
          count === 1 ? 'cargo desenvolvido' : 'cargos desenvolvidos'
        }`;
      }

      const label = hierarchyTypePtLabels[type] || type.toLowerCase();
      const plural =
        count === 1
          ? label
          : label.endsWith('r')
            ? `${label}es`
            : `${label}s`;
      return `${count} ${plural}`;
    });
};
