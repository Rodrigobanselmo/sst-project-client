/**
 * Executar:
 * npx tsx --tsconfig tsconfig.json src/components/organisms/modals/ModalTransferEmployeeHierarchy/employee-hierarchy-transfer.util.spec.ts
 */
import assert from 'node:assert/strict';

import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import {
  buildEmployeeHierarchyTransferPayload,
  getEmployeeTransferErrorMessage,
  getLatestHierarchyMovementStartDate,
  resolveCurrentEmployeeAllocation,
  suggestDestinationWorkspaceId,
} from './employee-hierarchy-transfer.util';

const workspaces = [
  { id: 'ws-a', name: 'Unidade A' },
  { id: 'ws-b', name: 'Unidade B' },
];

const tree = {
  'dir-1': {
    id: 'dir-1',
    name: 'Diretoria',
    type: HierarchyEnum.DIRECTORY,
    parentId: null,
    workspaceIds: ['ws-a'],
  },
  'sector-1': {
    id: 'sector-1',
    name: 'Produção',
    type: HierarchyEnum.SECTOR,
    parentId: 'dir-1',
    workspaceIds: ['ws-a'],
  },
  'office-1': {
    id: 'office-1',
    name: 'Operador',
    type: HierarchyEnum.OFFICE,
    parentId: 'sector-1',
    workspaceIds: ['ws-a'],
  },
  'office-shared': {
    id: 'office-shared',
    name: 'Técnico compartilhado',
    type: HierarchyEnum.OFFICE,
    parentId: 'sector-1',
    workspaceIds: ['ws-a', 'ws-b'],
    workspaces,
  },
};

const unique = resolveCurrentEmployeeAllocation({
  employee: {
    hierarchyId: 'office-1',
    subOffices: [{ name: 'Operador de linha' }],
  },
  hierarchyTree: tree,
  companyWorkspaces: workspaces,
});

assert.equal(unique.officeName, 'Operador');
assert.equal(unique.sectorName, 'Produção');
assert.deepEqual(unique.developedRoleNames, ['Operador de linha']);
assert.equal(unique.isSharedAcrossWorkspaces, false);
assert.deepEqual(
  unique.workspaces.map((item) => item.id),
  ['ws-a'],
);
assert.equal(unique.workspaces[0]?.name, 'Unidade A');

const shared = resolveCurrentEmployeeAllocation({
  employee: { hierarchyId: 'office-shared' },
  hierarchyTree: tree,
  companyWorkspaces: workspaces,
});

assert.equal(shared.isSharedAcrossWorkspaces, true);
assert.deepEqual(
  shared.workspaces.map((item) => item.id),
  ['ws-a', 'ws-b'],
);
assert.deepEqual(
  shared.workspaces.map((item) => item.name),
  ['Unidade A', 'Unidade B'],
);

const empty = resolveCurrentEmployeeAllocation({});
assert.equal(empty.hierarchyId, undefined);
assert.equal(empty.isSharedAcrossWorkspaces, false);
assert.deepEqual(empty.workspaces, []);
assert.deepEqual(empty.developedRoleNames, []);

const fromEmployeeNode = resolveCurrentEmployeeAllocation({
  employee: {
    hierarchy: {
      id: 'office-1',
      name: 'Operador',
      type: HierarchyEnum.OFFICE,
      parents: [{ id: 'sector-1', name: 'Produção', type: HierarchyEnum.SECTOR }],
      workspaceIds: ['ws-a'],
    },
    sectorHierarchy: { id: 'sector-1', name: 'Produção', type: HierarchyEnum.SECTOR },
  },
  companyWorkspaces: workspaces,
});
assert.equal(fromEmployeeNode.sectorName, 'Produção');
assert.equal(fromEmployeeNode.workspaces.length, 1);

const lastDate = getLatestHierarchyMovementStartDate([
  { startDate: '2026-01-10' },
  { startDate: '2026-03-02' },
  { startDate: '2025-12-01' },
]);
assert.equal(String(lastDate), '2026-03-02');

assert.equal(
  suggestDestinationWorkspaceId({
    currentWorkspaces: shared.workspaces,
    companyWorkspaces: workspaces,
  }),
  undefined,
  'cargo compartilhado não escolhe estabelecimento arbitrário',
);

assert.equal(
  suggestDestinationWorkspaceId({
    currentWorkspaces: unique.workspaces,
    companyWorkspaces: workspaces,
  }),
  'ws-a',
);

assert.equal(
  suggestDestinationWorkspaceId({
    currentWorkspaces: shared.workspaces,
    companyWorkspaces: [{ id: 'ws-a', name: 'Unidade A' }],
  }),
  'ws-a',
);

const payload = buildEmployeeHierarchyTransferPayload({
  employeeId: 12,
  hierarchyId: 'office-2',
  startDate: new Date(2026, 8, 15),
  motive: EmployeeHierarchyMotiveTypeEnum.TRANS,
  workspaceId: 'ws-b',
});
assert.deepEqual(payload, {
  employeeId: 12,
  hierarchyId: 'office-2',
  startDate: '15/09/2026',
  motive: EmployeeHierarchyMotiveTypeEnum.TRANS,
  workspaceId: 'ws-b',
});

const withSub = buildEmployeeHierarchyTransferPayload({
  employeeId: 12,
  hierarchyId: 'office-2',
  subOfficeId: 'sub-1',
  startDate: new Date(2026, 8, 15),
  motive: EmployeeHierarchyMotiveTypeEnum.PROM,
  workspaceId: 'ws-b',
});
assert.equal(withSub?.subOfficeId, 'sub-1');
assert.equal(
  Object.prototype.hasOwnProperty.call(
    buildEmployeeHierarchyTransferPayload({
      employeeId: 12,
      hierarchyId: 'office-2',
      startDate: new Date(2026, 8, 15),
      motive: EmployeeHierarchyMotiveTypeEnum.TRANS,
      workspaceId: 'ws-b',
    }),
    'subOfficeId',
  ),
  false,
);

assert.equal(
  buildEmployeeHierarchyTransferPayload({
    employeeId: 12,
    hierarchyId: 'office-2',
    startDate: new Date(2026, 8, 15),
    motive: EmployeeHierarchyMotiveTypeEnum.TRANS,
  }),
  null,
);

assert.equal(
  getEmployeeTransferErrorMessage({
    response: {
      data: { message: 'Já existe uma movimentação nesta data. Informe o dia seguinte' },
    },
  }),
  'Já existe uma movimentação nesta data. Informe o dia seguinte',
);
assert.equal(
  getEmployeeTransferErrorMessage({
    response: { data: { message: 'A data deve ser posterior à lotação atual' } },
  }),
  'A data deve ser posterior à lotação atual',
);
assert.equal(
  getEmployeeTransferErrorMessage({
    response: { data: { message: 'Existe uma movimentação posterior à data informada' } },
  }),
  'Existe uma movimentação posterior à data informada',
);
assert.equal(
  getEmployeeTransferErrorMessage({
    response: { data: { message: 'O funcionário já está lotado neste cargo' } },
  }),
  'O funcionário já está lotado neste cargo',
);
assert.equal(
  getEmployeeTransferErrorMessage({
    response: {
      data: {
        message: 'Existe uma demissão anterior. Faça a readmissão antes de transferir',
      },
    },
  }),
  'Existe uma demissão anterior. Faça a readmissão antes de transferir',
);
assert.equal(
  getEmployeeTransferErrorMessage({
    response: {
      data: { message: 'Não existe uma admissão anterior a esta movimentação' },
    },
  }),
  'Não existe uma admissão anterior a esta movimentação',
);
assert.equal(
  getEmployeeTransferErrorMessage({
    response: {
      data: {
        message: 'O cargo escolhido não pertence ao estabelecimento informado',
      },
    },
  }),
  'O cargo escolhido não pertence ao estabelecimento informado',
);
assert.equal(
  getEmployeeTransferErrorMessage({
    response: { data: { message: 'histórico bagunçado' } },
  }),
  'Não foi possível alterar a lotação',
);
assert.equal(
  getEmployeeTransferErrorMessage({}),
  'Não foi possível alterar a lotação',
);

console.log('employee-hierarchy-transfer.util.spec.ts ok');
