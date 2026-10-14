import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';

import {
  CATALOG_ONLY_CHARACTERIZATION_IDENTIFICATION_GUIDANCE_DEFAULT,
  CATALOG_ONLY_GSE_IDENTIFICATION_GUIDANCE_DEFAULT,
  CATALOG_ONLY_PROTECTED_RULES_SUMMARY,
  resolveCatalogOnlyContextFields,
  resolveCatalogOnlyIdentificationGuidanceFactoryDefault,
  resolveCatalogOnlyIdentificationGuidancePromptKey,
} from './catalog-only-identification-guidance.constants';

assert.equal(
  resolveCatalogOnlyIdentificationGuidancePromptKey('gse'),
  SystemAiPromptKeyEnum.CATALOG_ONLY_GSE_IDENTIFICATION_GUIDANCE,
);
assert.equal(
  resolveCatalogOnlyIdentificationGuidancePromptKey('characterization'),
  SystemAiPromptKeyEnum.CATALOG_ONLY_CHARACTERIZATION_IDENTIFICATION_GUIDANCE,
);

assert.equal(
  resolveCatalogOnlyIdentificationGuidanceFactoryDefault('gse'),
  CATALOG_ONLY_GSE_IDENTIFICATION_GUIDANCE_DEFAULT,
);
assert.equal(
  resolveCatalogOnlyIdentificationGuidanceFactoryDefault('characterization'),
  CATALOG_ONLY_CHARACTERIZATION_IDENTIFICATION_GUIDANCE_DEFAULT,
);

assert.notEqual(
  resolveCatalogOnlyIdentificationGuidancePromptKey('gse'),
  resolveCatalogOnlyIdentificationGuidancePromptKey('characterization'),
);
assert.notEqual(
  resolveCatalogOnlyIdentificationGuidanceFactoryDefault('gse'),
  resolveCatalogOnlyIdentificationGuidanceFactoryDefault('characterization'),
);

assert.ok(
  resolveCatalogOnlyContextFields('gse').some((field) => field.includes('GSE')),
);
assert.ok(
  resolveCatalogOnlyContextFields('characterization').some((field) =>
    field.toLowerCase().includes('elemento'),
  ),
);
assert.ok(
  CATALOG_ONLY_PROTECTED_RULES_SUMMARY.some((rule) =>
    rule.includes('NÃO substitui'),
  ),
);

const buttonSource = readFileSync(
  join(__dirname, '../components/RiskToolTopButtons/SuggestCatalogRisksWithAiButton.tsx'),
  'utf8',
);
assert.match(buttonSource, /RoleEnum\.MASTER/);
assert.match(buttonSource, /includes\(RoleEnum\.MASTER\)/);
assert.match(buttonSource, /SuggestCatalogRisksMasterConfigDialog/);
assert.match(buttonSource, /SettingsOutlinedIcon/);
assert.doesNotMatch(buttonSource, /useAccess\(\)/);

const dialogSource = readFileSync(
  join(__dirname, 'SuggestCatalogRisksMasterConfigDialog.tsx'),
  'utf8',
);
assert.match(dialogSource, /Regras protegidas do sistema/);
assert.match(dialogSource, /Campos de contexto enviados à IA/);
assert.match(dialogSource, /action: 'save'/);
assert.match(dialogSource, /action: 'promote'/);
assert.match(dialogSource, /action: 'restore'/);
assert.match(dialogSource, /Definir como padrão/);
assert.match(dialogSource, /Restaurar padrão/);
assert.match(dialogSource, /useMutateUpsertSystemAiPrompt/);
assert.match(dialogSource, /useFetchSystemAiPrompt/);

const typesSource = readFileSync(
  join(
    __dirname,
    '../../../../../../../../@v2/services/forms/system-ai-prompt/service/system-ai-prompt.types.ts',
  ),
  'utf8',
);
assert.match(typesSource, /officialDefaultContent/);
assert.match(typesSource, /hasOfficialDefault/);
assert.match(typesSource, /'promote'/);
assert.match(typesSource, /'restore'/);

console.log('catalog-only-identification-guidance.constants.spec.ts OK');
