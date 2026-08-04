/**
 * Contrato — painel de sanitização do organograma.
 *
 * Executar:
 * npx tsx src/components/organisms/modals/ModalHierarchySanitization/hierarchy-sanitization.spec.ts
 */
import assert from 'node:assert/strict';
import type {
  HierarchySanitizationBulkResponse,
  HierarchySanitizationItem,
} from './hierarchy-sanitization.types';
import {
  buildSanitizationBulkConfirmMessage,
  buildSingleDeleteConfirmMessage,
  countDeleteCalls,
  formatDependencySummary,
  formatTypeLabelLines,
  mergeEligibleSelection,
  pruneSelectionAfterReload,
  SANITIZATION_TABLE_COL_WIDTHS,
  SANITIZATION_TABLE_LAYOUT,
} from './hierarchy-sanitization.utils';

const preview: HierarchySanitizationBulkResponse = {
  requested: 5,
  located: 4,
  eligible: 3,
  blocked: 1,
  ignored: 1,
  eligibleOffices: 1,
  eligibleDeveloped: 2,
  deleted: 0,
  dryRun: true,
  items: [],
};

const msg = buildSanitizationBulkConfirmMessage(preview);
assert.ok(msg.includes('3 cargo(s) aptos'));
assert.ok(msg.includes('vínculo complementar com o cargo desenvolvido'));

const subWithDetach: HierarchySanitizationItem = {
  hierarchyId: 's1',
  name: 'Desenvolvido',
  type: 'SUB_OFFICE',
  typeLabel: 'Cargo desenvolvido',
  parentId: null,
  parentName: null,
  path: 'X › Desenvolvido',
  status: 'ELIGIBLE',
  reason: 'Apto: empregado associado...',
  activeEmployees: 2,
  historicalEmployees: 0,
  childrenCount: 0,
  homoLinkCount: 0,
  currentRiskCount: 0,
  historicalRiskCount: 0,
  directCurrentRiskCount: 0,
  directHistoricalRiskCount: 0,
  inheritedCurrentRiskCount: 0,
  inheritedHistoricalRiskCount: 0,
  examHistoryCount: 0,
  employeesMissingPrimaryRoleCount: 0,
  requiresEmployeeDetach: true,
  reviewStatus: 'PENDING',
  review: null,
};

assert.ok(
  buildSingleDeleteConfirmMessage(subWithDetach).includes(
    'vínculo complementar',
  ),
);

const blocked: HierarchySanitizationItem = {
  ...subWithDetach,
  hierarchyId: 'b',
  status: 'BLOCKED',
  reason: 'Bloqueado: vinculado a elemento',
  homoLinkCount: 1,
  requiresEmployeeDetach: false,
};

const page = [
  { ...subWithDetach, hierarchyId: 'a', requiresEmployeeDetach: false },
  blocked,
];

assert.deepEqual(mergeEligibleSelection([], page, true), ['a']);
assert.deepEqual(pruneSelectionAfterReload(['a', 'b', 'c'], page), ['a', 'c']);

const summary = formatDependencySummary(blocked);
assert.ok(summary.includes('HOH 1'));
assert.ok(summary.includes('Dir 0'));
assert.ok(summary.includes('Elem 0'));
assert.ok(summary.includes('Emp 1') || summary.includes('Emp 2'));

// Layout estrutural — coluna seleção separada + Tipo compacto + Nome prioritário
assert.equal(SANITIZATION_TABLE_COL_WIDTHS.selection, '3%');
assert.ok(
  Object.prototype.hasOwnProperty.call(SANITIZATION_TABLE_COL_WIDTHS, 'selection'),
  'deve existir coluna exclusiva de seleção',
);
assert.deepEqual(formatTypeLabelLines('SUB_OFFICE'), ['Cargo', 'desenvolvido']);
assert.deepEqual(formatTypeLabelLines('OFFICE'), ['Cargo']);
assert.equal(
  formatTypeLabelLines('SUB_OFFICE').length,
  2,
  'SUB_OFFICE deve quebrar em duas linhas explícitas',
);
assert.ok(formatTypeLabelLines('SUB_OFFICE')[0] === 'Cargo');
assert.ok(formatTypeLabelLines('SUB_OFFICE')[1] === 'desenvolvido');
assert.equal(SANITIZATION_TABLE_COL_WIDTHS.type, '7%');
assert.ok(SANITIZATION_TABLE_LAYOUT.typeMaxPx <= 72);
assert.equal(SANITIZATION_TABLE_COL_WIDTHS.name, '26%');
const namePct = parseFloat(SANITIZATION_TABLE_COL_WIDTHS.name);
const pathPct = parseFloat(SANITIZATION_TABLE_COL_WIDTHS.path);
const depsPct = parseFloat(SANITIZATION_TABLE_COL_WIDTHS.deps);
const statusPct = parseFloat(SANITIZATION_TABLE_COL_WIDTHS.status);
const actionsPct = parseFloat(SANITIZATION_TABLE_COL_WIDTHS.actions);
assert.ok(namePct > pathPct, 'Nome deve ser mais largo que Caminho');
assert.ok(namePct > depsPct, 'Nome deve ser mais largo que Dependências');
assert.ok(namePct > statusPct && namePct > actionsPct);
assert.ok(
  SANITIZATION_TABLE_LAYOUT.namePaddingLeftPx >= 8 &&
    SANITIZATION_TABLE_LAYOUT.namePaddingLeftPx <= 12,
);
assert.equal(
  SANITIZATION_TABLE_LAYOUT.tableMinWidth,
  0,
  'sem minWidth excessivo que force scroll horizontal',
);
const totalPct = Object.values(SANITIZATION_TABLE_COL_WIDTHS)
  .map((v) => parseFloat(v))
  .reduce((a, b) => a + b, 0);
assert.ok(Math.abs(totalPct - 100) < 0.01, `colunas somam ${totalPct}%`);

// Regressão toast duplo: uma ação = uma chamada
assert.equal(countDeleteCalls([1]), 1);
assert.equal(countDeleteCalls([1, 0]), 1);
assert.notEqual(countDeleteCalls([1, 1]), 1);

console.log('hierarchy-sanitization.spec.ts: OK');
