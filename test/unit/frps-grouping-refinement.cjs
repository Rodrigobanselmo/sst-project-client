const fs = require('fs'),
  vm = require('vm'),
  assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '../..');
const ts = require(root + '/node_modules/typescript');
const file =
  root +
  '/src/@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormHierarchyGroupManager/components/GroupingAiAssistant.tsx';
const result = {
  contextVersion: 'v1',
  notes: '',
  metadata: {
    requestedModel: 'gpt-6.1-sol',
    generatedAt: new Date().toISOString(),
  },
  proposal: { alternatives: [] },
  alternatives: [
    {
      mode: 'SEPARATE',
      groups: [
        {
          name: 'Grupo de teste',
          category: 'LOW_RESPONSE',
          hierarchyIds: ['s1', 's2'],
          rationale: 'Hipótese de teste',
          uncertainties: [],
          evidence: [],
          requiresContextConfirmation: false,
          coverage: {
            respondents: 3,
            meetsMinimum: true,
            questionsBelowMinimum: 0,
            totalQuestions: 32,
          },
        },
      ],
      ungrouped: [],
      questions: [],
    },
  ],
};
result.proposal.alternatives = result.alternatives.map((a) => ({
  ...a,
  groups: a.groups.map(({ category, coverage, ...g }) => g),
}));
let states = [],
  pos = 0,
  resolvePost,
  rejectPost,
  calls = 0,
  invalidations = 0,
  requests = [];
const ctx = {
  version: 'v1',
  companies: [{ id: 'c1', name: 'Teste' }],
  availableSectors: [
    { id: 's1', name: 'Setor A', establishments: [], sources: [] },
    { id: 's2', name: 'Setor B', establishments: [], sources: [] },
    { id: 's3', name: 'Setor C', establishments: [], sources: [] },
  ],
  existingGroups: [],
  lastProposal: result,
};
const React = {
  useState(initial) {
    let i = pos++;
    if (!(i in states)) states[i] = initial;
    return [
      states[i],
      (v) => (states[i] = typeof v === 'function' ? v(states[i]) : v),
    ];
  },
  useEffect() {},
};
const jsx = (type, props, key) => ({ type, props: props || {}, key });
const mod = { exports: {} };
const rq = {
  useQuery: () => ({ data: ctx, refetch: async () => {} }),
  useQueryClient: () => ({
    invalidateQueries: async () => {
      invalidations++;
    },
  }),
};
const sandbox = {
  exports: mod.exports,
  module: mod,
  require: (n) =>
    n === 'react'
      ? React
      : n === 'react/jsx-runtime'
        ? { jsx, jsxs: jsx, Fragment: 'Fragment' }
        : n === '@tanstack/react-query'
          ? rq
          : n === '@mui/material'
            ? new Proxy({}, { get: (_, k) => k })
            : n === 'core/services/apiClient'
              ? {
                  api: {
                    post: (path, body) => {
                      requests.push({ path, body });
                      calls++;
                      return new Promise((a, b) => {
                        resolvePost = a;
                        rejectPost = b;
                      });
                    },
                  },
                }
              : n === 'core/hooks/useAccess'
                ? { useAccess: () => ({ isMaster: false }) }
                : n.includes('form-query-key')
                  ? {
                      QueryKeyFormEnum: {
                        FORM_HIERARCHY_GROUPS: 'groups',
                        FORM_QUESTIONS_ANSWERS_RISKS: 'risks',
                      },
                    }
                  : n.includes('formatHierarchyGroupOptionLabel') ? {labeledHierarchyContext:()=>[]} : new Proxy({}, { get: (_, k) => k }),
  console,
};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  sandbox,
);
let tree;
function render() {
  pos = 0;
  tree = mod.exports.GroupingAiAssistant({
    companyId: 'c1',
    applicationId: 'a1',
  });
  return tree;
}
function all(n) {
  if (arguments.length === 0) n = tree;
  if (!n || typeof n !== 'object') return [];
  return [n, ...[n.props?.children].flat(Infinity).flatMap((x) => all(x))];
}
function text(n) {
  if (n == null || typeof n === 'boolean') return '';
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  return [n?.props?.children].flat(Infinity).map(text).join('');
}
function find(type, label) {
  return all().find((n) => n.type === type && text(n).includes(label));
}
(async () => {
  render();
  all()
    .find((n) => n.type === 'AiActionButtonGroup')
    .props.onExecute();
  render();
  find('Button', 'Retomar proposta recente').props.onClick();
  render();
  let select = all().find(
    (n) =>
      n.type === 'FormControlLabel' &&
      n.props.label === 'Selecionar esta proposta para criar o agrupamento',
  );
  select.props.control.props.onChange(null, true);
  render();
  assert.equal(find('Button', 'Ajustar proposta'), undefined);
  all().find(n=>n.type==='ProposalInlineAdd').props.onAdd(ctx.availableSectors[2]);
  assert.match(requests[0].path, /\/preview$/);
  assert.deepEqual(Array.from(requests[0].body.edits[0].hierarchyIds), ['s1','s2','s3']);
  assert.equal(
    requests[0].body.proposal.alternatives[0].groups[0].name,
    'Grupo de teste',
  );
  resolvePost({
    data: {
      ...result.alternatives[0],
      groups: [
        {
          ...result.alternatives[0].groups[0],
          name: 'Grupo de teste',
          rationale: 'Ajustado pelo usuário: Contexto confirmado na revisão.',
          adjusted: true,
          requiresContextConfirmation: true,
          evidence: [],
        },
      ],
    },
  });
  await new Promise(setImmediate);
  render();
  assert.equal(find('Button', 'Criar 0').props.disabled, true);
  const confirmation = all().find(
    (n) =>
      n.type === 'FormControlLabel' &&
      n.props.label.startsWith('Li a hipótese'),
  );
  assert.equal(confirmation.props.control.props.checked, false);
  confirmation.props.control.props.onChange(null, true);
  render();
  select = all().find(
    (n) =>
      n.type === 'FormControlLabel' &&
      n.props.label === 'Selecionar esta proposta para criar o agrupamento',
  );
  assert.equal(select.props.control.props.disabled, false);
  select.props.control.props.onChange(null, true);
  render();
  find('Button', 'Criar 1').props.onClick();
  render();
  find('Button', 'Confirmar criação dos selecionados').props.onClick();
  assert.match(requests[1].path, /\/apply$/);
  assert.equal(requests[1].body.edits[0].name, 'Grupo de teste');
  assert.deepEqual(Array.from(requests[1].body.confirmedIndexes), [0]);
  assert.equal(
    requests[1].body.proposal.alternatives[0].groups[0].name,
    'Grupo de teste',
  );
  rejectPost({ response: { data: { message: 'Sem gravação neste teste' } } });
  await new Promise(setImmediate);
  render();
  assert.equal(find('Button', 'Criar 1').props.disabled, false);
  all().find(n=>n.type==='ProposalInlineAdd').props.onAdd(ctx.availableSectors[2]);
  rejectPost({ response: { data: { message: 'Falha de validação simulada' } } });
  await new Promise(setImmediate);
  render();
  assert.equal(find('Button', 'Criar 0').props.disabled, true);
  assert.ok(find('Alert', 'O ajuste não foi aplicado'));
  find('Button', 'Manter composição anterior').props.onClick();
  render();
  assert.equal(find('Alert', 'O ajuste não foi aplicado'), undefined);
  console.log(
    'PASS: refinamento usa preview sem gerar IA, mantém original, zera seleção/confirmação e envia ajustes no apply após nova confirmação.',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
