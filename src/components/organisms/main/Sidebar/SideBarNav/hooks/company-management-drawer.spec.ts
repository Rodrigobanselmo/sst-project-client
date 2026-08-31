/**
 * Executar:
 * npx tsx src/components/organisms/main/Sidebar/SideBarNav/hooks/company-management-drawer.spec.ts
 *
 * Mantido para regressão da navegação contextual / Gestão da Empresa.
 * A IA completa da sidebar está em sidebar-information-architecture.spec.ts.
 */
import assert from 'node:assert/strict';

import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { RoutesEnum } from 'core/enums/routes.enums';
import {
  COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL,
  COMPANY_PRIMARY_STAGES,
  companyPrimaryStagePath,
  getCompanyPrimaryNavItems,
} from 'core/constants/company-primary-navigation.constants';

/**
 * Navegação contextual (topbar) permanece plana.
 * Na sidebar, estes hrefs são filhos do Home agrupador + Acervo Técnico.
 */
const expectedSidebarHrefs = (companyId: string) => [
  RoutesEnum.COMPANY_EDIT.replace(':companyId', companyId),
  RoutesEnum.COMPANY_EMPLOYEE.replace(':companyId', companyId),
  RoutesEnum.COMPANY_SST.replace(':companyId', companyId),
  RoutesEnum.COMPANY_DOCUMENTS.replace(':companyId', companyId),
];

const companyId = '4a9538bf-be7a-4cc2-9f34-09fe0d486305';
const items = getCompanyPrimaryNavItems(companyId);

assert.equal(COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL, 'Gestão da Empresa');
assert.deepEqual(
  items.map((i) => i.href),
  expectedSidebarHrefs(companyId),
);
assert.deepEqual(
  items.map((i) => i.stage),
  [...COMPANY_PRIMARY_STAGES],
);

// Sem companyId: builders não devem inventar path com undefined literal
assert.ok(
  !companyPrimaryStagePath('', CompanyActionEnum.COMPANY_GROUP_PAGE).includes(
    'undefined',
  ),
);

// Operações: rotas canônicas preservadas
assert.ok(RoutesEnum.ACTION_PLAN.includes('plano-de-acao'));
assert.ok(RoutesEnum.ABSENTEEISM.includes('absenteismo'));
assert.ok(RoutesEnum.CAT.includes('/cat'));
// Sidebar: os quatro stages canônicos + Acervo Técnico ficam sob Home
const expectedHomeChildrenHrefs = (id: string) => [
  ...expectedSidebarHrefs(id),
  RoutesEnum.DOCUMENTS.replace(':companyId', id),
];
assert.deepEqual(expectedHomeChildrenHrefs(companyId), [
  `/dashboard/empresas/${companyId}/novo/empresa`,
  `/dashboard/empresas/${companyId}/novo/empregados`,
  `/dashboard/empresas/${companyId}/novo/sst`,
  `/dashboard/empresas/${companyId}/novo/documentos`,
  `/dashboard/empresas/${companyId}/documentos`,
]);

assert.ok(RoutesEnum.DOCUMENTS.includes('/documentos'));

console.log('company-management-drawer.spec.ts OK');
