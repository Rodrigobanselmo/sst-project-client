/**
 * npx tsx src/components/organisms/modals/ModalSelectHierarchy/gse-cargo-membership.util.spec.ts
 */
import assert from 'node:assert/strict';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';

import {
  buildGseMembershipByHierarchyId,
  formatGseMembershipIconTooltip,
  sliceGseMembershipIndicators,
} from './gse-cargo-membership.util';

const ghos = [
  {
    id: 'gse-1',
    name: 'GSE CONTRATOS 01 — Administrativo',
    workspaceIds: ['ws-a'],
    workspaces: [{ id: 'ws-a' }],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-a', workspaceId: 'ws-a', endDate: null },
    ],
  },
  {
    id: 'gse-2',
    name: 'GSE CONTRATOS 02 — Manutenção',
    workspaceIds: ['ws-a'],
    workspaces: [{ id: 'ws-a' }],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-a', workspaceId: 'ws-a', endDate: null },
      { hierarchyId: 'cargo-none', workspaceId: 'ws-a', endDate: new Date() },
    ],
  },
  {
    id: 'gse-3',
    name: 'GSE CONTRATOS 03 — Projetos',
    workspaceIds: ['ws-a'],
    workspaces: [{ id: 'ws-a' }],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-a', workspaceId: '', endDate: null },
    ],
  },
  {
    id: 'gse-other-ws',
    name: 'GSE Formosa',
    workspaceIds: ['ws-b'],
    workspaces: [{ id: 'ws-b' }],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-a', workspaceId: 'ws-b', endDate: null },
    ],
  },
  {
    id: 'env-1',
    name: 'Ambiente X',
    type: HomoTypeEnum.ENVIRONMENT,
    workspaceIds: ['ws-a'],
    workspaces: [{ id: 'ws-a' }],
    environment: { id: 'env', name: 'Ambiente X', type: 'GENERAL' },
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-a', workspaceId: 'ws-a', endDate: null },
    ],
  },
  {
    id: 'gse-empty',
    name: 'GSE vazio',
    workspaceIds: ['ws-a'],
    workspaces: [{ id: 'ws-a' }],
    hierarchyOnHomogeneous: [],
    hierarchies: [],
  },
] as unknown as IGho[];

const byHierarchy = buildGseMembershipByHierarchyId(ghos, 'ws-a');

assert.equal(byHierarchy.has('cargo-none'), false, 'vínculo encerrado não conta');
assert.equal(byHierarchy.has('missing'), false);

const cargoA = byHierarchy.get('cargo-a') || [];
assert.deepEqual(
  cargoA.map((item) => item.id),
  ['gse-1', 'gse-2', 'gse-3'],
);
assert.equal(
  cargoA.some((item) => item.id === 'gse-1'),
  true,
  'GSE atual permanece entre os indicadores',
);
assert.equal(
  cargoA.some((item) => item.id === 'gse-other-ws' || item.id === 'env-1'),
  false,
);

const none = buildGseMembershipByHierarchyId(ghos, 'ws-a').get('cargo-livre');
assert.equal(none, undefined);

const sliced = sliceGseMembershipIndicators([
  { id: '1', name: 'A' },
  { id: '2', name: 'B' },
  { id: '3', name: 'C' },
  { id: '4', name: 'D' },
]);
assert.equal(sliced.visible.length, 3);
assert.deepEqual(sliced.overflowNames, ['D']);
assert.equal(
  formatGseMembershipIconTooltip(sliced.visible[2], sliced.overflowNames),
  'C\n+ 1 outros: D',
);
assert.equal(formatGseMembershipIconTooltip({ id: '1', name: 'A' }), 'A');

console.log('gse-cargo-membership.util.spec.ts ok');
