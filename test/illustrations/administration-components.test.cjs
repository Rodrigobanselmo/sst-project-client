'use strict';
// Component event tests with hook/provider doubles; no DOM, network or generation provider.
const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm'),
  ts = require('typescript');
const root = path.resolve(__dirname, '../..');
function compile(relative, mocks) {
  const filename = path.join(root, relative),
    module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (name) => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filename), name);
      const extension = fs.existsSync(resolved + '.ts') ? '.ts' : '.tsx';
      return compile(path.relative(root, resolved + extension), mocks);
    }
    if (name.startsWith('project/'))
      return compile('src/' + name + '.ts', mocks);
    return new Proxy(
      { __esModule: true, default: name.split('/').pop() },
      { get: (o, key) => (key in o ? o[key] : String(key)) },
    );
  };
  vm.runInNewContext(
    '(function(require,module,exports){' + code + '\n})',
    {
      console,
      Date,
      Number,
      Promise,
      React: mocks.react.default,
      window: { confirm: () => true },
    },
    { filename },
  )(localRequire, module, module.exports);
  return module.exports;
}
const settle = () => new Promise((resolve) => setImmediate(resolve));
function harness() {
  let position = 0,
    effects = [];
  const states = [],
    queries = [],
    invalidations = [],
    snapshots = {};
  const react = {
    createElement: (type, props, ...children) => ({
      type,
      props: { ...props, children },
    }),
    useState: (initial) => {
      const i = position++;
      if (!(i in states))
        states[i] = typeof initial === 'function' ? initial() : initial;
      return [
        states[i],
        (value) => {
          states[i] = typeof value === 'function' ? value(states[i]) : value;
        },
      ];
    },
    useRef: (initial) => {
      const i = position++;
      if (!(i in states)) states[i] = { current: initial };
      return states[i];
    },
    useEffect: (fn) => effects.push(fn),
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useSyncExternalStore: (_, snapshot) => snapshot(),
  };
  const cache = {
    setQueryData: (key, data) => {
      snapshots[key[3]].data = data;
    },
    invalidateQueries: async (...args) => invalidations.push(args),
  };
  const query = {
    useQueryClient: () => cache,
    useQuery: (key, action, options) => {
      const kind =
        key[0] === 'characterization-illustrations'
          ? 'listing'
          : key[0] === 'characterization-illustration-capabilities'
            ? 'capabilities'
            : key[3];
      queries.push({ key, kind, options });
      const snapshot = snapshots[kind] || { data: undefined, isLoading: true };
      return {
        isError: false,
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        ...snapshot,
        refetch:
          snapshot.refetch ||
          (async () => ({ isSuccess: true, data: snapshot.data })),
      };
    },
    useMutation: (action, options) => ({
      isLoading: false,
      mutate: (value) =>
        Promise.resolve()
          .then(() => action(value))
          .then(options.onSuccess, options.onError),
    }),
  };
  const mocks = {
    react: { __esModule: true, default: react, ...react },
    'react-query': query,
    'core/contexts/AuthContext': { useAuth: () => ({ user: { id: 12 } }) },
    'core/hooks/useAccess': { useAccess: () => ({ isMaster: true }) },
    'core/services/apiClient': { api: {} },
    'components/molecules/SModal': {
      __esModule: true,
      default: 'SModal',
      SModalHeader: 'SModalHeader',
      SModalPaper: 'SModalPaper',
    },
  };
  return {
    reset: () => states.splice(0),
    mocks,
    snapshots,
    queries,
    invalidations,
    render: (component, props) => {
      position = 0;
      effects = [];
      const tree = component(props);
      effects.forEach((fn) => fn());
      return tree;
    },
  };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [
    tree,
    ...nodes(tree.props?.children),
    ...nodes(tree.props?.control),
    ...nodes(tree.props?.action),
  ];
}
function text(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node !== 'object') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  return text(node.props?.children);
}
const find = (tree, predicate) => {
  const found = nodes(tree).find(predicate);
  assert.ok(found, 'Expected component node');
  return found;
};
const button = (tree, label) =>
  find(tree, (n) => n.type === 'Button' && text(n) === label);
const field = (tree, label) =>
  find(tree, (n) => n.type === 'TextField' && n.props.label === label);
const relative =
  'src/components/organisms/modals/company/IllustrationAdministration/IllustrationAdministrationModal.tsx';
const initial = {
  enabled: false,
  generationLimit: 20,
  generationPeriod: 'DAY',
  budgetUsd: '5.000000',
  budgetPeriod: 'DAY',
  version: 0,
  configured: false,
};
function adminFixture() {
  const h = harness(),
    calls = [];
  h.snapshots.settings = { data: { ...initial } };
  const component = compile(relative, h.mocks).AdministrationContent;
  const props = {
    company: { id: 'fictional', name: 'Empresa fictícia' },
    onClose() {},
    service: {
      save: async (id, data) => {
        calls.push({ id, data });
        return { ...initial, ...data, version: 1, configured: true };
      },
    },
  };
  let tree = h.render(component, props);
  tree = h.render(component, props);
  return {
    ...h,
    component,
    props,
    calls,
    tree,
    rerender: () => h.render(component, props),
  };
}
test('ordinary user cannot mount administrative modal or see company action; MASTER can', () => {
  const h = harness();
  h.mocks['core/hooks/useAccess'] = { useAccess: () => ({ isMaster: false }) };
  assert.equal(
    h.render(compile(relative, h.mocks).IllustrationAdministrationModal, {
      company: { id: 'c', name: 'Test' },
    }),
    null,
  );
  assert.equal(h.queries.length, 0);
  h.mocks['core/hooks/useModal'] = {
    useModal: () => ({ onStackOpenModal() {} }),
  };
  h.mocks['core/hooks/usePreventAction'] = {
    usePreventAction: () => ({ preventWarn() {} }),
  };
  h.mocks[
    'core/services/hooks/mutations/manager/company/useMutInactivateCompany/useMutInactivateCompany'
  ] = { useMutInactivateCompany: () => ({}) };
  h.mocks[
    'core/services/hooks/mutations/manager/company/useMutReactivateCompany/useMutReactivateCompany'
  ] = { useMutReactivateCompany: () => ({}) };
  const file =
    'src/components/organisms/tables/CompaniesTable/CompanyActionsRow.tsx';
  let tree = h.render(compile(file, h.mocks).CompanyActionsRow, {
    company: { id: 'c', name: 'Test', status: 'ACTIVE' },
  });
  assert.equal(
    find(tree, (n) => n.type === 'SMenu').props.options.some(
      (o) => o.name === 'Ilustrações com IA',
    ),
    false,
  );
  h.mocks['core/hooks/useAccess'] = { useAccess: () => ({ isMaster: true }) };
  tree = h.render(compile(file, h.mocks).CompanyActionsRow, {
    company: { id: 'c', name: 'Test', status: 'ACTIVE' },
  });
  assert.equal(
    find(tree, (n) => n.type === 'SMenu').props.options.some(
      (o) => o.name === 'Ilustrações com IA',
    ),
    true,
  );
});
test('unconfigured form stays disabled until explicit save; independent periods and expectedVersion persisted', async () => {
  const f = adminFixture();
  let stopped = false;
  find(f.tree, (n) => n.type === 'SModal').props.onClick({
    stopPropagation() {
      stopped = true;
    },
  });
  assert.equal(stopped, true);
  assert.equal(f.calls.length, 0);
  assert.equal(find(f.tree, (n) => n.type === 'Switch').props.checked, false);
  field(f.tree, 'Período financeiro').props.onChange({
    target: { value: 'MONTH' },
  });
  let tree = f.rerender();
  find(tree, (n) => n.props.component === 'form').props.onSubmit({
    preventDefault() {},
  });
  await settle();
  tree = f.rerender();
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].data.expectedVersion, 0);
  assert.equal(f.calls[0].data.enabled, false);
  assert.equal(f.calls[0].data.generationPeriod, 'DAY');
  assert.equal(f.calls[0].data.budgetPeriod, 'MONTH');
  assert.match(text(tree), /valores exibidos foram confirmados/);
});
test('409 preserves draft and blocks save until explicit reload, then uses new version', async () => {
  const f = adminFixture();
  f.props.service.save = async (id, data) => {
    f.calls.push({ id, data });
    throw {
      response: {
        status: 409,
        data: { message: 'Configuração alterada por outro MASTER' },
      },
    };
  };
  field(f.tree, 'Orçamento máximo (USD)').props.onChange({
    target: { value: '7.25' },
  });
  let tree = f.rerender();
  find(tree, (n) => n.props.component === 'form').props.onSubmit({
    preventDefault() {},
  });
  await settle();
  tree = f.rerender();
  assert.equal(field(tree, 'Orçamento máximo (USD)').props.value, '7.25');
  assert.equal(button(tree, 'Salvar configuração').props.disabled, true);
  assert.match(text(tree), /outro MASTER/);
  f.snapshots.settings.refetch = async () => {
    const data = {
      ...initial,
      version: 7,
      configured: true,
      budgetUsd: '8.000000',
    };
    f.snapshots.settings.data = data;
    return { isSuccess: true, data };
  };
  tree = f.rerender();
  await button(tree, 'Atualizar dados').props.onClick();
  await settle();
  tree = f.rerender();
  assert.equal(field(tree, 'Orçamento máximo (USD)').props.value, '8.000000');
  f.props.service.save = async (id, data) => {
    f.calls.push({ id, data });
    return { ...initial, ...data, version: 8, configured: true };
  };
  field(tree, 'Orçamento máximo (USD)').props.onChange({
    target: { value: '9' },
  });
  tree = f.rerender();
  find(tree, (n) => n.props.component === 'form').props.onSubmit({
    preventDefault() {},
  });
  await settle();
  assert.equal(f.calls.at(-1).data.expectedVersion, 7);
});
test('tab queries are lazy; consumption, pagination and read-only audit use real response fields', () => {
  const f = adminFixture();
  assert.equal(
    f.queries.find((q) => q.kind === 'usage').options.enabled,
    false,
  );
  assert.equal(
    f.queries.find((q) => q.kind === 'audit').options.enabled,
    false,
  );
  f.snapshots.usage = {
    data: {
      attemptsUsed: 2,
      attemptsRemaining: 18,
      confirmedCalculatedCostUsd: '0.010000',
      pendingReservationsUsd: '0.500000',
      priorPeriodReservationsUsd: '0.500000',
      committedUsd: '0.510000',
      availableUsd: '4.490000',
      quantityPeriodStart: '2026-10-21T00:00:00Z',
      financialPeriodStart: '2026-10-01T00:00:00Z',
    },
  };
  f.snapshots.generations = { data: { count: 11, data: [] } };
  find(f.tree, (n) => n.type === 'Tabs').props.onChange(null, 1);
  let tree = f.rerender();
  assert.match(text(tree), /US\$ 0,510000/);
  assert.match(text(tree), /Não representa valor faturado/);
  find(tree, (n) => n.type === 'TablePagination').props.onPageChange(null, 1);
  tree = f.rerender();
  assert.equal(f.queries.at(-2).key[4].skip, 10);
  f.snapshots.audit = {
    data: {
      count: 1,
      data: [
        {
          id: 'audit',
          createdAt: '2026-10-21T12:00:00Z',
          changedById: 2,
          changedBy: { name: 'MASTER fictício' },
          before: null,
          after: initial,
          version: 1,
        },
      ],
    },
  };
  find(tree, (n) => n.type === 'Tabs').props.onChange(null, 2);
  tree = f.rerender();
  assert.match(text(tree), /MASTER fictício/);
  assert.equal(
    nodes(tree).some(
      (n) => n.type === 'Button' && /Excluir|Editar/.test(text(n)),
    ),
    false,
  );
});
test('blocked capabilities disable generation and regeneration while preserving gallery and approval', () => {
  const h = harness(),
    state = {
      pending: { key: 'k', generationId: 'g' },
      generation: {
        generationId: 'g',
        status: 'READY',
        expiresAt: '2099-01-01',
      },
      busy: false,
      error: '',
      approved: null,
    };
  h.snapshots.capabilities = {
    data: {
      canGenerate: false,
      available: true,
      reason: 'ILLUSTRATION_COMPANY_DISABLED',
    },
  };
  h.snapshots.listing = { data: [{ id: 'approved-1' }] };
  h.mocks['./illustrations.flow'] = {
    browserSessionStorage: () => undefined,
    IllustrationFlow: class {
      subscribe() {}
      snapshot = () => state;
    },
  };
  const p = compile(
    'src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/IllustrationsPanel.tsx',
    h.mocks,
  ).IllustrationsPanel;
  const tree = h.render(p, {
    scope: {
      userId: 1,
      companyId: 'c',
      workspaceId: 'w',
      characterizationId: 'e',
    },
    api: {},
    saved: true,
    canEdit: true,
    dirty: false,
  });
  assert.equal(button(tree, 'Gerar ilustração com IA').props.disabled, true);
  assert.equal(button(tree, 'Gerar outra imagem').props.disabled, true);
  assert.equal(
    button(tree, 'Aprovar e adicionar à galeria').props.disabled,
    false,
  );
  assert.equal(button(tree, 'Descartar').props.disabled, false);
  assert.ok(nodes(tree).some((n) => n.props.id === 'approved-1'));
  assert.match(text(tree), /desabilitada para esta empresa/);
});
test('generation grant is available in existing Security groups but never preselected by role activation', () => {
  const h = harness();
  h.mocks['core/contexts/AuthContext'] = {
    useAuth: () => ({ user: { id: 12, roles: ['master'], permissions: [] } }),
  };
  h.mocks['core/constants/maps/roles.constant.map'] = compile(
    'src/core/constants/maps/roles.constant.map.ts',
    h.mocks,
  );
  h.mocks['core/constants/maps/permissions.constant.map'] = compile(
    'src/core/constants/maps/permissions.constant.map.ts',
    h.mocks,
  );
  h.mocks['core/utils/sorts/number.sort'] = { sortNumber: () => 0 };
  h.mocks['core/utils/sorts/string.sort'] = { sortString: () => 0 };
  const roles =
    h.mocks['core/constants/maps/roles.constant.map'].rolesConstantMap;
  const catalog =
    h.mocks['core/constants/maps/permissions.constant.map']
      .permissionsConstantMap;
  assert.equal(catalog['4.62'].label, 'Gerar ilustrações com IA');
  assert.equal(catalog['4.62'].crud.join(''), 'c');
  const component = compile(
    'src/components/organisms/modals/ModalAddUsers/components/SelectRoles/index.tsx',
    h.mocks,
  ).SelectRoles;
  let data = { roles: [], permissions: {}, errors: { roles: '' } };
  let tree = h.render(component, {
    data,
    setData: (next) => {
      data = next;
    },
  });
  find(
    tree,
    (n) => n.type === 'SSwitch' && n.props.label === roles['12'].label,
  ).props.onChange();
  assert.equal(data.roles.includes('12'), true);
  assert.equal(
    data.permissions['12'].some((p) => p.startsWith('4.62-')),
    false,
  );
  tree = h.render(component, {
    data,
    setData: (next) => {
      data = next;
    },
  });
  const permissionSection = find(
    tree,
    (n) =>
      n.type === 'Box' &&
      text(n).includes('Gerar ilustrações com IA') &&
      nodes(n).filter((x) => x.type === 'SCheckBox').length === 1,
  );
  const checkbox = find(permissionSection, (n) => n.type === 'SCheckBox');
  assert.equal(!!checkbox.props.checked, false);
  checkbox.props.onChange();
  assert.equal(data.permissions['12'].includes('4.62-c'), true);
});

test('company editor adds only a MASTER saved-company tab and keeps the seven existing tabs unchanged', () => {
  const h = harness();
  let master = false;
  h.mocks['core/hooks/useAccess'] = { useAccess: () => ({ isMaster: master }) };
  const props = {
    isEdit: true,
    companyData: { id: 'target-company', name: 'Empresa alvo' },
    registerModal: () => ({ open: true }),
    onCloseUnsaved() {},
  };
  h.mocks['./hooks/useEditCompany'] = { useEditCompany: () => props };
  h.mocks['../IllustrationAdministration/IllustrationAdministrationModal'] = {
    IllustrationAdministrationModal: 'IllustrationAdministrationModal',
  };
  for (const [relative, name] of Object.entries({
    './components/0-cnpj': 'ZeroModalCompanyStep',
    './components/1-data': 'FirstModalCompanyStep',
    './components/2-address': 'SecondModalCompanyStep',
    './components/3-sst/SstStep': 'SSTModalCompanyStep',
    './components/4-logo': 'FourthModalCompanyStep',
    './components/6-contacts': 'ContactModalCompanyStep',
    './components/7-cover': 'CoverModalCompanyStep',
    './components/8-journeys': 'JourneysModalCompanyStep',
  }))
    h.mocks[relative] = { [name]: name };
  const component = compile(
    'src/components/organisms/modals/company/ModalEditCompany/index.tsx',
    h.mocks,
  ).ModalEditCompany;
  let tree = h.render(component, {});
  const header = (t) => find(t, (n) => n.type === 'Wizard').props.header;
  const labels = (t) => header(t).props.options.map((o) => o.label);
  const original = labels(tree);
  assert.equal(original.length, 7);
  assert.equal(
    nodes(tree).some((n) => n.type === 'IllustrationAdministrationModal'),
    false,
  );
  master = true;
  tree = h.render(component, {});
  assert.deepEqual(Array.from(labels(tree).slice(0, 7)), Array.from(original));
  assert.equal(labels(tree)[7], 'Ilustrações com IA');
  const panel = find(tree, (n) => n.type === 'IllustrationAdministrationModal');
  assert.equal(panel.props.embedded, true);
  assert.equal(panel.props.company.id, 'target-company');
  assert.equal(
    find(tree, (n) => n.type === 'SModalPaper').props.sx.maxWidth,
    '95vw',
  );
  props.isEdit = false;
  tree = h.render(component, {});
  assert.equal(
    nodes(tree).some((n) => n.type === 'IllustrationAdministrationModal'),
    false,
  );
});

test('company header close and tab navigation respect the shared financial close guard', () => {
  const h = harness();
  let closed = 0,
    navigated = 0;
  const props = {
    isEdit: true,
    companyData: { id: 'c', name: 'Test' },
    registerModal: () => ({ open: true }),
    onCloseUnsaved() {
      closed++;
    },
  };
  h.mocks['./hooks/useEditCompany'] = { useEditCompany: () => props };
  h.mocks['../IllustrationAdministration/IllustrationAdministrationModal'] = {
    IllustrationAdministrationModal: 'IllustrationAdministrationModal',
  };
  for (const [relative, name] of Object.entries({
    './components/0-cnpj': 'ZeroModalCompanyStep',
    './components/1-data': 'FirstModalCompanyStep',
    './components/2-address': 'SecondModalCompanyStep',
    './components/3-sst/SstStep': 'SSTModalCompanyStep',
    './components/4-logo': 'FourthModalCompanyStep',
    './components/6-contacts': 'ContactModalCompanyStep',
    './components/7-cover': 'CoverModalCompanyStep',
    './components/8-journeys': 'JourneysModalCompanyStep',
  }))
    h.mocks[relative] = { [name]: name };
  const component = compile(
    'src/components/organisms/modals/company/ModalEditCompany/index.tsx',
    h.mocks,
  ).ModalEditCompany;
  const tree = h.render(component, {}),
    panel = find(tree, (n) => n.type === 'IllustrationAdministrationModal'),
    header = find(tree, (n) => n.type === 'Wizard').props.header;
  const unregister = panel.props.registerCloseGuard(() => false);
  find(tree, (n) => n.type === 'SModal').props.onClose();
  header.props.onChangeTab(0, () => navigated++);
  assert.equal(closed, 0);
  assert.equal(navigated, 0);
  unregister();
  find(tree, (n) => n.type === 'SModalHeader').props.onClose();
  header.props.onChangeTab(0, () => navigated++);
  assert.equal(closed, 1);
  assert.equal(navigated, 1);
});

test('embedded administration reuses financial content without a nested modal and guards unsaved drafts', () => {
  const f = adminFixture();
  let guard;
  f.props.embedded = true;
  f.props.registerCloseGuard = (next) => {
    guard = next;
    return () => {};
  };
  let tree = f.rerender();
  assert.equal(
    nodes(tree).some((n) => n.type === 'SModal' || n.type === 'SModalPaper'),
    false,
  );
  assert.equal(nodes(tree).filter((n) => n.type === 'Tabs').length, 1);
  assert.equal(guard(), true);
  field(tree, 'Orçamento máximo (USD)').props.onChange({
    target: { value: '9.50' },
  });
  tree = f.rerender();
  assert.equal(field(tree, 'Orçamento máximo (USD)').props.value, '9.50');
  assert.equal(
    nodes(tree).some((n) => n.type === 'Button' && text(n) === 'Fechar'),
    false,
  );
  assert.equal(f.calls.length, 0);
});

test('platform consumption tab is gated by the server capability, including revocation', async () => {
  const f = adminFixture();
  assert.equal(
    nodes(f.tree).some((n) => n.props.label === 'Consumo MASTER da plataforma'),
    false,
  );
  f.snapshots.settings.data = {
    ...initial,
    platformMasterAccountingAvailable: true,
  };
  let tree = f.rerender();
  assert.equal(
    nodes(tree).some((n) => n.props.label === 'Consumo MASTER da plataforma'),
    true,
  );
  // Capability controls visibility, never a client-selected payer or permission.
  find(tree, (n) => n.type === 'Tabs').props.onChange(null, 3);
  tree = f.rerender();
  const content = find(
    tree,
    (n) =>
      typeof n.type === 'function' &&
      n.type.name === 'PlatformMasterConsumption',
  );
  assert.equal(content.props.companyId, 'fictional');
  assert.equal(content.props.actorId, 12);
  f.snapshots.settings.data = {
    ...initial,
    platformMasterAccountingAvailable: false,
  };
  tree = f.rerender();
  assert.equal(
    nodes(tree).some(
      (n) =>
        typeof n.type === 'function' &&
        n.type.name === 'PlatformMasterConsumption',
    ),
    false,
  );
});
test('MASTER generation notice uses API billing mode and never overrides canGenerate', () => {
  const h = harness();
  let generation = null;
  h.snapshots.capabilities = {
    data: {
      canGenerate: true,
      available: true,
      billingMode: 'PLATFORM_MASTER',
      billingCompanyId: 'server-payer',
    },
  };
  h.snapshots.listing = { data: [] };
  h.mocks['./illustrations.flow'] = {
    browserSessionStorage: () => undefined,
    IllustrationFlow: class {
      subscribe() {}
      snapshot = () => ({
        pending: null,
        generation,
        busy: false,
        error: '',
      });
    },
  };
  const component = compile(
    'src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/IllustrationsPanel.tsx',
    h.mocks,
  ).IllustrationsPanel;
  const props = {
    scope: {
      userId: 1,
      companyId: 'target',
      workspaceId: 'w',
      characterizationId: 'e',
    },
    api: {},
    saved: true,
    canEdit: true,
    dirty: false,
  };
  let tree = h.render(component, props);
  assert.match(text(tree), /Consumo atribuído à SimpleSST/);
  assert.equal(button(tree, 'Gerar ilustração com IA').props.disabled, false);
  h.snapshots.capabilities.data.canGenerate = false;
  h.snapshots.capabilities.data.reason = 'ILLUSTRATION_PAYER_CONCURRENT_LIMIT';
  tree = h.render(component, props);
  assert.equal(button(tree, 'Gerar ilustração com IA').props.disabled, true);
  assert.match(text(tree), /limite técnico/);
  h.snapshots.capabilities.data = {
    canGenerate: true,
    available: true,
    billingMode: 'COMPANY',
  };
  tree = h.render(component, props);
  assert.doesNotMatch(text(tree), /Consumo atribuído à SimpleSST/);
  h.snapshots.capabilities.data.billingMode = 'PLATFORM_MASTER';
  generation = {
    generationId: 'legacy',
    status: 'FAILED',
    billingMode: 'COMPANY',
    billingCompanyId: 'target',
  };
  tree = h.render(component, props);
  assert.doesNotMatch(text(tree), /Consumo atribuído à SimpleSST/);
});
test('platform accounting shows payer consumption, target identity and unknown reservations without commercial balance', () => {
  const h = harness();
  h.snapshots['platform-master-usage'] = {
    data: {
      attempts: 2,
      unknownAttempts: 1,
      confirmedCalculatedCostUsd: '0.100000',
      pendingReservationsUsd: '0.500000',
    },
  };
  h.snapshots['platform-master-generations'] = {
    data: {
      count: 1,
      data: [
        {
          id: 'g',
          createdAt: '2026-10-21T12:00:00Z',
          requestedBy: { name: 'MASTER fictício' },
          targetCompany: { id: 't', name: 'Atendida fictícia' },
          characterization: { id: 'e', name: 'Bancada fictícia' },
          status: 'UNKNOWN',
          reservedUsd: '0.500000',
          pendingReservationUsd: '0.500000',
          confirmedCalculatedCostUsd: null,
        },
      ],
    },
  };
  const component = compile(
    'src/components/organisms/modals/company/IllustrationAdministration/PlatformMasterConsumption.tsx',
    h.mocks,
  ).PlatformMasterConsumption;
  const tree = h.render(component, {
    companyId: 'payer',
    actorId: 12,
    service: {},
  });
  assert.match(text(tree), /MASTER fictício/);
  assert.match(text(tree), /Atendida fictícia/);
  assert.match(text(tree), /Bancada fictícia/);
  assert.match(text(tree), /Resultado incerto/);
  assert.match(text(tree), /Não confirmado/);
  assert.doesNotMatch(text(tree), /Saldo|Disponível|Restante/);
  assert.equal(h.queries.length, 2);
  assert.ok(
    h.queries.every(
      (q) =>
        q.key[1] === 'payer' && q.key[2] === 12 && q.options.retry === false,
    ),
  );
});

test('watermarked previews and gallery omit duplicate visible captions but retain illustration identity', () => {
  const h = harness();
  h.snapshots.capabilities = {
    data: { canGenerate: true, available: true, billingMode: 'COMPANY' },
  };
  h.snapshots.listing = { data: [{ id: 'marked-image' }] };
  h.mocks['./illustrations.flow'] = {
    browserSessionStorage: () => undefined,
    IllustrationFlow: class {
      subscribe() {}
      snapshot = () => ({
        pending: { key: 'k', generationId: 'g' },
        generation: {
          generationId: 'g',
          status: 'READY',
          expiresAt: '2099-01-01',
        },
        busy: false,
        error: '',
      });
    },
  };
  const component = compile(
    'src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/IllustrationsPanel.tsx',
    h.mocks,
  ).IllustrationsPanel;
  const tree = h.render(component, {
    scope: {
      userId: 1,
      companyId: 'c',
      workspaceId: 'w',
      characterizationId: 'e',
    },
    api: {},
    saved: true,
    canEdit: true,
    dirty: false,
  });
  assert.doesNotMatch(text(tree), /NÃO REPRESENTA REGISTRO FOTOGRÁFICO REAL/);
  assert.ok(nodes(tree).some((node) => node.props.preview === true));
  const card = find(tree, (node) => node.props.id === 'marked-image');
  const cardTree = h.render(card.type, card.props);
  assert.doesNotMatch(
    text(cardTree),
    /NÃO REPRESENTA REGISTRO FOTOGRÁFICO REAL/,
  );
  assert.ok(
    nodes(cardTree).some(
      (node) =>
        node.type === 'Chip' && node.props.label === 'Ilustração gerada por IA',
    ),
  );
  assert.ok(
    nodes(cardTree).some(
      (node) =>
        node.props.component === 'img' &&
        /ILUSTRAÇÃO GERADA POR IA/.test(node.props.alt),
    ),
  );
});

test('gallery PGR caption editor keeps warning read-only and saves suffix only with listing refresh', async () => {
  const h = harness(), warning = 'Ilustração meramente ilustrativa, gerada por inteligência artificial. Não constitui registro fotográfico oficial.';
  let listRefresh = 0, capRefresh = 0, saved = [], fail = false;
  const row = { id: 'approved', pgrCaptionComplement: 'Inicial', pgrCaptionWarning: warning };
  h.snapshots.capabilities = { data: { canGenerate: true, available: true }, refetch: async () => capRefresh++ };
  h.snapshots.listing = { data: [row], refetch: async () => listRefresh++ };
  h.mocks['./illustrations.flow'] = { browserSessionStorage: () => undefined,
    IllustrationFlow: class { subscribe() {} snapshot = () => ({ busy: false, error: '' }); } };
  const component = compile('src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/IllustrationsPanel.tsx', h.mocks).IllustrationsPanel;
  const api = { updatePgrCaption: async (...args) => { if (fail) throw { response: { status: 503, data: { message: 'Falha controlada' } } }; saved.push(args); } };
  const scope = { userId: 1, companyId: 'owner', workspaceId: 'workspace', characterizationId: 'element' };
  const panel = h.render(component, { scope, api, saved: true, canEdit: true, dirty: false });
  const card = find(panel, n => n.props.id === row.id);
  h.reset();
  const render = () => h.render(card.type, card.props);
  let tree = render();
  find(tree, n => n.type === 'Button' && text(n) === 'Legenda no PGR').props.onClick();
  tree = render();
  assert.ok(text(tree).includes(warning));
  const field = find(tree, n => n.type === 'TextField' && n.props.label === 'Complemento opcional');
  assert.equal(field.props.value, 'Inicial');
  assert.ok(!nodes(tree).some(n => n.type === 'TextField' && n.props.value === warning));
  field.props.onChange({ target: { value: 'Bancada fictícia' } });
  tree = render();
  await find(tree, n => n.type === 'Button' && text(n) === 'Salvar complemento').props.onClick();
  await settle();
  assert.deepEqual(saved, [[scope, row.id, 'Bancada fictícia']]);
  assert.equal(listRefresh, 1); assert.equal(capRefresh, 0);
  tree = render();
  find(tree, n => n.type === 'Button' && text(n) === 'Legenda no PGR').props.onClick();
  tree = render();
  find(tree, n => n.type === 'TextField').props.onChange({ target: { value: 'Não salvo' } });
  fail = true; tree = render();
  await find(tree, n => n.type === 'Button' && text(n) === 'Salvar complemento').props.onClick();
  await settle(); tree = render();
  assert.ok(text(tree).includes('Falha controlada'));
  assert.equal(find(tree, n => n.type === 'TextField').props.value, 'Não salvo');
  assert.equal(listRefresh, 1);
});
