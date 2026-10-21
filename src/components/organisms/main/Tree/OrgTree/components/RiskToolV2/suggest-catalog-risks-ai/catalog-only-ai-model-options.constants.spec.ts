import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AI_MODEL_OPTIONS } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/ai-model-options';

import {
  CATALOG_ONLY_AI_MODEL_OPTIONS,
  CATALOG_ONLY_AI_MODEL_SYSTEM_DEFAULT,
  CATALOG_ONLY_COMPATIBLE_AI_MODEL_VALUES,
  CATALOG_ONLY_DEFAULT_AI_MODEL,
  resolveCatalogOnlySessionModelForRequest,
} from './catalog-only-ai-model-options.constants';

describe('catalog-only-ai-model-options', () => {
  it('padrão do sistema indica GPT-6.1 Sol e não envia model no payload', () => {
    assert.equal(CATALOG_ONLY_DEFAULT_AI_MODEL, 'gpt-6.1-sol');
    const systemOption = CATALOG_ONLY_AI_MODEL_OPTIONS[0];
    assert.equal(systemOption.value, CATALOG_ONLY_AI_MODEL_SYSTEM_DEFAULT);
    assert.match(systemOption.label, /Padrão do sistema \(GPT-6\.1 Sol\)/);
    assert.equal(
      resolveCatalogOnlySessionModelForRequest(systemOption.value),
      undefined,
    );
  });

  it('ordena modelos recentes primeiro e preserva a ordem existente por família', () => {
    const values = CATALOG_ONLY_AI_MODEL_OPTIONS.map((option) => option.value);
    assert.deepEqual(values, [
      CATALOG_ONLY_AI_MODEL_SYSTEM_DEFAULT,
      'gpt-6.1-sol',
      'gpt-6-astra',
      'gpt-6-luna',
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4o',
      'gpt-4o-mini',
      'o4-mini',
    ]);

    const gpt5 = CATALOG_ONLY_AI_MODEL_OPTIONS.find((o) => o.value === 'gpt-5');
    const central = AI_MODEL_OPTIONS.find((o) => o.value === 'gpt-5');
    assert.equal(gpt5?.label, central?.label);
  });

  it('não habilita modelos incompatíveis da lista central', () => {
    const values = new Set(
      CATALOG_ONLY_AI_MODEL_OPTIONS.map((option) => option.value),
    );
    assert.equal(values.has('gpt-4o-2024-05-13'), false);
    assert.equal(values.has('o1-mini'), false);
    assert.equal(values.has('o3-mini'), false);
    assert.equal(values.has('o4-mini-deep-research'), false);
  });

  it('request só envia model compatível e explícito', () => {
    assert.equal(
      resolveCatalogOnlySessionModelForRequest(
        CATALOG_ONLY_AI_MODEL_SYSTEM_DEFAULT,
      ),
      undefined,
    );
    assert.equal(resolveCatalogOnlySessionModelForRequest('gpt-5'), 'gpt-5');
    assert.equal(
      resolveCatalogOnlySessionModelForRequest('gpt-5-mini'),
      'gpt-5-mini',
    );
    assert.equal(
      resolveCatalogOnlySessionModelForRequest('o1-mini'),
      undefined,
    );
  });

  it('whitelist client inclui GPT-6 sem alterar o catálogo central compartilhado', () => {
    assert.deepEqual([...CATALOG_ONLY_COMPATIBLE_AI_MODEL_VALUES], [
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4o',
      'gpt-4o-mini',
      'o4-mini',
      'gpt-6.1-sol',
      'gpt-6-astra',
      'gpt-6-luna',
    ]);

    for (const [value, label] of [
      ['gpt-6.1-sol', 'GPT-6.1 Sol'],
      ['gpt-6-astra', 'GPT-6 Astra'],
      ['gpt-6-luna', 'GPT-6 Luna'],
    ]) {
      assert.equal(
        CATALOG_ONLY_AI_MODEL_OPTIONS.find((option) => option.value === value)
          ?.label,
        label,
      );
      assert.equal(AI_MODEL_OPTIONS.some((option) => option.value === value), false);
    }
  });
});
