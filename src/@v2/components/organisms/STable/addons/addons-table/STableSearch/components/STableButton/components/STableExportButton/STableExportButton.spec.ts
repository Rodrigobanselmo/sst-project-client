/**
 * npx tsx src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton.tsx',
  ),
  'utf8',
);

assert.match(source, /menuItems/);
assert.match(source, /finally \{\s*setIsLoading\(false\);/s);
assert.match(source, /if \(isLoading\) return/);
assert.match(source, /if \(!onClick\) return/);
assert.match(source, /catch \{/);
assert.match(source, /text=\{\s*text \?\? 'Exportar'\s*\}/);

console.log('STableExportButton.spec.ts ok');
