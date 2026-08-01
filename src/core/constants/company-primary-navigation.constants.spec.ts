/**
 * Executar:
 * npx tsx src/core/constants/company-primary-navigation.constants.spec.ts
 */
import assert from 'node:assert/strict';

import { CompanyActionEnum } from 'core/enums/company-action.enum';

import {
  COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL,
  COMPANY_PRIMARY_STAGE_LABELS,
  COMPANY_PRIMARY_STAGES,
  COMPANY_WORKSPACE_CONTEXTUAL_NAV_ITEMS,
  companyPrimaryStagePath,
  getCompanyPrimaryNavItems,
  getCompanyWorkspaceContextualNavItems,
  isCompanyPrimaryStage,
  resolveCompanyWorkspaceContextualActiveId,
} from './company-primary-navigation.constants';

assert.deepEqual([...COMPANY_PRIMARY_STAGES], [
  CompanyActionEnum.COMPANY_GROUP_PAGE,
  CompanyActionEnum.EMPLOYEES_GROUP_PAGE,
  CompanyActionEnum.SST_GROUP_PAGE,
  CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
]);

assert.equal(COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL, 'Gestão da Empresa');

const companyId = 'company-test';
const primary = getCompanyPrimaryNavItems(companyId);
assert.deepEqual(
  primary.map((i) => i.label),
  [
    'Dados da Empresa',
    'Funcionários',
    'Caracterização',
    'Programas e Laudos',
  ],
);

const contextual = getCompanyWorkspaceContextualNavItems({ companyId });
assert.equal(contextual.length, 8);
assert.deepEqual(
  contextual.map((i) => i.label),
  [
    'Dados da Empresa',
    'Funcionários',
    'Caracterização',
    'Programas e Laudos',
    'Acervo Técnico',
    'Plano de Ação',
    'Absenteísmo',
    'Formulários',
  ],
);
assert.equal(contextual.filter((i) => i.group === 'management').length, 5);
assert.equal(contextual.filter((i) => i.group === 'operations').length, 3);
assert.deepEqual(
  contextual.filter((i) => i.group === 'management').map((i) => i.id),
  [
    'company-data',
    'employees',
    'characterization',
    'programs',
    'document-archive',
  ],
);
assert.deepEqual(
  contextual.filter((i) => i.group === 'operations').map((i) => i.id),
  ['action-plan', 'absenteeism', 'forms'],
);
assert.ok(!contextual.some((i) => i.label === 'CAT'));

assert.equal(
  getCompanyWorkspaceContextualNavItems({ companyId: '' }).length,
  0,
);

const withWs = getCompanyWorkspaceContextualNavItems({
  companyId,
  tabWorkspaceId: 'ws-1',
});
assert.ok(withWs.find((i) => i.id === 'characterization')?.href.includes('tabWorkspaceId=ws-1'));
assert.ok(withWs.find((i) => i.id === 'programs')?.href.includes('tabWorkspaceId=ws-1'));
assert.ok(withWs.find((i) => i.id === 'action-plan')?.href.includes('tabWorkspaceId=ws-1'));
assert.ok(!withWs.find((i) => i.id === 'employees')?.href.includes('tabWorkspaceId'));

assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/novo/empresa',
    companyId,
  }),
  'company-data',
);
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/novo/sst',
    companyId,
  }),
  'characterization',
);
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/novo/[stage]',
    asPath: `/dashboard/empresas/${companyId}/novo/sst?active=0`,
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
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/documentos',
    companyId,
  }),
  'document-archive',
);
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/novo/documentos',
    companyId,
  }),
  'programs',
);
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/plano-de-acao',
    companyId,
  }),
  'action-plan',
);
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/absenteismo/[absenteeismsTab]',
    asPath: `/dashboard/empresas/${companyId}/absenteismo/lista`,
    companyId,
  }),
  'absenteeism',
);
assert.equal(
  resolveCompanyWorkspaceContextualActiveId({
    pathname: '/dashboard/empresas/[companyId]/formularios/[formTab]',
    asPath: `/dashboard/empresas/${companyId}/formularios/aplicados`,
    companyId,
  }),
  'forms',
);

assert.equal(COMPANY_WORKSPACE_CONTEXTUAL_NAV_ITEMS.length, 8);
assert.equal(isCompanyPrimaryStage('empresa'), true);
assert.ok(
  companyPrimaryStagePath(companyId, CompanyActionEnum.COMPANY_GROUP_PAGE).includes(
    '/novo/empresa',
  ),
);
assert.equal(
  COMPANY_PRIMARY_STAGE_LABELS[CompanyActionEnum.COMPANY_GROUP_PAGE],
  'Dados da Empresa',
);

console.log('company-primary-navigation.constants.spec.ts OK');
