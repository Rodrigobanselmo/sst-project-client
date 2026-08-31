/**
 * Spec da navegação contextual do workspace (estilo + estado ativo).
 * npx tsx src/components/organisms/main/CompanyFlow/CompanyWorkspaceContextualNav.spec.ts
 */
import assert from 'node:assert/strict';

import type { Theme } from '@mui/material';

import {
  COMPANY_WORKSPACE_NAV_MARKER_HEIGHT,
  COMPANY_WORKSPACE_NAV_MARKER_WIDTH,
  getCompanyWorkspaceContextualNavItemSx,
  getCompanyWorkspaceContextualNavMarkerSx,
  resolveCompanyWorkspaceNavVisual,
} from './company-workspace-contextual-nav.styles';
import {
  COMPANY_PRIMARY_STAGE_TO_CONTEXTUAL_NAV_ID,
  getCompanyWorkspaceContextualNavItems,
  resolveCompanyWorkspaceContextualActiveId,
} from '../../../../core/constants/company-primary-navigation.constants';

const companyId = 'co-1';

const items = getCompanyWorkspaceContextualNavItems({ companyId });
assert.equal(items.length, 8);

const management = items.filter((i) => i.group === 'management');
const operations = items.filter((i) => i.group === 'operations');
assert.equal(management.length, 5);
assert.equal(operations.length, 3);

assert.equal(
  COMPANY_PRIMARY_STAGE_TO_CONTEXTUAL_NAV_ID.sst,
  'characterization',
);

assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/novo/[stage]',
    asPath: `/dashboard/empresas/${companyId}/novo/sst`,
    companyId,
    stage: 'sst',
  }),
  'characterization',
);
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/produtos-quimicos',
    companyId,
  }),
  'characterization',
);
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/assistente-gse',
    companyId,
  }),
  'characterization',
);

const darkVisual = resolveCompanyWorkspaceNavVisual('dark');
const lightVisual = resolveCompanyWorkspaceNavVisual('light');
assert.equal(darkVisual.inactiveColor, 'text.main');
assert.equal(darkVisual.activeColor, 'primary.onSoftBackground');
assert.equal(darkVisual.activeFontWeight, 700);
assert.equal(darkVisual.markerWidth, COMPANY_WORKSPACE_NAV_MARKER_WIDTH);
assert.equal(darkVisual.markerHeight, COMPANY_WORKSPACE_NAV_MARKER_HEIGHT);
assert.equal(darkVisual.markerColor, 'primary.main');
assert.equal(lightVisual.inactiveColor, 'text.medium');
assert.equal(lightVisual.activeColor, 'text.primary');
assert.equal(lightVisual.activeFontWeight, 700);
assert.equal(lightVisual.markerWidth, COMPANY_WORKSPACE_NAV_MARKER_WIDTH);
assert.equal(lightVisual.markerHeight, COMPANY_WORKSPACE_NAV_MARKER_HEIGHT);
assert.equal(lightVisual.markerColor, 'text.primary');
assert.equal(COMPANY_WORKSPACE_NAV_MARKER_WIDTH, 40);
assert.equal(COMPANY_WORKSPACE_NAV_MARKER_HEIGHT, 4);

const asTheme = (mode: 'light' | 'dark') =>
  ({ palette: { mode } }) as Theme;

const itemSxFn = getCompanyWorkspaceContextualNavItemSx();
assert.equal(typeof itemSxFn, 'function');
const itemSx = (itemSxFn as (theme: Theme) => Record<string, unknown>)(
  asTheme('dark'),
);
assert.equal(itemSx.flexDirection, 'column');
assert.equal(itemSx.overflow, 'visible');
assert.equal(itemSx.fontSize, 15);
assert.equal(itemSx.fontWeight, 600);
assert.equal(itemSx.minHeight, 44);
assert.equal(itemSx.px, 2.25);
assert.equal(itemSx.py, 0.75);

const markerSxFn = getCompanyWorkspaceContextualNavMarkerSx(true);
const activeMarker = (
  markerSxFn as (theme: Theme) => Record<string, unknown>
)(asTheme('dark'));
const inactiveMarker = (
  getCompanyWorkspaceContextualNavMarkerSx(false) as (
    theme: Theme,
  ) => Record<string, unknown>
)(asTheme('dark'));
const lightActiveMarker = (
  markerSxFn as (theme: Theme) => Record<string, unknown>
)(asTheme('light'));

// Estrutural: marcador no fluxo normal, sem absolute.
assert.equal(activeMarker.position, 'static');
assert.equal(inactiveMarker.position, 'static');
assert.equal(activeMarker.display, 'block');
assert.equal(activeMarker.width, COMPANY_WORKSPACE_NAV_MARKER_WIDTH);
assert.equal(activeMarker.height, COMPANY_WORKSPACE_NAV_MARKER_HEIGHT);
assert.equal(lightActiveMarker.width, COMPANY_WORKSPACE_NAV_MARKER_WIDTH);
assert.equal(lightActiveMarker.height, COMPANY_WORKSPACE_NAV_MARKER_HEIGHT);
assert.equal(activeMarker.flexShrink, 0);
assert.equal(activeMarker.backgroundColor, 'primary.main');
assert.equal(lightActiveMarker.backgroundColor, 'text.primary');
assert.equal(inactiveMarker.backgroundColor, 'transparent');
assert.notEqual(activeMarker.position, 'absolute');

const activeItem = itemSx['&[data-nav-active="true"]'] as Record<
  string,
  unknown
>;
assert.equal(itemSx.color, 'text.main');
assert.equal(activeItem.color, 'primary.onSoftBackground');
assert.equal(activeItem.fontWeight, 700);

const lightItemSx = (itemSxFn as (theme: Theme) => Record<string, unknown>)(
  asTheme('light'),
);
const lightActiveItem = lightItemSx['&[data-nav-active="true"]'] as Record<
  string,
  unknown
>;
assert.equal(lightItemSx.color, 'text.medium');
assert.equal(lightActiveItem.color, 'text.primary');
assert.equal(lightActiveItem.fontWeight, 700);

console.log('CompanyWorkspaceContextualNav.spec.ts OK');
