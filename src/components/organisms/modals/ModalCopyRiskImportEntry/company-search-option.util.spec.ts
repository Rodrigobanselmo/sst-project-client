/**
 * npx tsx src/components/organisms/modals/ModalCopyRiskImportEntry/company-search-option.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { stringifyCompanySearchOption } from './company-search-option.util';

const planlink = stringifyCompanySearchOption({
  id: 'c1',
  name: 'PLANLINK SERVICOS LTDA',
  fantasy: 'Planlink',
  initials: 'PLK',
  cnpj: '123',
} as any);

assert.equal(planlink.includes('Planlink'), true);
assert.equal(planlink.includes('PLANLINK SERVICOS LTDA'), true);
assert.equal(planlink.toLowerCase().includes('planl'), true);

const modalSource = readFileSync(resolve(__dirname, 'index.tsx'), 'utf8');
assert.equal(modalSource.includes('useQueryCompanies'), true);
assert.equal(modalSource.includes('search: companySearch'), true);
assert.equal(modalSource.includes('onInputChange'), true);
assert.equal(modalSource.includes("reason === 'reset'"), true);
assert.equal(modalSource.includes('getCompanyName'), true);
assert.equal(modalSource.includes('stringifyCompanySearchOption'), true);
assert.equal(modalSource.includes('ignoreCase: true'), true);
assert.equal(modalSource.includes('handleCompanySearchChange'), true);
assert.equal(modalSource.includes('inputValue={companyInputValue}'), true);
assert.equal(
  modalSource.includes('stringify: stringifyCompanySearchOption'),
  true,
);

console.log('company-search-option.util.spec.ts ok');
