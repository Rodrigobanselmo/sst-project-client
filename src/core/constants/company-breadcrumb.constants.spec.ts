/**
 * Executar:
 * npx tsx src/core/constants/company-breadcrumb.constants.spec.ts
 */
import assert from 'node:assert/strict';

import { RoutesEnum } from 'core/enums/routes.enums';

import {
  COMPANIES_LIST_PATHNAME,
  getCompanyWorkspaceHomePath,
  isCompaniesListPathname,
  normalizeCompanyFlowBreadcrumbs,
} from './company-breadcrumb.constants';

const companyId = '4a9538bf-be7a-4cc2-9f34-09fe0d486305';

const empresasSegment = {
  name: 'empresas',
  value: 'empresas',
};

const companySegment = {
  name: 'ALTUS',
  value: companyId,
};

const programsSegment = {
  name: 'Programas e Laudos',
  value: 'documentos-modulo',
};

assert.equal(COMPANIES_LIST_PATHNAME, '/dashboard/empresas');
assert.equal(isCompaniesListPathname('/dashboard/empresas'), true);
assert.equal(isCompaniesListPathname('/dashboard/empresas/'), true);
assert.equal(
  isCompaniesListPathname(`/dashboard/empresas/${companyId}/novo/documentos`),
  false,
);

assert.equal(
  getCompanyWorkspaceHomePath(companyId),
  `/dashboard/empresas/${companyId}/novo/empresa`,
);
assert.equal(
  getCompanyWorkspaceHomePath(companyId),
  RoutesEnum.COMPANY_EDIT.replace(':companyId', companyId),
);
assert.notEqual(
  getCompanyWorkspaceHomePath(companyId),
  COMPANIES_LIST_PATHNAME,
);

const listing = normalizeCompanyFlowBreadcrumbs(
  [empresasSegment, companySegment],
  COMPANIES_LIST_PATHNAME,
  companyId,
);
assert.deepEqual(
  listing.map((s) => s.name),
  ['Empresas'],
);
assert.equal(listing[0].action?.(), 'dashboard/empresas');

const workspace = normalizeCompanyFlowBreadcrumbs(
  [empresasSegment, companySegment, programsSegment],
  `/dashboard/empresas/[companyId]/novo/[stage]`,
  companyId,
);
assert.deepEqual(
  workspace.map((s) => s.name),
  ['Home', 'ALTUS', 'Programas e Laudos'],
);
assert.equal(
  workspace[0].action?.(),
  `dashboard/empresas/${companyId}/novo/empresa`,
);
assert.equal(workspace[0].name, 'Home');
assert.notEqual(workspace[0].action?.(), 'dashboard/empresas');

const outside = normalizeCompanyFlowBreadcrumbs(
  [{ name: 'Clínicas', value: 'clinicas' }],
  '/dashboard/clinicas',
);
assert.deepEqual(
  outside.map((s) => s.name),
  ['Clínicas'],
);

console.log('company-breadcrumb.constants.spec.ts OK');
