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
  lastProposal: null,
};
let effects = [], generation = {status:"ABSENT"};
const React = {
  useState(initial) {
    let i = pos++;
    if (!(i in states)) states[i] = initial;
    return [
      states[i],
      (v) => (states[i] = typeof v === 'function' ? v(states[i]) : v),
    ];
  },
  useEffect(callback) { effects.push(callback); },
  useRef(initial) { return React.useState({current:initial})[0]; },
};
const jsx = (type, props, key) => ({ type, props: props || {}, key });
const mod = { exports: {} };
const rq = {
  useQuery: (options) => options.queryKey[0] === "grouping-ai-generation" ? ({data:generation,refetch:async()=>({data:generation})}) : ({ data: ctx, refetch: async () => {} }),
  useQueryClient: () => ({
    setQueryData: (_, value) => { generation=value; },
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
  effects=[];
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

(async()=>{
 render();all().find(n=>n.type==='AiActionButtonGroup').props.onExecute();render();
 find('Button','Gerar propostas para revisão').props.onClick();
 assert.match(requests[0].path,/\/generation$/);
 const running={status:'RUNNING',startedAt:new Date().toISOString(),elapsedSeconds:1};
 resolvePost({data:running});await new Promise(setImmediate);
 render();effects[0]();render();
 assert.equal(find('Button','Fechar').props.disabled,false);
 assert.equal(all().find(n=>n.type==='AiActionButtonGroup').props.disabled,false);
 assert.ok(find('Typography','Gerando propostas no servidor'));
 generation={...running,status:'SUCCEEDED',result};
 render();effects[0]();render();
 assert.ok(find('Button','Criar 0'));assert.equal(calls,1);
 // Simulate a full component remount/reload while the server retains the result.
 states=[];render();all().find(n=>n.type==='AiActionButtonGroup').props.onExecute();render();effects[0]();render();
 assert.ok(find('Button','Criar 0'));assert.equal(calls,1);
 console.log('PASS: início curto, acompanhamento, fechar/reabrir e retomada após remontagem sem nova chamada à IA.');
})().catch(e=>{console.error(e);process.exitCode=1});
