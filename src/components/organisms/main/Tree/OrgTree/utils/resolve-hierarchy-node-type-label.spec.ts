/**
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/utils/resolve-hierarchy-node-type-label.spec.ts
 */
import assert from 'node:assert/strict';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import {
  resolveHierarchyLegendItems,
  resolveHierarchyNodeTypeLabel,
} from './resolve-hierarchy-node-type-label';

const SEFAZ_LABELS = {
  [HierarchyEnum.DIRECTORY]: 'Superintendência',
  [HierarchyEnum.MANAGEMENT]: 'Diretoria',
};

assert.equal(
  resolveHierarchyNodeTypeLabel(TreeTypeEnum.DIRECTORY),
  'Diretoria',
);
assert.equal(
  resolveHierarchyNodeTypeLabel(TreeTypeEnum.MANAGEMENT),
  'Gerência',
);
assert.equal(
  resolveHierarchyNodeTypeLabel(TreeTypeEnum.DIRECTORY, SEFAZ_LABELS),
  'Superintendência',
);
assert.equal(
  resolveHierarchyNodeTypeLabel(TreeTypeEnum.MANAGEMENT, SEFAZ_LABELS),
  'Diretoria',
);
assert.equal(
  resolveHierarchyNodeTypeLabel(TreeTypeEnum.OFFICE, SEFAZ_LABELS),
  'Cargo',
);
assert.equal(
  resolveHierarchyNodeTypeLabel(TreeTypeEnum.SUB_OFFICE),
  'Cargo desenvolvido',
);
assert.equal(
  resolveHierarchyNodeTypeLabel(TreeTypeEnum.COMPANY, SEFAZ_LABELS),
  'Empresa',
);
assert.equal(
  resolveHierarchyNodeTypeLabel(TreeTypeEnum.WORKSPACE, SEFAZ_LABELS),
  'Estabelecimento',
);

const legend = resolveHierarchyLegendItems(SEFAZ_LABELS);
assert.equal(legend.length, 8);
assert.equal(
  legend.find((item) => item.type === TreeTypeEnum.DIRECTORY)?.label,
  'Superintendência',
);
assert.equal(
  legend.find((item) => item.type === TreeTypeEnum.MANAGEMENT)?.label,
  'Diretoria',
);
assert.equal(
  legend.find((item) => item.type === TreeTypeEnum.COMPANY)?.label,
  'Empresa',
);

const canonicalLegend = resolveHierarchyLegendItems();
assert.equal(
  canonicalLegend.find((item) => item.type === TreeTypeEnum.DIRECTORY)?.label,
  'Diretoria',
);

console.log('resolve-hierarchy-node-type-label.spec.ts ok');
