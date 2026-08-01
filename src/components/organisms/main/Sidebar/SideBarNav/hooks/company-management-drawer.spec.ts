/**
 * Executar:
 * npx tsx src/components/organisms/main/Sidebar/SideBarNav/hooks/company-management-drawer.spec.ts
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

/** Espelha a ordem/rotas esperadas da seção Gestão da Empresa. */
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

// Lançamentos: Formulários deve existir como rota canônica de formulários
assert.ok(RoutesEnum.ACTION_PLAN.includes('plano-de-acao'));
assert.ok(RoutesEnum.ABSENTEEISM.includes('absenteismo'));
assert.ok(RoutesEnum.CAT.includes('/cat'));

console.log('company-management-drawer.spec.ts OK');
