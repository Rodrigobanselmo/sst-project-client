/**
 * Executar:
 * npx tsx src/components/organisms/tagSelects/HierarchySelect/hierarchy-select-presentation.util.spec.ts
 */
import assert from 'node:assert/strict';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import { hierarchyFilter } from './constants/filters';
import {
  formatHierarchySelectItemLabel,
  getHierarchySelectChipFilters,
  getHierarchySelectEmptyMessage,
  HIERARCHY_SELECT_EMPTY_OPTION_ID,
  isHierarchySelectEmptyOptionId,
  matchesHierarchySelectListItem,
} from './hierarchy-select-presentation.util';

const allTypes = hierarchyFilter.map((item) => item.filter);
const SEFAZ_LABELS = {
  [HierarchyEnum.DIRECTORY]: 'Superintendência',
  [HierarchyEnum.MANAGEMENT]: 'Diretoria',
  [HierarchyEnum.SECTOR]: 'Setor',
  [HierarchyEnum.SUB_SECTOR]: 'Subsetor',
  [HierarchyEnum.OFFICE]: 'Cargo',
  [HierarchyEnum.SUB_OFFICE]: 'Cargo desenvolvido',
};

assert.deepEqual(
  getHierarchySelectChipFilters().map((item) => item.filter),
  [
    HierarchyEnum.DIRECTORY,
    HierarchyEnum.MANAGEMENT,
    HierarchyEnum.SECTOR,
    HierarchyEnum.SUB_SECTOR,
    HierarchyEnum.OFFICE,
    HierarchyEnum.SUB_OFFICE,
  ],
  'sem filterOptions → 6 chips canônicos',
);

assert.equal(
  getHierarchySelectChipFilters().length,
  6,
  'sempre 6 chips mesmo sem registros no payload',
);

assert.deepEqual(
  allTypes,
  getHierarchySelectChipFilters().map((item) => item.filter),
);

assert.deepEqual(
  getHierarchySelectChipFilters().map((item) => item.label),
  [
    'diretoria',
    'gerência',
    'setor',
    'subsetor',
    'cargo',
    'cargo desenvolvido',
  ],
  'empresa sem override → chips canônicos',
);

assert.deepEqual(
  getHierarchySelectChipFilters(undefined, SEFAZ_LABELS).map((item) => item.label),
  [
    'superintendência',
    'diretoria',
    'setor',
    'subsetor',
    'cargo',
    'cargo desenvolvido',
  ],
  'SEFAZ-like → chips resolvidos',
);

assert.deepEqual(
  getHierarchySelectChipFilters([HierarchyEnum.OFFICE]).map((item) => item.filter),
  [HierarchyEnum.OFFICE],
  'filterOptions explícito continua recortando',
);

assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.DIRECTORY),
  'Nenhuma diretoria cadastrada',
);
assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.MANAGEMENT),
  'Nenhuma gerência cadastrada',
);
assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.DIRECTORY, SEFAZ_LABELS),
  'Nenhuma superintendência cadastrada',
);
assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.MANAGEMENT, SEFAZ_LABELS),
  'Nenhuma diretoria cadastrada',
);
assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.SECTOR),
  'Nenhum setor cadastrado',
);
assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.SUB_SECTOR),
  'Nenhum subsetor cadastrado',
);
assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.OFFICE),
  'Nenhum cargo cadastrado',
);
assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.SUB_OFFICE),
  'Nenhum cargo desenvolvido cadastrado',
);

assert.equal(
  formatHierarchySelectItemLabel(
    HierarchyEnum.DIRECTORY,
    'SAT — Superintendência de Administração Tributária',
  ),
  '(Diretoria) SAT — Superintendência de Administração Tributária',
);
assert.equal(
  formatHierarchySelectItemLabel(
    HierarchyEnum.DIRECTORY,
    'SAT — Superintendência de Administração Tributária',
    SEFAZ_LABELS,
  ),
  '(Superintendência) SAT — Superintendência de Administração Tributária',
);
assert.equal(
  formatHierarchySelectItemLabel(HierarchyEnum.MANAGEMENT, 'Gerência Geral'),
  '(Gerência) Gerência Geral',
);
assert.equal(
  formatHierarchySelectItemLabel(
    HierarchyEnum.OFFICE,
    'Auditor Fiscal',
    SEFAZ_LABELS,
  ),
  '(Cargo) Auditor Fiscal',
);
assert.equal(
  formatHierarchySelectItemLabel(
    HierarchyEnum.SUB_OFFICE,
    'Função complementar',
  ),
  '(Cargo desenvolvido) Função complementar',
);

assert.equal(isHierarchySelectEmptyOptionId(HIERARCHY_SELECT_EMPTY_OPTION_ID), true);
assert.equal(isHierarchySelectEmptyOptionId('real-id'), false);

assert.equal(
  matchesHierarchySelectListItem({
    type: HierarchyEnum.OFFICE,
    activeType: HierarchyEnum.OFFICE,
  }),
  true,
  'sem workspaceId → não filtra',
);
assert.equal(
  matchesHierarchySelectListItem({
    type: HierarchyEnum.OFFICE,
    activeType: HierarchyEnum.OFFICE,
    workspaceId: 'ws-1',
    workspaceIds: ['ws-1', 'ws-2'],
  }),
  true,
);
assert.equal(
  matchesHierarchySelectListItem({
    type: HierarchyEnum.OFFICE,
    activeType: HierarchyEnum.OFFICE,
    workspaceId: 'ws-1',
    workspaceIds: ['ws-2'],
  }),
  false,
);
assert.equal(
  matchesHierarchySelectListItem({
    type: HierarchyEnum.OFFICE,
    activeType: HierarchyEnum.OFFICE,
    workspaceId: 'ws-1',
    workspaceIds: [],
  }),
  false,
  'workspaceIds vazio continua excluindo',
);
assert.equal(
  matchesHierarchySelectListItem({
    type: HierarchyEnum.OFFICE,
    activeType: HierarchyEnum.OFFICE,
    workspaceId: 'ws-1',
    workspaceIds: null,
  }),
  true,
  'metadata incompleta continua fail-open',
);

console.log('hierarchy-select-presentation.util.spec.ts ok');
