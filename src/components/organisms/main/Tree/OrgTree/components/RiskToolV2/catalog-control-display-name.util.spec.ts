/**
 * Nome cadastrado das sugestões de controle.
 *
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/catalog-control-display-name.util.spec.ts
 */
import assert from 'node:assert/strict';

import { buildModularRiskUpsert } from '../../../../../modals/ModalAddCharacterization/components/ModalAiAnalysisContent/build-modular-risk-upsert.util';
import { resolveSuggestionApplyValue } from '../../../../../modals/ModalAddCharacterization/components/ModalAiAnalysisContent/suggestion-apply-plan.util';

import { riskDataAlreadyContainsFieldValue } from './risk-factors-ai/risk-factors-ai-scope.util';
import { catalogControlDisplayName } from './catalog-control-display-name.util';

const LIMITS = 'Definir limites de peso máximo e rotacionar tarefas.';
const TRAINING = 'Treinamento específico para levantamento manual de cargas.';

const shown = catalogControlDisplayName(
  { medName: null, recName: LIMITS },
  'measure',
);
assert.equal(shown, LIMITS);
assert.equal(shown === 'Medida administrativa', false);
assert.equal(shown === 'Medida de engenharia', false);

assert.equal(
  catalogControlDisplayName({ medName: '', recName: 'Guarda-corpo' }, 'measure'),
  'Guarda-corpo',
);
assert.equal(
  catalogControlDisplayName({ medName: null, recName: null }, 'measure'),
  '',
);

assert.equal(
  catalogControlDisplayName({ recName: null, medName: 'Exaustão local' }, 'recommendation'),
  'Exaustão local',
);
assert.equal(
  catalogControlDisplayName({ recName: '', medName: '' }, 'recommendation'),
  '',
);

const existing = {
  generateSources: [],
  engs: [{ medName: 'Enclausuramento' }],
  adms: [{ medName: TRAINING, recName: null }],
  recs: [],
};

const payload = buildModularRiskUpsert({
  field: 'existingAdministrativeMeasures',
  value: LIMITS,
  riskData: { id: 'data-1', riskId: 'risk-1' } as never,
  riskGroupId: 'group-1',
  companyId: 'company-1',
  homogeneousGroupId: 'gse-1',
});
assert.equal(payload?.admsAddOnly?.[0]?.medName, LIMITS);
assert.equal(payload && 'adms' in payload, false);
assert.equal(
  riskDataAlreadyContainsFieldValue('existingAdministrativeMeasures', TRAINING, existing),
  true,
);
assert.equal(
  riskDataAlreadyContainsFieldValue('existingAdministrativeMeasures', LIMITS, existing),
  false,
);

const afterReuse = {
  ...existing,
  adms: [...existing.adms, { medName: null, recName: LIMITS }],
};
assert.equal(
  riskDataAlreadyContainsFieldValue(
    'existingAdministrativeMeasures',
    LIMITS,
    afterReuse,
  ),
  true,
);
assert.equal(existing.adms.length, 1);
assert.equal(existing.adms[0]?.medName, TRAINING);

void (async () => {
  const canceled = await resolveSuggestionApplyValue({
    intent: 'verificar',
    value: LIMITS,
    confirmExistence: async () => false,
  });
  assert.equal(canceled, null);
  console.log('catalog-control-display-name.util.spec: ok');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
