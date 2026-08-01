/**
 * Executar:
 * npx tsx src/core/hooks/characterization-summary-shell.spec.ts
 */
import assert from 'node:assert/strict';
import { createElement, useState, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CompanyActionEnum } from '../enums/company-action.enum';
import {
  COMPANY_PRIMARY_STAGE_LABELS,
  COMPANY_PRIMARY_STAGES,
} from '../constants/company-primary-navigation.constants';
import {
  getCompanyWorkspaceCardsToggleLabel,
  parseCompanyWorkspaceCardsCollapsed,
} from './useCompanyWorkspaceCardsCollapsed.util';

function shouldRenderCards(collapsed: boolean): boolean {
  return !collapsed;
}

type MiniProps = { initialCollapsed?: boolean };

function MiniCompanyWorkspaceShell({ initialCollapsed = false }: MiniProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const label = getCompanyWorkspaceCardsToggleLabel(collapsed);
  const showCards = shouldRenderCards(collapsed);

  return createElement(
    'div',
    { 'data-shell': 'company-workspace' },
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

assert.equal(shouldRenderCards(parseCompanyWorkspaceCardsCollapsed(null)), true);
assert.equal(shouldRenderCards(true), false);

let html = render(createElement(MiniCompanyWorkspaceShell, { initialCollapsed: false }));
assert.ok(html.includes('Ocultar cards'));
assert.ok(html.includes('data-testid="company-cards"'));

html = render(createElement(MiniCompanyWorkspaceShell, { initialCollapsed: true }));
assert.ok(html.includes('Mostrar cards'));
assert.ok(!html.includes('data-testid="company-cards"'));

assert.ok(!html.includes('Detalhes'));
assert.ok(!getCompanyWorkspaceCardsToggleLabel(true).toLowerCase().includes('resumo'));

assert.deepEqual([...COMPANY_PRIMARY_STAGES], [
  CompanyActionEnum.COMPANY_GROUP_PAGE,
  CompanyActionEnum.EMPLOYEES_GROUP_PAGE,
  CompanyActionEnum.SST_GROUP_PAGE,
  CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
]);
assert.equal(
  COMPANY_PRIMARY_STAGE_LABELS[CompanyActionEnum.COMPANY_GROUP_PAGE],
  'Dados da Empresa',
);

console.log('characterization-summary-shell.spec.ts OK');
