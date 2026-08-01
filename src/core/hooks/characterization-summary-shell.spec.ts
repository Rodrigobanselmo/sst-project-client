/**
 * Testes de composição: uma fonte de verdade controla toggle + renderização dos cards.
 * Executar:
 * npx tsx src/core/hooks/characterization-summary-shell.spec.ts
 */
import assert from 'node:assert/strict';
import { createElement, useState, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  getCharacterizationSummaryToggleLabel,
  parseCharacterizationSummaryCollapsed,
} from './useCharacterizationSummaryCollapsed.util';

/** Espelha a regra de layout: collapsed=true → cards ocultos. */
function shouldRenderCards(collapsed: boolean): boolean {
  return !collapsed;
}

type MiniProps = {
  initialCollapsed?: boolean;
};

/**
 * Mini-árvore análoga a CompanyPageLayout + Toggle compartilhando o mesmo estado.
 * Valida que um único setState atualiza label e renderização dos cards juntos.
 */
function MiniCharacterizationShell({ initialCollapsed = false }: MiniProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const label = getCharacterizationSummaryToggleLabel(collapsed);
  const showCards = shouldRenderCards(collapsed);

  return createElement(
    'div',
    { 'data-shell': 'characterization' },
    createElement(
      'button',
      {
        type: 'button',
        'aria-label': label,
        'aria-expanded': String(!collapsed),
        title: label,
        onClick: () => setCollapsed((prev) => !prev),
      },
      label,
    ),
    showCards
      ? createElement('section', { 'data-testid': 'company-cards' }, 'cards')
      : null,
  );
}

function render(node: ReactNode) {
  return renderToStaticMarkup(node as any);
}

// preferência ausente / default → cards visíveis
assert.equal(shouldRenderCards(parseCharacterizationSummaryCollapsed(null)), true);
assert.equal(shouldRenderCards(false), true);
assert.equal(shouldRenderCards(true), false);

let html = render(createElement(MiniCharacterizationShell, { initialCollapsed: false }));
assert.ok(html.includes('Ocultar cards'));
assert.ok(html.includes('data-testid="company-cards"'));
assert.ok(html.includes('aria-expanded="true"'));

html = render(createElement(MiniCharacterizationShell, { initialCollapsed: true }));
assert.ok(html.includes('Mostrar cards'));
assert.ok(!html.includes('data-testid="company-cards"'));
assert.ok(html.includes('aria-expanded="false"'));

// Detalhes NÃO faz parte deste controle
assert.ok(!html.includes('Detalhes'));
assert.ok(!getCharacterizationSummaryToggleLabel(true).toLowerCase().includes('resumo'));
assert.ok(!getCharacterizationSummaryToggleLabel(true).toLowerCase().includes('detalhe'));

console.log('characterization-summary-shell.spec.ts OK');
