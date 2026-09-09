import assert from 'node:assert/strict';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import { hierarchyFilter } from './constants/filters';
import {
  getHierarchySelectChipFilters,
  getHierarchySelectEmptyMessage,
  HIERARCHY_SELECT_EMPTY_OPTION_ID,
  isHierarchySelectEmptyOptionId,
} from './hierarchy-select-presentation.util';

const allTypes = hierarchyFilter.map((item) => item.filter);

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

assert.deepEqual(allTypes, getHierarchySelectChipFilters().map((item) => item.filter));

assert.deepEqual(
  getHierarchySelectChipFilters([HierarchyEnum.OFFICE]).map((item) => item.filter),
  [HierarchyEnum.OFFICE],
  'filterOptions explícito continua recortando',
);

assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.DIRECTORY),
  'Nenhuma superintendência cadastrada',
);
assert.equal(
  getHierarchySelectEmptyMessage(HierarchyEnum.MANAGEMENT),
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

assert.equal(isHierarchySelectEmptyOptionId(HIERARCHY_SELECT_EMPTY_OPTION_ID), true);
assert.equal(isHierarchySelectEmptyOptionId('real-id'), false);

console.log('hierarchy-select-presentation.util.spec.ts ok');
