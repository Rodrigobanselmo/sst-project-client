/**
 * Confirmação e texto gravado das sugestões de verificação.
 *
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/suggestion-apply-plan.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  planSuggestionApply,
  resolveSuggestionApplyValue,
  suggestionApplyLabel,
} from './suggestion-apply-plan.util';

const measure = 'Treinamento específico para levantamento manual de cargas.';
const orientation = 'Verificar se a empresa realiza esse treinamento.';

const pending = planSuggestionApply({ intent: 'verificar', value: measure });
assert.equal(pending.action, 'needs-confirmation');
if (pending.action === 'needs-confirmation') {
  assert.equal(pending.value, measure);
  assert.equal(pending.value.includes('Verificar se'), false);
}

const confirmed = planSuggestionApply({
  intent: 'verificar',
  value: measure,
  confirmedExistence: true,
});
assert.deepEqual(confirmed, { action: 'append', value: measure });

const rejected = planSuggestionApply({ intent: 'verificar', value: orientation });
assert.equal(rejected.action, 'reject');

const recommendation = planSuggestionApply({
  intent: 'implementar',
  value: 'Carrinho auxiliar para movimentação de volumes.',
});
assert.equal(recommendation.action, 'append');

const identified = planSuggestionApply({
  intent: 'identificado',
  value: 'Enclausuramento da fonte',
});
assert.equal(identified.action, 'append');

const general = planSuggestionApply({ value: 'Rodízio de atividade' });
assert.equal(general.action, 'append');
assert.equal(suggestionApplyLabel(undefined), 'Aplicar');
assert.equal(suggestionApplyLabel('verificar'), 'Confirmar que existe');
assert.equal(suggestionApplyLabel('implementar'), 'Adicionar recomendação');
assert.equal(suggestionApplyLabel('identificado'), 'Adicionar');

void (async () => {
  const canceled = await resolveSuggestionApplyValue({
    intent: 'verificar',
    value: measure,
    confirmExistence: async () => false,
  });
  assert.equal(canceled, null);

  const accepted = await resolveSuggestionApplyValue({
    intent: 'verificar',
    value: measure,
    confirmExistence: async () => true,
  });
  assert.equal(accepted, measure);
  console.log('suggestion-apply-plan.util.spec: ok');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
