/**
 * Executar: npx tsx src/core/constants/maps/hierarchy-type-labels.spec.ts
 */
import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import {
  CANONICAL_HIERARCHY_TYPE_LABELS,
  resolveHierarchyTypeLabel,
  resolveHierarchyTypeLabelsFromCompany,
  resolveHierarchyTypeLabelsMap,
} from './hierarchy-type-labels';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function assertEqual(actual: unknown, expected: unknown, msg: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${msg}\nexpected: ${expectedJson}\nactual: ${actualJson}`);
  }
}

const SEFAZ_LABELS = {
  [HierarchyEnum.DIRECTORY]: 'Superintendência',
  [HierarchyEnum.MANAGEMENT]: 'Diretoria',
};

assert(
  resolveHierarchyTypeLabel(HierarchyEnum.DIRECTORY) === 'Diretoria',
  'fallback DIRECTORY',
);
assert(
  resolveHierarchyTypeLabel(HierarchyEnum.MANAGEMENT) === 'Gerência',
  'fallback MANAGEMENT',
);
assert(resolveHierarchyTypeLabel(HierarchyEnum.SECTOR) === 'Setor', 'fallback SECTOR');
assert(
  resolveHierarchyTypeLabel(HierarchyEnum.SUB_SECTOR) === 'Subsetor',
  'fallback SUB_SECTOR',
);
assert(resolveHierarchyTypeLabel(HierarchyEnum.OFFICE) === 'Cargo', 'fallback OFFICE');
assert(
  resolveHierarchyTypeLabel(HierarchyEnum.SUB_OFFICE) === 'Cargo desenvolvido',
  'fallback SUB_OFFICE',
);
assertEqual(
  resolveHierarchyTypeLabelsMap(),
  CANONICAL_HIERARCHY_TYPE_LABELS,
  'mapa canônico sem configuração',
);

assert(
  resolveHierarchyTypeLabel(HierarchyEnum.DIRECTORY, {
    DIRECTORY: 'Superintendência',
  }) === 'Superintendência',
  'override parcial DIRECTORY',
);
assert(
  resolveHierarchyTypeLabel(HierarchyEnum.MANAGEMENT, {
    DIRECTORY: 'Superintendência',
  }) === 'Gerência',
  'override parcial mantém MANAGEMENT canônico',
);

assertEqual(
  resolveHierarchyTypeLabelsMap(SEFAZ_LABELS),
  {
    ...CANONICAL_HIERARCHY_TYPE_LABELS,
    DIRECTORY: 'Superintendência',
    MANAGEMENT: 'Diretoria',
  },
  'mapa SEFAZ',
);

assertEqual(
  resolveHierarchyTypeLabelsFromCompany(undefined),
  CANONICAL_HIERARCHY_TYPE_LABELS,
  'company undefined',
);
assertEqual(
  resolveHierarchyTypeLabelsFromCompany(null),
  CANONICAL_HIERARCHY_TYPE_LABELS,
  'company null',
);
assertEqual(
  resolveHierarchyTypeLabelsFromCompany({} as any),
  CANONICAL_HIERARCHY_TYPE_LABELS,
  'company sem metadata',
);
assertEqual(
  resolveHierarchyTypeLabelsFromCompany({ metadata: {} }),
  CANONICAL_HIERARCHY_TYPE_LABELS,
  'metadata sem hierarchyTypeLabels',
);
assertEqual(
  resolveHierarchyTypeLabelsFromCompany({
    metadata: { hierarchyTypeLabels: SEFAZ_LABELS, shortName: 'SEFAZ' },
  }),
  {
    ...CANONICAL_HIERARCHY_TYPE_LABELS,
    DIRECTORY: 'Superintendência',
    MANAGEMENT: 'Diretoria',
  },
  'company SEFAZ via metadata',
);

console.log('hierarchy-type-labels.spec.ts ok');
