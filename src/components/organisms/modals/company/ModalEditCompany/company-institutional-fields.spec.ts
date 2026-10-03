/**
 * Pontual: Missão / Visão / Valores na aba Informações Adicionais do ModalEditCompany.
 *
 *   npx tsx src/components/organisms/modals/company/ModalEditCompany/company-institutional-fields.spec.ts
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(__dirname);

const logoStep = fs.readFileSync(
  path.join(root, 'components/4-logo/index.tsx'),
  'utf8',
);
const logoHook = fs.readFileSync(
  path.join(root, 'components/4-logo/hooks/useCompanyThirdEdit.ts'),
  'utf8',
);
const editHook = fs.readFileSync(path.join(root, 'hooks/useEditCompany.ts'), 'utf8');
const companyInterface = fs.readFileSync(
  path.join(
    __dirname,
    '../../../../../core/interfaces/api/ICompany.ts',
  ),
  'utf8',
);

assert.match(logoStep, /Informações institucionais/);
assert.match(logoStep, /label="Missão"/);
assert.match(logoStep, /label="Visão"/);
assert.match(logoStep, /label="Valores"/);
assert.match(logoStep, /name="mission"/);
assert.match(logoStep, /name="vision"/);
assert.match(logoStep, /name="values"/);
assert.match(logoStep, /multiline/);
assert.doesNotMatch(logoStep, /Política de Saúde/);

assert.match(logoHook, /'mission'/);
assert.match(logoHook, /'vision'/);
assert.match(logoHook, /'values'/);
assert.match(logoHook, /mission: mission \?\? ''/);
assert.match(logoHook, /vision: vision \?\? ''/);
assert.match(logoHook, /values: values \?\? ''/);

assert.match(editHook, /mission: ''/);
assert.match(editHook, /vision: ''/);
assert.match(editHook, /values: ''/);

assert.match(companyInterface, /mission\?: string \| null/);
assert.match(companyInterface, /vision\?: string \| null/);
assert.match(companyInterface, /values\?: string \| null/);

console.log('company-institutional-fields.spec.ts: ok');

