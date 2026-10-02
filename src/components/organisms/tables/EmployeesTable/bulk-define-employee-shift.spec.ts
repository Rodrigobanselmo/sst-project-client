/**
 * npx tsx src/components/organisms/tables/EmployeesTable/bulk-define-employee-shift.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const table = readFileSync(join(dir, 'EmployeesTable.tsx'), 'utf8');
const modal = readFileSync(join(dir, 'BulkDefineEmployeeShiftModal.tsx'), 'utf8');
const mutation = readFileSync(
  join(
    dir,
    '../../../../core/services/hooks/mutations/manager/useMutBulkUpdateEmployeeShift/index.ts',
  ),
  'utf8',
);

assert.match(table, /TableCheckSelectAll/);
assert.match(table, /Definir turno/);
assert.match(table, /página atual/);
assert.match(table, /onToggleAll\(pageIds\)/);
assert.match(table, /useMutBulkUpdateEmployeeShift/);
assert.match(modal, /Sem turno/);
assert.match(modal, /onConfirm\(value === '' \? null : Number\(value\)\)/);
assert.match(mutation, /\/bulk\/shift/);
assert.match(mutation, /shiftId: number \| null/);
assert.doesNotMatch(table, /selecionar todos os resultados/);
assert.doesNotMatch(mutation, /calculateSuggestedResidualProbability/);

console.log('bulk-define-employee-shift.spec: ok');
