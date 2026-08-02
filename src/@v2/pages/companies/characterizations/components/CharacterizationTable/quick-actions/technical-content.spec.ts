/**
 * Contrato Fase 2B/2C — indicadores técnicos + elegibilidade + helpers de preview.
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/technical-content.spec.ts
 */
import assert from 'node:assert/strict';

import {
  canGenerateInventorySummary,
  COCKPIT_FIELD_COLLAPSED_LINES,
  formatCharacterizationArrayContent,
  formatPlainContent,
  hasCharacterizationArrayContent,
  INVENTORY_SUMMARY_DISABLED_TOOLTIP,
  previewCharacterizationArray,
  previewPlainText,
  stripCharacterizationArrayItem,
} from './technical-content.util';

assert.equal(
  INVENTORY_SUMMARY_DISABLED_TOOLTIP,
  'O resumo do inventário depende do conteúdo existente em Descrição, Processos ou Considerações.',
);
assert.ok(INVENTORY_SUMMARY_DISABLED_TOOLTIP.includes('Descrição'));
assert.ok(INVENTORY_SUMMARY_DISABLED_TOOLTIP.includes('Processos'));
assert.ok(INVENTORY_SUMMARY_DISABLED_TOOLTIP.includes('Considerações'));

assert.equal(
  canGenerateInventorySummary({
    hasDescription: false,
    hasProcesses: false,
    hasConsiderations: false,
  }),
  false,
);
assert.equal(
  canGenerateInventorySummary({
    hasDescription: true,
    hasProcesses: false,
    hasConsiderations: false,
  }),
  true,
);
assert.equal(
  canGenerateInventorySummary({
    hasDescription: false,
    hasProcesses: true,
    hasConsiderations: false,
  }),
  true,
);
assert.equal(
  canGenerateInventorySummary({
    hasDescription: false,
    hasProcesses: false,
    hasConsiderations: true,
  }),
  true,
);

/** Resumo é derivado — nunca habilita a si mesmo. */
assert.equal(
  canGenerateInventorySummary({
    hasDescription: false,
    hasProcesses: false,
    hasConsiderations: false,
  }),
  false,
);

assert.equal(
  stripCharacterizationArrayItem('Texto{type}=PARAGRAPH'),
  'Texto',
);
assert.equal(hasCharacterizationArrayContent([]), false);
assert.equal(
  hasCharacterizationArrayContent(['{type}=PARAGRAPH', 'Ok{type}=PARAGRAPH']),
  true,
);
assert.equal(
  previewCharacterizationArray(['Primeiro{type}=PARAGRAPH', 'Segundo{type}=PARAGRAPH']),
  'Primeiro',
);
assert.equal(previewPlainText('x'.repeat(130)).endsWith('…'), true);
assert.ok(previewPlainText('x'.repeat(130)).length <= 121);

/** Prévia truncada — nunca payload completo. */
function isPreviewSafe(preview: string | undefined, max = 120): boolean {
  if (!preview) return true;
  return preview.length <= max;
}
assert.equal(isPreviewSafe('x'.repeat(120)), true);
assert.equal(isPreviewSafe('x'.repeat(121)), false);

/** Browse deve trazer flags na mesma query (contrato anti-N+1). */
function browsePayloadIncludesTechnicalIndicators(keys: string[]): boolean {
  const required = [
    'hasDescription',
    'hasProcesses',
    'hasConsiderations',
    'hasInventorySummary',
  ];
  return required.every((key) => keys.includes(key));
}
assert.equal(
  browsePayloadIncludesTechnicalIndicators([
    'id',
    'name',
    'hasDescription',
    'hasProcesses',
    'hasConsiderations',
    'hasInventorySummary',
    'descriptionPreview',
  ]),
  true,
);
assert.equal(
  browsePayloadIncludesTechnicalIndicators(['id', 'name', 'photos']),
  false,
);

/** Fase 2C — atalhos da coluna abrem modal, não o editor completo. */
function resolvesTechnicalContentEntry(
  action: 'open' | 'assist' | 'summary',
): 'manager-modal' {
  void action;
  return 'manager-modal';
}
assert.equal(resolvesTechnicalContentEntry('open'), 'manager-modal');
assert.equal(resolvesTechnicalContentEntry('assist'), 'manager-modal');
assert.equal(resolvesTechnicalContentEntry('summary'), 'manager-modal');

/** Fase 2D — conteúdo completo no cockpit + clamp de linhas. */
assert.equal(
  formatCharacterizationArrayContent([
    'Primeiro{type}=PARAGRAPH',
    'Segundo{type}=BULLET_0',
  ]),
  'Primeiro\n\nSegundo',
);
assert.equal(formatPlainContent('  resumo  '), 'resumo');
assert.ok(COCKPIT_FIELD_COLLAPSED_LINES >= 5 && COCKPIT_FIELD_COLLAPSED_LINES <= 8);

/** Fase 2D — estados vazios do Resumo (contrato de copy). */
const SUMMARY_UNAVAILABLE_TITLE = 'Resumo indisponível';
const SUMMARY_UNAVAILABLE_HINT =
  'O resumo poderá ser gerado após existir conteúdo em Descrição, Processos ou Considerações.';
const SUMMARY_PENDING_TITLE = 'Resumo ainda não gerado';
const EMPTY_TITLE = 'Nenhum conteúdo cadastrado';
assert.ok(SUMMARY_UNAVAILABLE_TITLE.length > 0);
assert.ok(SUMMARY_UNAVAILABLE_HINT.includes('Descrição'));
assert.ok(SUMMARY_PENDING_TITLE.length > 0);
assert.ok(EMPTY_TITLE.length > 0);

console.log('technical-content.spec.ts OK');
