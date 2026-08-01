/**
 * Executar:
 * npx tsx src/core/hooks/useCharacterizationSummaryCollapsed.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT,
  getCharacterizationSummaryToggleLabel,
  parseCharacterizationSummaryCollapsed,
  readCharacterizationSummaryCollapsed,
  writeCharacterizationSummaryCollapsed,
} from './useCharacterizationSummaryCollapsed.util';

assert.equal(CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT, false);

// 1) preferência ausente → cards visíveis (collapsed=false)
assert.equal(parseCharacterizationSummaryCollapsed(null), false);
assert.equal(parseCharacterizationSummaryCollapsed(undefined), false);
assert.equal(parseCharacterizationSummaryCollapsed(''), false);

// 2 / 3) collapsed false/true
assert.equal(parseCharacterizationSummaryCollapsed('false'), false);
assert.equal(parseCharacterizationSummaryCollapsed('true'), true);
assert.equal(parseCharacterizationSummaryCollapsed(JSON.stringify(false)), false);
assert.equal(parseCharacterizationSummaryCollapsed(JSON.stringify(true)), true);

// fallback inválido
assert.equal(parseCharacterizationSummaryCollapsed('"not-bool"'), false);
assert.equal(parseCharacterizationSummaryCollapsed('{'), false);
assert.equal(parseCharacterizationSummaryCollapsed('1'), false);

// 8) labels corretos (cards, não resumo)
assert.equal(getCharacterizationSummaryToggleLabel(true), 'Mostrar cards');
assert.equal(getCharacterizationSummaryToggleLabel(false), 'Ocultar cards');
assert.notEqual(getCharacterizationSummaryToggleLabel(true), 'Mostrar resumo');
assert.notEqual(getCharacterizationSummaryToggleLabel(false), 'Ocultar resumo');

// 7) sem window: leitura não quebra
assert.equal(readCharacterizationSummaryCollapsed(), false);

// 4–6) toggle lógico + persistência (simulado)
let collapsed = parseCharacterizationSummaryCollapsed(null);
assert.equal(collapsed, false, 'preferência ausente → cards visíveis');

collapsed = !collapsed; // Ocultar cards
assert.equal(collapsed, true);
assert.equal(getCharacterizationSummaryToggleLabel(collapsed), 'Mostrar cards');

collapsed = !collapsed; // Mostrar cards
assert.equal(collapsed, false);
assert.equal(getCharacterizationSummaryToggleLabel(collapsed), 'Ocultar cards');

// write/read roundtrip quando há localStorage (jsdom/browser); em Node write é no-op
writeCharacterizationSummaryCollapsed(true);
if (typeof localStorage !== 'undefined') {
  assert.equal(readCharacterizationSummaryCollapsed(), true);
  writeCharacterizationSummaryCollapsed(false);
  assert.equal(readCharacterizationSummaryCollapsed(), false);
}

console.log('useCharacterizationSummaryCollapsed.util.spec.ts OK');
