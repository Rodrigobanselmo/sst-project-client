import {
  CANONICAL_HIERARCHY_TYPE_LABELS,
  isSupportedHierarchyType,
} from 'core/constants/maps/hierarchy-type-labels';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import { hierarchyLegendItems } from '../constants/hierarchy-node-visual.constant';
import { nodeTypesConstant } from '../constants/node-type.constant';
import { TreeTypeEnum } from '../enums/tree-type.enums';

const STRUCTURAL_TREE_TYPE_LABELS: Partial<Record<TreeTypeEnum, string>> = {
  [TreeTypeEnum.COMPANY]: 'Empresa',
  [TreeTypeEnum.ESTABLISHMENT_GROUP]: 'Grupo de estabelecimentos',
  [TreeTypeEnum.WORKSPACE]: 'Estabelecimento',
};

export function resolveHierarchyNodeTypeLabel(
  type: TreeTypeEnum | HierarchyEnum,
  labels?: Partial<Record<HierarchyEnum, string>> | null,
) {
  if (type in STRUCTURAL_TREE_TYPE_LABELS) {
    return STRUCTURAL_TREE_TYPE_LABELS[type as TreeTypeEnum] as string;
  }

  if (isSupportedHierarchyType(type)) {
    return labels?.[type] || CANONICAL_HIERARCHY_TYPE_LABELS[type];
  }

  return nodeTypesConstant[type as TreeTypeEnum]?.name;
}

export function resolveHierarchyLegendItems(
  labels?: Partial<Record<HierarchyEnum, string>> | null,
) {
  return hierarchyLegendItems.map((item) => ({
    ...item,
    label: resolveHierarchyNodeTypeLabel(item.type, labels),
  }));
}
