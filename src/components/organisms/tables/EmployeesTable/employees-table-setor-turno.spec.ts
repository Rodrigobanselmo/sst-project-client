/**
 * npx tsx src/components/organisms/tables/EmployeesTable/employees-table-setor-turno.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(__dirname);
const table = readFileSync(join(dir, 'EmployeesTable.tsx'), 'utf8');
const types = readFileSync(join(dir, 'employeeTable.types.ts'), 'utf8');

assert.match(types, /'setor'/);
assert.match(types, /'turno'/);
assert.match(types, /'SHIFT'/);
assert.match(table, /id: 'setor'/);
assert.match(table, /id: 'turno'/);
assert.match(table, /sortField: 'SHIFT'/);
const setorBlock = table.slice(table.indexOf("id: 'setor'"), table.indexOf("id: 'cargo'"));
assert.doesNotMatch(setorBlock, /sortField/);
assert.match(table, /sectorHierarchy\?\.name/);
assert.match(table, /Sem turno/);
assert.match(table, /employee\.shift\?\.name/);
assert.doesNotMatch(table, /FilterFieldEnum\.(SECTOR|SHIFT|TURNO)/);

console.log('employees-table-setor-turno.spec: ok');
