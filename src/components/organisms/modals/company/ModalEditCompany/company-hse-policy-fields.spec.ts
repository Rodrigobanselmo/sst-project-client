/**
 * Pontual: Política SSMA na aba SST + preserva Missão/Visão/Valores na aba Informações Adicionais.
 *
 *   npx tsx src/components/organisms/modals/company/ModalEditCompany/company-hse-policy-fields.spec.ts
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(__dirname);

const sstStep = fs.readFileSync(
  path.join(root, 'components/3-sst/SstStep.tsx'),
  'utf8',
);
const sstHook = fs.readFileSync(
  path.join(root, 'components/3-sst/hooks/useCompanySecondEdit.ts'),
  'utf8',
);
const logoStep = fs.readFileSync(
  path.join(root, 'components/4-logo/index.tsx'),
  'utf8',
);
const editHook = fs.readFileSync(path.join(root, 'hooks/useEditCompany.ts'), 'utf8');
const companyInterface = fs.readFileSync(
  path.join(__dirname, '../../../../../core/interfaces/api/ICompany.ts'),
  'utf8',
);

assert.match(sstStep, /Política de Saúde, Segurança e Meio Ambiente/);
assert.match(sstStep, /name="healthSafetyEnvironmentPolicy"/);
assert.match(sstStep, /multiline/);
assert.match(sstStep, /Usar sugestão do SimpleSST/);
assert.match(sstStep, /handleApplyHsePolicyPreset/);
assert.doesNotMatch(sstStep, /name="mission"/);
assert.doesNotMatch(sstStep, /name="vision"/);
assert.doesNotMatch(sstStep, /name="values"/);

assert.match(sstHook, /healthSafetyEnvironmentPolicy/);
assert.match(sstHook, /resolveHsePolicyPresetApplication/);
assert.match(sstHook, /handleApplyHsePolicyPreset/);

assert.match(logoStep, /name="mission"/);
assert.match(logoStep, /name="vision"/);
assert.match(logoStep, /name="values"/);
assert.doesNotMatch(logoStep, /healthSafetyEnvironmentPolicy/);
assert.doesNotMatch(logoStep, /Política de Saúde/);

assert.match(editHook, /healthSafetyEnvironmentPolicy: ''/);
assert.match(companyInterface, /healthSafetyEnvironmentPolicy\?: string \| null/);

console.log('company-hse-policy-fields.spec.ts: ok');
