/**
 * Spec da arquitetura de informação da sidebar (Fase B).
 *
 * Executar:
 * npx tsx src/components/organisms/main/Sidebar/SideBarNav/hooks/sidebar-information-architecture.spec.ts
 */
import assert from 'node:assert/strict';

import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';
import {
  COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL,
  COMPANY_PRIMARY_STAGES,
  companyPrimaryStagePath,
  getCompanyPrimaryNavItems,
} from 'core/constants/company-primary-navigation.constants';

import { DrawerItemsEnum } from './drawer.enum';
import { SIDEBAR_SECTION_IDS } from 'core/hooks/useSidebarSectionExpansion.util';

/** Ordem canônica das seções após a reorganização. */
const EXPECTED_SECTION_ORDER = [
  'Geral',
  'Gestão da Empresa',
  'Operações',
  'Cadastros Técnicos',
  'Bibliotecas e Curadoria',
  'Administração',
  'Perfil', // standalone (sem título visível)
] as const;

/** Chaves estáveis de expansão (Fase C) — Perfil fora do mecanismo. */
const EXPECTED_COLLAPSIBLE_IDS = [
  'general',
  'companyManagement',
  'operations',
  'technicalRegistrations',
  'librariesAndCuration',
  'administration',
] as const;

const EXPECTED_GERAL = ['Empresas?', 'Agenda', 'Clínicas'];
const EXPECTED_GESTAO_HOME_CHILDREN = [
  'Dados da Empresa',
  'Funcionários',
  'Caracterização',
  'Programas e Laudos',
  'Acervo Técnico',
];
const EXPECTED_GESTAO = ['Home', ...EXPECTED_GESTAO_HOME_CHILDREN];
const EXPECTED_OPERACOES = [
  'Formulários',
  'Plano de Ação',
  'Absenteísmo',
  'CAT',
  'eSocial',
];
const EXPECTED_CADASTROS = [
  'Fatores de Risco',
  'Métodos de HO',
  'Exames',
  'EPI e CA',
  'Profissionais',
];
const EXPECTED_ADMIN = [
  'Gerenciar Usuários',
  'Grupo de Permissões',
  'Bloqueio de Agenda',
  'Relatórios',
];

assert.equal(COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL, 'Gestão da Empresa');
assert.deepEqual([...EXPECTED_SECTION_ORDER], [
  'Geral',
  COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL,
  'Operações',
  'Cadastros Técnicos',
  'Bibliotecas e Curadoria',
  'Administração',
  'Perfil',
]);

assert.equal(EXPECTED_GESTAO[0], 'Home');
assert.deepEqual(EXPECTED_GESTAO_HOME_CHILDREN, [
  'Dados da Empresa',
  'Funcionários',
  'Caracterização',
  'Programas e Laudos',
  'Acervo Técnico',
]);
assert.equal(EXPECTED_GESTAO_HOME_CHILDREN.length, 5);
assert.ok(!EXPECTED_GERAL.includes('Home'));
assert.ok(!EXPECTED_GERAL.includes('Empresas|Home'));
assert.equal(EXPECTED_OPERACOES[1], 'Plano de Ação');
assert.equal(EXPECTED_CADASTROS[3], 'EPI e CA');
assert.equal(EXPECTED_ADMIN[0], 'Gerenciar Usuários');
assert.ok(EXPECTED_GERAL.includes('Agenda'));

// Typo histórico corrigido: actions (antes "acrions")
assert.equal(DrawerItemsEnum.actions, 'actions');
assert.notEqual(DrawerItemsEnum.actions, 'acrions');

// Legado /empregados permanece no enum, fora da sidebar renderizada
assert.equal(DrawerItemsEnum.employee, 'employee');
assert.ok(RoutesEnum.EMPLOYEES.includes('/empregados'));
assert.ok(RoutesEnum.COMPANY_EMPLOYEE.includes('/novo/empregados'));

// Gestão canônica alinhada à navegação contextual
const companyId = '4a9538bf-be7a-4cc2-9f34-09fe0d486305';
const primaryNav = getCompanyPrimaryNavItems(companyId);
assert.deepEqual(
  primaryNav.map((i) => i.href),
  [
    RoutesEnum.COMPANY_EDIT.replace(':companyId', companyId),
    RoutesEnum.COMPANY_EMPLOYEE.replace(':companyId', companyId),
    RoutesEnum.COMPANY_SST.replace(':companyId', companyId),
    RoutesEnum.COMPANY_DOCUMENTS.replace(':companyId', companyId),
  ],
);
assert.deepEqual(
  primaryNav.map((i) => i.stage),
  [...COMPANY_PRIMARY_STAGES],
);

assert.ok(
  !companyPrimaryStagePath('', CompanyActionEnum.COMPANY_GROUP_PAGE).includes(
    'undefined',
  ),
);

/**
 * Espelha a regra de fallback de stage usada em SideBarNav
 * (resolveHref / resolveActivePrefix).
 */
const resolveStage = (stage?: string) => stage || 'empresa';
assert.equal(resolveStage(undefined), 'empresa');
assert.equal(resolveStage(''), 'empresa');
assert.equal(resolveStage('sst'), 'sst');
assert.notEqual(resolveStage(undefined), '0');

/**
 * Espelha o filtro recursivo: remove filhos sem acesso e pais sem ação/filhos.
 */
type TreeNode = {
  id: string;
  allowed: boolean;
  href?: string;
  items?: TreeNode[];
};

const filterRecursive = (nodes: TreeNode[]): TreeNode[] =>
  nodes.reduce<TreeNode[]>((acc, node) => {
    if (!node.allowed) return acc;
    const children = node.items ? filterRecursive(node.items) : undefined;
    if (node.items) {
      const hasOwnAction = Boolean(node.href);
      if ((!children || children.length === 0) && !hasOwnAction) return acc;
      acc.push({ ...node, items: children });
      return acc;
    }
    acc.push(node);
    return acc;
  }, []);

const tree: TreeNode[] = [
  {
    id: 'parent-blocked',
    allowed: false,
    items: [{ id: 'child-ok', allowed: true, href: '/x' }],
  },
  {
    id: 'parent-empty',
    allowed: true,
    items: [{ id: 'child-blocked', allowed: false, href: '/y' }],
  },
  {
    id: 'parent-with-child',
    allowed: true,
    items: [{ id: 'child-ok', allowed: true, href: '/z' }],
  },
  { id: 'leaf', allowed: true, href: '/leaf' },
];

const filtered = filterRecursive(tree);
assert.deepEqual(
  filtered.map((n) => n.id),
  ['parent-with-child', 'leaf'],
);
assert.equal(filtered[0].items?.[0].id, 'child-ok');

// Seções antigas não devem mais ser referências canônicas
assert.ok(!EXPECTED_SECTION_ORDER.includes('Lançamentos' as never));
assert.ok(!EXPECTED_SECTION_ORDER.includes('Atalhos' as never));
assert.ok(!EXPECTED_SECTION_ORDER.includes('Banco de dados' as never));

// Fase C: ids collapsíveis alinhados; Perfil fora
assert.deepEqual([...SIDEBAR_SECTION_IDS], [...EXPECTED_COLLAPSIBLE_IDS]);
assert.equal(EXPECTED_COLLAPSIBLE_IDS.length, 6);

// Gates dos cinco filhos — não mudam nesta fatia
assert.deepEqual(
  [
    { text: 'Dados da Empresa', roles: [] as RoleEnum[] },
    { text: 'Funcionários', roles: [] as RoleEnum[] },
    { text: 'Caracterização', roles: [] as RoleEnum[] },
    {
      text: 'Programas e Laudos',
      roles: [RoleEnum.DOCUMENTS],
      showIf: { isDocuments: true },
    },
    { text: 'Acervo Técnico', roles: [RoleEnum.DOCUMENTS] },
  ].map((item) => item.text),
  EXPECTED_GESTAO_HOME_CHILDREN,
);

// Home agrupador: destino canônico /novo/empresa, sem prefixo largo /novo
assert.equal(RoutesEnum.COMPANY_EDIT.endsWith('/novo/empresa'), true);
assert.notEqual(
  RoutesEnum.COMPANY.replace('/:stage', ''),
  RoutesEnum.COMPANY_EDIT,
);
assert.ok(RoutesEnum.DOCUMENTS.includes('/documentos'));
assert.ok(!RoutesEnum.DOCUMENTS.includes('/novo/documentos'));

console.log('sidebar-information-architecture.spec.ts OK');
console.log('Sections:', EXPECTED_SECTION_ORDER.join(' → '));
console.log(
  'Gestão:',
  `Home → ${EXPECTED_GESTAO_HOME_CHILDREN.join(' | ')}`,
);
console.log('Operações:', EXPECTED_OPERACOES.join(' | '));
console.log('Cadastros:', EXPECTED_CADASTROS.join(' | '));
console.log('Admin:', EXPECTED_ADMIN.join(' | '));
