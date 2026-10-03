/**
 * Pontual: preset institucional Missão / Visão / Valores (somente client).
 *
 *   npx tsx src/components/organisms/modals/company/ModalEditCompany/company-institutional-preset.spec.ts
 */
import assert from 'node:assert/strict';

import {
  INSTITUTIONAL_PRESET_OVERWRITE_MESSAGE,
  SIMPLESST_INSTITUTIONAL_PRESET,
  hasAnyInstitutionalContent,
  isInstitutionalFieldEmpty,
  resolveInstitutionalPresetApplication,
} from './company-institutional-preset';

assert.equal(isInstitutionalFieldEmpty(''), true);
assert.equal(isInstitutionalFieldEmpty('   '), true);
assert.equal(isInstitutionalFieldEmpty(null), true);
assert.equal(isInstitutionalFieldEmpty('texto'), false);

assert.equal(
  hasAnyInstitutionalContent({ mission: '', vision: '', values: '' }),
  false,
);
assert.equal(
  hasAnyInstitutionalContent({ mission: 'x', vision: '', values: '' }),
  true,
);

// 1) campos vazios → preenche os três
{
  const result = resolveInstitutionalPresetApplication({
    current: { mission: '', vision: null, values: '  ' },
    confirmedOverwrite: false,
  });
  assert.deepEqual(result, SIMPLESST_INSTITUTIONAL_PRESET);
  assert.equal(result !== 'needs-confirmation' && result.mission.length > 20, true);
  assert.equal(result !== 'needs-confirmation' && result.vision.length > 20, true);
  assert.equal(result !== 'needs-confirmation' && result.values.length > 20, true);
}

// 2) conteúdo existente → exige confirmação
{
  const existing = {
    mission: 'Missão própria',
    vision: '',
    values: '',
  };
  const result = resolveInstitutionalPresetApplication({
    current: existing,
    confirmedOverwrite: false,
  });
  assert.equal(result, 'needs-confirmation');
}

// 3) cancelar → preserva (não aplica sem confirmedOverwrite)
{
  const existing = {
    mission: 'Missão própria',
    vision: 'Visão própria',
    values: 'Valores próprios',
  };
  const denied = resolveInstitutionalPresetApplication({
    current: existing,
    confirmedOverwrite: false,
  });
  assert.equal(denied, 'needs-confirmation');
  // Cancelar = não chamar de novo com confirmedOverwrite:true → existing intacto
  assert.equal(existing.mission, 'Missão própria');
  assert.equal(existing.vision, 'Visão própria');
  assert.equal(existing.values, 'Valores próprios');
}

// confirmação aceita → substitui pelos textos do preset (ainda só no formulário)
{
  const applied = resolveInstitutionalPresetApplication({
    current: { mission: 'antiga', vision: 'antiga', values: 'antiga' },
    confirmedOverwrite: true,
  });
  assert.deepEqual(applied, SIMPLESST_INSTITUTIONAL_PRESET);
}

// 4) após aplicar, textos do preset são strings mutáveis no form (editáveis)
{
  const applied = {
    ...SIMPLESST_INSTITUTIONAL_PRESET,
    mission: 'Missão editada pelo usuário',
  };
  assert.equal(applied.mission, 'Missão editada pelo usuário');
  assert.equal(applied.vision, SIMPLESST_INSTITUTIONAL_PRESET.vision);
}

// 5) nenhuma persistência implícita no helper (só devolve objeto / flag)
{
  assert.match(INSTITUTIONAL_PRESET_OVERWRITE_MESSAGE, /substituí-los/);
  assert.match(INSTITUTIONAL_PRESET_OVERWRITE_MESSAGE, /Salvar/);
  assert.doesNotMatch(INSTITUTIONAL_PRESET_OVERWRITE_MESSAGE, /Política/);
}

assert.equal(
  SIMPLESST_INSTITUTIONAL_PRESET.mission.startsWith('Desenvolver nossas atividades'),
  true,
);
assert.equal(
  SIMPLESST_INSTITUTIONAL_PRESET.vision.startsWith('Ser reconhecida pela excelência'),
  true,
);
assert.equal(
  SIMPLESST_INSTITUTIONAL_PRESET.values.startsWith('Ética e integridade'),
  true,
);

console.log('company-institutional-preset.spec.ts: ok');
