/**
 * Executar:
 * npx tsx src/components/organisms/main/Sidebar/SideBarNav/hooks/sidebar-home-active-matchers.spec.ts
 */
import assert from 'node:assert/strict';

import { resolveSidebarActiveLinkHref } from 'components/atoms/SActiveLink/resolve-active-link-href';
import { RoutesEnum } from 'core/enums/routes.enums';

import {
  collectSidebarChildMatchers,
  isSidebarAnyMatcherActive,
  isSidebarMatcherActive,
} from './sidebar-home-active-matchers';

const companyId = '4a9538bf-be7a-4cc2-9f34-09fe0d486305';

const resolveTemplate = (template: string) =>
  template.replace(':companyId', companyId).replace(':stage', 'empresa');

const homeHref = resolveTemplate(RoutesEnum.COMPANY_EDIT);
const childMatchers = [
  resolveTemplate(RoutesEnum.COMPANY_EDIT),
  resolveTemplate(RoutesEnum.COMPANY_EMPLOYEE),
  resolveTemplate(RoutesEnum.COMPANY_SST),
  resolveTemplate(RoutesEnum.COMPANY_DOCUMENTS),
  resolveTemplate(RoutesEnum.DOCUMENTS),
];

const novoPrefix = `/dashboard/empresas/${companyId}/novo`;

assert.equal(homeHref.endsWith('/novo/empresa'), true);
assert.equal(
  childMatchers[4],
  `/dashboard/empresas/${companyId}/documentos`,
);
assert.ok(!childMatchers.includes(novoPrefix));
assert.ok(!novoPrefix.endsWith('/empresa'));

assert.equal(isSidebarMatcherActive(`${homeHref}?x=1`, homeHref), true);
assert.equal(
  isSidebarAnyMatcherActive(
    `/dashboard/empresas/${companyId}/novo/empregados`,
    childMatchers,
  ),
  true,
);
assert.equal(
  isSidebarAnyMatcherActive(
    `/dashboard/empresas/${companyId}/novo/sst`,
    childMatchers,
  ),
  true,
);
assert.equal(
  isSidebarAnyMatcherActive(
    `/dashboard/empresas/${companyId}/novo/documentos`,
    childMatchers,
  ),
  true,
);
assert.equal(
  isSidebarAnyMatcherActive(
    `/dashboard/empresas/${companyId}/documentos`,
    childMatchers,
  ),
  true,
);
assert.equal(
  isSidebarAnyMatcherActive(
    `/dashboard/empresas/${companyId}/novo/empresa`,
    childMatchers,
  ),
  true,
);

// Prefixo largo `/novo` acenderia Home em qualquer stage — por isso não usamos.
assert.equal(
  isSidebarMatcherActive(
    `/dashboard/empresas/${companyId}/novo/empregados`,
    novoPrefix,
  ),
  true,
);
assert.equal(
  isSidebarAnyMatcherActive(
    `/dashboard/empresas/${companyId}/plano-de-acao`,
    childMatchers,
  ),
  false,
);
assert.equal(
  isSidebarAnyMatcherActive(
    `/dashboard/empresas/${companyId}`,
    childMatchers,
  ),
  false,
);

const collected = collectSidebarChildMatchers(
  [
    { href: RoutesEnum.COMPANY_EDIT, activePrefix: RoutesEnum.COMPANY_EDIT },
    { href: RoutesEnum.DOCUMENTS },
  ],
  (item) => ({
    href: resolveTemplate(item.href || ''),
    activePrefix: item.activePrefix
      ? resolveTemplate(item.activePrefix)
      : undefined,
  }),
);
assert.deepEqual(collected, [
  resolveTemplate(RoutesEnum.COMPANY_EDIT),
  resolveTemplate(RoutesEnum.DOCUMENTS),
]);

assert.equal(
  resolveSidebarActiveLinkHref({
    href: homeHref,
    asPath: `/dashboard/empresas/${companyId}/novo/empregados`,
    isActive: true,
    forceActive: true,
  }),
  homeHref,
);
assert.equal(
  resolveSidebarActiveLinkHref({
    href: homeHref,
    asPath: `${homeHref}?tab=1`,
    isActive: true,
    forceActive: false,
  }),
  `${homeHref}?tab=1`,
);

console.log('sidebar-home-active-matchers.spec.ts OK');
