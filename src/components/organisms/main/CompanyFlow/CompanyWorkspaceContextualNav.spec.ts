/**
 * Spec da navegação contextual do workspace (estilo + estado ativo).
 * npx tsx src/components/organisms/main/CompanyFlow/CompanyWorkspaceContextualNav.spec.ts
 */
import assert from 'node:assert/strict';

import {
  COMPANY_WORKSPACE_NAV_MARKER_HEIGHT,
  COMPANY_WORKSPACE_NAV_MARKER_WIDTH,
  getCompanyWorkspaceContextualNavItemSx,
  getCompanyWorkspaceContextualNavMarkerSx,
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

const itemSx = getCompanyWorkspaceContextualNavItemSx() as Record<
  string,
  unknown
>;
assert.equal(itemSx.flexDirection, 'column');
assert.equal(itemSx.overflow, 'visible');

const activeMarker = getCompanyWorkspaceContextualNavMarkerSx(
  true,
) as Record<string, unknown>;
const inactiveMarker = getCompanyWorkspaceContextualNavMarkerSx(
  false,
) as Record<string, unknown>;

// Estrutural: marcador no fluxo normal, sem absolute.
assert.equal(activeMarker.position, 'static');
assert.equal(inactiveMarker.position, 'static');
assert.equal(activeMarker.display, 'block');
assert.equal(activeMarker.width, COMPANY_WORKSPACE_NAV_MARKER_WIDTH);
assert.equal(activeMarker.height, COMPANY_WORKSPACE_NAV_MARKER_HEIGHT);
assert.equal(activeMarker.flexShrink, 0);
assert.equal(activeMarker.backgroundColor, 'primary.main');
assert.equal(inactiveMarker.backgroundColor, 'transparent');
assert.notEqual(activeMarker.position, 'absolute');

const activeItem = itemSx['&[data-nav-active="true"]'] as Record<
  string,
  unknown
>;
assert.equal(activeItem.color, 'primary.main');
assert.equal(activeItem.fontWeight, 700);

console.log('CompanyWorkspaceContextualNav.spec.ts OK');
