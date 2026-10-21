'use strict';
const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm'),
  path = require('node:path'),
  ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const servicePath =
  'src/@v2/services/enterprise/hierarchy/suggest-description/suggest-description.service.ts';
const componentPath =
  'src/components/organisms/main/Tree/OrgTree/components/ModalEditCard/components/HierarchyDescriptionAssistant.tsx';
function compile(file, mocks) {
  const mod = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync(path.join(root, file), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    },
  ).outputText;
  vm.runInNewContext('(function(require,module,exports){' + code + '\n})', {
    console,
    Promise,
  })(
    (name) => {
      if (name in mocks) return mocks[name];
      return new Proxy(
        { __esModule: true, default: name.split('/').pop() },
        { get: (o, k) => (k in o ? o[k] : String(k)) },
      );
    },
    mod,
    mod.exports,
  );
  return mod.exports;
}
const normalize = (v) => JSON.parse(JSON.stringify(v));
const id = '11111111-1111-4111-8111-111111111111',
  workspace = '22222222-2222-4222-8222-222222222222',
  parent = '33333333-3333-4333-8333-333333333333';
test('six internal types including OFFICE and SUB_OFFICE; no company/workspace/worker/group', () => {
  const {
    descriptionSuggestionInput: input,
    DESCRIPTION_HIERARCHY_TYPES: types,
  } = compile(servicePath, { 'core/services/apiClient': { api: {} } });
  for (const type of types)
    assert.equal(
      input({
        id: id + '//' + workspace,
        parentId: null,
        type,
        label: 'Nome',
        action: 'edit',
      }).type,
      type,
    );
  for (const type of [
    'COMPANY',
    'WORKSPACE',
    'EMPLOYEE',
    'ESTABLISHMENT_GROUP',
  ])
    assert.equal(
      input({ id, parentId: null, type, label: 'Nome', action: 'edit' }),
      undefined,
    );
});
test('new elements use saved parent/workspace; unsaved parent requires saving first', () => {
  const { descriptionSuggestionInput: input } = compile(servicePath, {
    'core/services/apiClient': { api: {} },
  });
  const node = {
    id: 'draft//' + workspace,
    parentId: parent + '//' + workspace,
    type: 'SUB_OFFICE',
    label: 'Complementar',
    action: 'add',
  };
  assert.equal(input(node).parentId, parent);
  assert.equal(input(node).hierarchyId, undefined);
  assert.equal(
    input({ ...node, parentId: 'unsaved//' + workspace }),
    undefined,
  );
  assert.equal(input({ ...node, label: '' }), undefined);
  assert.equal(
    input({ ...node, type: 'SECTOR', parentId: workspace }).parentId,
    undefined,
  );
});
test('request contains only identifiers, type and name; suggestion never saves hierarchy', async () => {
  const calls = [];
  const { suggestHierarchyDescription: suggest } = compile(servicePath, {
    'core/services/apiClient': {
      api: {
        post: async (...args) => {
          calls.push(args);
          return { data: { description: 'Proposta' } };
        },
      },
    },
  });
  assert.equal(
    (
      await suggest('company/id', {
        hierarchyId: id,
        workspaceId: workspace,
        type: 'OFFICE',
        name: 'Técnico',
      })
    ).description,
    'Proposta',
  );
  assert.equal(
    calls[0][0],
    '/v2/companies/company%2Fid/hierarchy/description-suggestion',
  );
  assert.deepEqual(Object.keys(calls[0][1]).sort(), [
    'hierarchyId',
    'name',
    'type',
    'workspaceId',
  ]);
});
function harness(
  generate,
  audio = {
    state: 'idle',
    error: null,
    startRecording: async () => {},
    stopRecording: async () => null,
    cancelRecording: () => {},
  },
  notices = [],
) {
  let pos = 0;
  const states = [],
    effects = [],
    hooks = [];
  const react = {
    createElement: (type, props, ...children) => ({
      type,
      props: { ...props, children },
    }),
    useState: (initial) => {
      const i = pos++;
      if (!(i in states)) states[i] = initial;
      return [
        states[i],
        (v) => {
          states[i] = typeof v === 'function' ? v(states[i]) : v;
        },
      ];
    },
    useRef: (initial) => {
      const i = pos++;
      return states[i] || (states[i] = { current: initial });
    },
    useEffect: (fn, deps) => {
      const i = pos++;
      if (!hooks[i] || deps.some((v, j) => v !== hooks[i].deps[j]))
        effects.push(() => {
          hooks[i]?.cleanup?.();
          hooks[i] = { deps, cleanup: fn() };
        });
    },
  };
  const component = compile(componentPath, {
    '@v2/features/ai-chat/hooks/use-audio-recorder': {
      useAudioRecorder: () => audio,
    },
    notistack: {
      useSnackbar: () => ({ enqueueSnackbar: (...args) => notices.push(args) }),
    },
    react: { __esModule: true, default: react, ...react },
    '@v2/services/enterprise/hierarchy/suggest-description/suggest-description.service':
      { suggestHierarchyDescription: generate },
  }).HierarchyDescriptionAssistant;
  return {
    render: (props) => {
      pos = 0;
      effects.length = 0;
      const tree = component(props);
      effects.forEach((fn) => fn());
      return tree;
    },
  };
}
function nodes(t) {
  if (!t || typeof t !== 'object') return [];
  if (Array.isArray(t)) return t.flatMap(nodes);
  return [t, ...nodes(t.props?.children)];
}
function text(t) {
  if (t == null || typeof t === 'boolean') return '';
  if (typeof t !== 'object') return String(t);
  if (Array.isArray(t)) return t.map(text).join('');
  return text(t.props?.children);
}
function button(tree, label) {
  const b = nodes(tree).find((n) => n.type === 'Button' && text(n) === label);
  assert.ok(b, 'button ' + label);
  return b;
}
const settle = () => new Promise((r) => setImmediate(r));
function props(description = '') {
  return {
    companyId: 'company',
    input: {
      hierarchyId: id,
      workspaceId: workspace,
      type: 'OFFICE',
      name: 'Técnico',
    },
    description,
    onApply: () => {},
  };
}
test('review then apply modifies description only; no automatic save or interview mutation', async () => {
  const applied = [],
    p = props();
  const form = { description: '', realDescription: 'Entrevista original' };
  p.onApply = (d) => {
    form.description = d;
    applied.push(d);
  };
  const h = harness(async () => ({ description: 'Proposta técnica' }));
  h.render(p);
  let t = h.render(p);
  await button(t, 'Gerar descrição com IA').props.onClick();
  t = h.render(p);
  button(t, 'Gerar proposta').props.onClick();
  await settle();
  t = h.render(p);
  assert.equal(form.description, '');
  assert.ok(text(t).includes('salvamento continua'));
  button(t, 'Aplicar descrição').props.onClick();
  assert.deepEqual(applied, ['Proposta técnica']);
  assert.equal(form.realDescription, 'Entrevista original');
});
test('existing description requires confirmation and cancellation preserves text', async () => {
  const p = props('Texto atual'),
    applied = [];
  p.onApply = (d) => applied.push(d);
  const h = harness(async () => ({ description: 'Proposta' }));
  h.render(p);
  let t = h.render(p);
  button(t, 'Gerar descrição com IA').props.onClick();
  t = h.render(p);
  button(t, 'Gerar proposta').props.onClick();
  await settle();
  t = h.render(p);
  button(t, 'Aplicar descrição').props.onClick();
  t = h.render(p);
  assert.equal(applied.length, 0);
  button(t, 'Cancelar').props.onClick();
  assert.equal(p.description, 'Texto atual');
  assert.equal(applied.length, 0);
  t = h.render(p);
  button(t, 'Gerar descrição com IA').props.onClick();
  t = h.render(p);
  button(t, 'Gerar proposta').props.onClick();
  await settle();
  t = h.render(p);
  button(t, 'Aplicar descrição').props.onClick();
  t = h.render(p);
  button(t, 'Confirmar substituição').props.onClick();
  assert.deepEqual(applied, ['Proposta']);
});
test('generation failure preserves the form, exposes an error and does not retry automatically', async () => {
  let calls = 0;
  const applied = [],
    p = props('Atual');
  p.onApply = (d) => applied.push(d);
  const h = harness(async () => {
    calls++;
    throw { response: { status: 503 } };
  });
  h.render(p);
  let t = h.render(p);
  button(t, 'Gerar descrição com IA').props.onClick();
  t = h.render(p);
  button(t, 'Gerar proposta').props.onClick();
  await settle();
  t = h.render(p);
  assert.ok(text(t).includes('texto atual foi preservado'));
  assert.equal(calls, 1);
  assert.equal(applied.length, 0);
  assert.equal(button(t, 'Aplicar descrição').props.disabled, true);
});
test('late response after cancel or element change is not applied', async () => {
  let resolve;
  const p = props(),
    applied = [];
  p.onApply = (d) => applied.push(d);
  const h = harness(() => new Promise((r) => (resolve = r)));
  h.render(p);
  let t = h.render(p);
  button(t, 'Gerar descrição com IA').props.onClick();
  t = h.render(p);
  button(t, 'Gerar proposta').props.onClick();
  t = h.render(p);
  button(t, 'Cancelar').props.onClick();
  resolve({ description: 'Late' });
  await settle();
  t = h.render(p);
  assert.equal(button(t, 'Aplicar descrição').props.disabled, true);
  assert.equal(applied.length, 0);
  button(t, 'Gerar descrição com IA').props.onClick();
  t = h.render(p);
  button(t, 'Gerar proposta').props.onClick();
  const next = { ...p, input: { ...p.input, hierarchyId: parent } };
  h.render(next);
  resolve({ description: 'Wrong element' });
  await settle();
  t = h.render(next);
  assert.equal(button(t, 'Aplicar descrição').props.disabled, true);
});
test('ModalEditCard integration limits eligibility and callback updates only description; interview wizard unchanged', () => {
  const src = fs.readFileSync(
    path.join(
      root,
      'src/components/organisms/main/Tree/OrgTree/components/ModalEditCard/index.tsx',
    ),
    'utf8',
  );
  assert.match(src, /DESCRIPTION_HIERARCHY_TYPES\.includes/);
  assert.match(src, /permissions: \[PermissionEnum\.EMPLOYEE\],\s*cruds: 'u'/);
  assert.match(
    src,
    /onApply=\{\(description\) =>\s*setEditNodeSelectedItem\(\{ description \}\)\s*\}/,
  );
  const wizard = fs.readFileSync(
    path.join(
      root,
      'src/components/organisms/modals/ModalAutomateSubOffice/components/2-name/hooks/useSetSubOfficeNameStep.ts',
    ),
    'utf8',
  );
  assert.match(wizard, /realDescription: description/);
  assert.ok(!wizard.includes('suggestHierarchyDescription'));
});

test('text and voice guidance are combined in the request; applying shows the exact nonblocking RH notice', async () => {
  const sent = [],
    applied = [],
    notices = [];
  let starts = 0;
  const audio = {
    state: 'idle',
    error: null,
    startRecording: async () => {
      starts++;
      audio.state = 'recording';
    },
    stopRecording: async () => {
      audio.state = 'idle';
      return 'solda estanho em componentes eletrônicos';
    },
    cancelRecording: () => {
      audio.state = 'idle';
    },
  };
  const p = props();
  p.onApply = (value) => applied.push(value);
  const h = harness(
    async (_company, input) => {
      sent.push(input);
      return { description: 'Descrição orientada' };
    },
    audio,
    notices,
  );
  h.render(p);
  let t = h.render(p);
  button(t, 'Gerar descrição com IA').props.onClick();
  t = h.render(p);
  assert.equal(sent.length, 0);
  nodes(t)
    .find(
      (n) =>
        n.type === 'TextField' &&
        n.props.label === 'Orientações para a descrição',
    )
    .props.onChange({
      target: { value: 'Esse soldador trabalha principalmente com' },
    });
  t = h.render(p);
  await button(t, 'Gravar orientação por voz').props.onClick();
  t = h.render(p);
  assert.equal(button(t, 'Gerar proposta').props.disabled, true);
  await button(t, 'Parar e transcrever').props.onClick();
  await settle();
  t = h.render(p);
  assert.equal(starts, 1);
  const field = nodes(t).find(
    (n) =>
      n.type === 'TextField' &&
      n.props.label === 'Orientações para a descrição',
  );
  assert.equal(
    field.props.value,
    'Esse soldador trabalha principalmente com solda estanho em componentes eletrônicos',
  );
  button(t, 'Gerar proposta').props.onClick();
  await settle();
  t = h.render(p);
  assert.equal(sent[0].additionalGuidance, field.props.value);
  button(t, 'Aplicar descrição').props.onClick();
  assert.deepEqual(applied, ['Descrição orientada']);
  assert.equal(
    notices[0][0],
    'Importante: esta descrição foi elaborada com auxílio de inteligência artificial. Solicite ao RH ou ao responsável da empresa a validação das informações antes de utilizá-las em documentos oficiais.',
  );
  assert.equal(notices[0][1].variant, 'info');
});
test('voice failure/cancel do not change the description or generate automatically', async () => {
  const p = props('Existente'),
    applied = [];
  p.onApply = (value) => applied.push(value);
  let calls = 0;
  const audio = {
    state: 'idle',
    error: 'Microfone indisponível',
    startRecording: async () => {},
    stopRecording: async () => null,
    cancelRecording: () => {},
  };
  const h = harness(async () => {
    calls++;
    return { description: 'unused' };
  }, audio);
  h.render(p);
  let t = h.render(p);
  button(t, 'Gerar descrição com IA').props.onClick();
  t = h.render(p);
  assert.ok(text(t).includes('Microfone indisponível'));
  button(t, 'Cancelar').props.onClick();
  assert.equal(calls, 0);
  assert.equal(applied.length, 0);
  assert.equal(p.description, 'Existente');
});
