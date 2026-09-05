/**
 * Spec da busca unificada da sidebar.
 *
 * Executar:
 * npx tsx src/components/organisms/main/Sidebar/SearchBox/sidebar-search.util.spec.ts
 */
import assert from 'node:assert/strict';

import { CharacterizationSubTabEnum } from 'core/constants/characterization-navigation.constants';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { DrawerItemsEnum } from '../SideBarNav/hooks/drawer.enum';
import {
  buildDeepFeatures,
  collectVisibleNavIds,
  filterSearchFeatures,
  flattenDrawerFeatures,
  GSE_RESULT_TITLE,
  GSE_RESULT_TRAIL,
  matchesSearchQuery,
  mergeSearchFeatures,
  moveActiveIndex,
} from './sidebar-search.util';

assert.equal(stringNormalize('Caracterização'), 'caracterizacao');
assert.equal(matchesSearchQuery('gse', 'GSE', 'gse gho'), true);
assert.equal(matchesSearchQuery('GHO', 'GSE', 'gse gho grupos'), true);
assert.equal(
  matchesSearchQuery('grupos similares', 'GSE', 'gse gho grupos similares'),
  true,
);
assert.equal(matchesSearchQuery('caracterizacao', 'Caracterização'), true);
assert.equal(matchesSearchQuery('funcionarios', 'Funcionários'), true);
assert.equal(matchesSearchQuery('pcmso', 'PCMSO', 'programas laudos'), true);
assert.equal(matchesSearchQuery('xyz', 'Caracterização'), false);

const sections = [
  {
    data: { text: 'Gestão da Empresa' },
    items: [
      {
        text: 'Home',
        href: '/dashboard/empresas/:companyId/novo/empresa',
        navId: DrawerItemsEnum.companyHome,
        items: [
          {
            text: 'Caracterização',
            navId: DrawerItemsEnum.companyManagementCharacterization,
            search: 'gse gho grupos similares exposicao homogeneos',
            href: '/dashboard/empresas/:companyId/novo/sst',
          },
          {
            text: 'Programas e Laudos',
            navId: DrawerItemsEnum.companyManagementDocuments,
            search: 'pgr pcmso',
            href: '/dashboard/empresas/:companyId/novo/documentos',
          },
          {
            text: 'Funcionários',
            navId: DrawerItemsEnum.companyManagementEmployees,
            href: '/dashboard/empresas/:companyId/novo/empregados',
          },
        ],
      },
    ],
  },
];

const resolveHref = (href?: string) =>
  href?.replace(':companyId', 'company-1');

const drawerFeatures = flattenDrawerFeatures(sections, resolveHref);
const visibleNavIds = collectVisibleNavIds(drawerFeatures);

assert.equal(
  visibleNavIds.has(DrawerItemsEnum.companyManagementCharacterization),
  true,
);
assert.equal(
  visibleNavIds.has(DrawerItemsEnum.companyManagementDocuments),
  true,
);

const deepFeatures = buildDeepFeatures({
  companyId: 'company-1',
  visibleNavIds,
});

const gse = deepFeatures.find((feature) => feature.title === GSE_RESULT_TITLE);
assert.ok(gse);
assert.equal(
  gse.subtitle,
  `Caracterização › ${GSE_RESULT_TRAIL}`,
);
assert.equal(
  gse.href,
  `/dashboard/empresas/company-1/novo/sst?active=${CharacterizationSubTabEnum.GSE}`,
);
assert.equal(gse.href.includes('grupos-homogenios'), false);
assert.equal(
  gse.navId,
  DrawerItemsEnum.companyManagementCharacterization,
);

const pcmso = deepFeatures.find((feature) => feature.title === 'PCMSO');
assert.ok(pcmso);
assert.equal(pcmso.subtitle, 'Programas e Laudos › PCMSO');
assert.match(pcmso.href, /\/novo\/documentos\?active=1/);
assert.equal(pcmso.navId, DrawerItemsEnum.companyManagementDocuments);

const merged = mergeSearchFeatures(drawerFeatures, deepFeatures);

for (const query of ['gse', 'gho', 'grupos similares']) {
  const hits = filterSearchFeatures(merged, query);
  assert.equal(
    hits[0]?.title,
    GSE_RESULT_TITLE,
    `expected GSE first for "${query}", got ${hits[0]?.title}`,
  );
  assert.equal(
    hits[0]?.href,
    `/dashboard/empresas/company-1/novo/sst?active=${CharacterizationSubTabEnum.GSE}`,
  );
}

assert.equal(
  filterSearchFeatures(merged, 'pcmso')[0]?.title,
  'PCMSO',
);
assert.equal(
  filterSearchFeatures(merged, 'funcionarios').some(
    (feature) => feature.title === 'Funcionários',
  ),
  true,
);

assert.deepEqual(
  buildDeepFeatures({
    companyId: 'company-1',
    visibleNavIds: new Set(),
  }),
  [],
);

const withoutCharacterization = collectVisibleNavIds(
  drawerFeatures.filter(
    (feature) =>
      feature.navId !== DrawerItemsEnum.companyManagementCharacterization,
  ),
);
const noGse = buildDeepFeatures({
  companyId: 'company-1',
  visibleNavIds: withoutCharacterization,
});
assert.equal(
  noGse.some((feature) => feature.title === GSE_RESULT_TITLE),
  false,
);
assert.ok(noGse.some((feature) => feature.title === 'PCMSO'));

assert.deepEqual(
  buildDeepFeatures({
    companyId: '',
    visibleNavIds,
  }),
  [],
);

assert.equal(moveActiveIndex(0, -1, 3), 0);
assert.equal(moveActiveIndex(0, 1, 3), 1);
assert.equal(moveActiveIndex(2, 1, 3), 2);
assert.equal(moveActiveIndex(0, 1, 0), 0);

console.log('sidebar-search.util.spec.ts: ok');
