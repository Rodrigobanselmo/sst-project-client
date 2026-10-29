import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as identityUtil from './ai-risk-occurrence.identity';
import * as eligibility from './ai-risk-occurrence-eligibility.util';
import { RiskByOccurrenceAiSession } from './risk-by-occurrence-ai-session.util';
import * as scopeUtil from '../risk-factors-ai-scope.util';
import * as reviewUtil from '../../../../../../../modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';
import * as mergeUtil from '../../../../../../../modals/ModalAddCharacterization/components/ModalAiAnalysisContent/merge-ai-risk-suggestions.util';
import * as storageUtil from '../../../../../../../modals/ModalAddCharacterization/utils/ai-risk-analysis-session-storage.util';
import { acceptPendingAiSuggestion } from '../accept-pending-ai-suggestion.util';
import * as pendingUtil from '../risk-factor-ai-pending.util';

let current: Hooks;
const contexts: any[] = [];
const react: any = {
  createElement: (type: any, props: any, ...children: any[]) => ({
    type,
    props: { ...props, ...(children.length ? { children } : {}) },
  }),
  createContext: (value: any) => {
    const context: any = { value };
    context.Provider = { context };
    contexts.push(context);
    return context;
  },
  useContext: (context: any) => context.value,
  useState: (value: any) => current.state(value),
  useRef: (value: any) => current.ref(value),
  useMemo: (fn: any, deps: any[]) => current.memo(fn, deps),
  useCallback: (fn: any, deps: any[]) => current.memo(() => fn, deps),
  useEffect: (fn: any, deps: any[]) => current.effect(fn, deps),
  useLayoutEffect: (fn: any, deps: any[]) => current.effect(fn, deps),
};
class Hooks {
  slots: any[] = [];
  index = 0;
  scheduled: Array<() => void> = [];
  state(value: any) {
    const i = this.index++;
    if (!(i in this.slots))
      this.slots[i] = { value: typeof value === 'function' ? value() : value };
    return [
      this.slots[i].value,
      (next: any) => {
        this.slots[i].value =
          typeof next === 'function' ? next(this.slots[i].value) : next;
      },
    ];
  }
  ref(value: any) {
    const i = this.index++;
    if (!(i in this.slots)) this.slots[i] = { current: value };
    return this.slots[i];
  }
  memo(fn: any, deps: any[]) {
    const i = this.index++;
    const old = this.slots[i];
    if (!old || deps.some((value, n) => value !== old.deps[n]))
      this.slots[i] = { deps, value: fn() };
    return this.slots[i].value;
  }
  effect(fn: any, deps: any[]) {
    const i = this.index++;
    const old = this.slots[i];
    if (!old || deps.some((value, n) => value !== old.deps[n]))
      this.scheduled.push(() => {
        old?.cleanup?.();
        this.slots[i] = { deps, cleanup: fn() };
      });
  }
  render(fn: any) {
    current = this;
    this.index = 0;
    const result = fn();
    this.scheduled.splice(0).forEach((fn) => fn());
    return result;
  }
  unmount() {
    this.slots.forEach((slot) => slot?.cleanup?.());
  }
}
const base =
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/';
const disk = new Map<string, string>();
const sessionStorage = {
  getItem: (key: string) => disk.get(key) ?? null,
  setItem: (key: string, value: string) => {
    disk.set(key, value);
  },
};
function load(file: string, dependencies: Record<string, any>) {
  const exports: any = {};
  const js = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  runInNewContext(js, {
    exports,
    AbortController,
    Error,
    window: { sessionStorage },
    require: (name: string) => {
      if (name === 'react') return react;
      if (name in dependencies) return dependencies[name];
      throw Error('Missing dependency ' + name);
    },
  });
  return exports;
}
const stateModule = load(
  'src/components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState.ts',
  {
    'components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/by-risk-occurrence/ai-risk-occurrence.identity':
      identityUtil,
    '../components/ModalAiAnalysisContent/merge-ai-risk-suggestions.util':
      mergeUtil,
    '../components/ModalAiAnalysisContent/ai-risk-field-suggestion.util':
      reviewUtil,
    '../utils/ai-risk-analysis-session-storage.util': storageUtil,
  },
);
const row = (owner: string, id: string) => ({
  id,
  companyId: 'company',
  riskId: 'risk',
  homogeneousGroupId: owner,
  riskFactorGroupDataId: 'group',
  generateSources: [],
  adms: [],
  engs: [],
  recs: [],
  probability: 2,
  probabilityAfter: 1,
});
let companyId = 'company',
  workspaceId = 'ws-a',
  detailWorkspace = 'ws-a';
let detailType = 'ACTIVITIES';
const rows: any[] = [row('owner-a', 'rfd-a'), row('owner-b', 'rfd-b')];
let freshRows = rows;
const calls: any[] = [];
const deferred: Array<(value: any) => void> = [];
let wrongValidationIdentity = false;
const api = (params: any) => {
  calls.push(params);
  if (params.validateOnly)
    return Promise.resolve({
      metadata: {
        occurrenceValidated: true,
        occurrence: wrongValidationIdentity
          ? { ...params.occurrence, ownerId: 'foreign' }
          : params.occurrence,
      },
    });
  return new Promise((resolve) => deferred.push(resolve));
};
const scopeModule = load(base + 'by-risk-occurrence/RiskByRiskAiScope.tsx', {
  '@v2/services/security/hierarchy/ai-analyze-hierarchy-risk.service': { aiAnalyzeHierarchyRisk: api },
  'project/enum/permission.enum': {
    PermissionEnum: {
      RISK_DATA: '4.3',
      HOMO_GROUP: '6',
      CHARACTERIZATION: '4.6',
      MASTER: 'master',
    },
  },
  'project/enum/roles.enums': { RoleEnum: { MASTER: 'master' } },
  '../../components/SideRowTable/components/columns/ProbabilityColumn': {
    isCurrentProbabilityLocked: (data: any) => !!data.locked,
  },
  'core/hooks/useGetCompanyId': { useGetCompanyId: () => ({ companyId }) },
  'core/hooks/useAppSelector': {
    useAppSelector: (select: any) =>
      select({ permissions: ['4.3-u', '6-c', '4.6-c'], roles: [] }),
  },
  'core/hooks/useTabWorkspaceId': {
    useTabWorkspaceId: () => ({ workspaceId }),
  },
  'store/reducers/user/userSlice': {
    selectUserPermissions: (state: any) => state.permissions,
    selectUserRoles: (state: any) => state.roles,
  },
  'core/services/hooks/queries/useQueryCharacterization': {
    useQueryCharacterization: (id: string) => ({
      data: { id, companyId, workspaceId: detailWorkspace, type: detailType },
    }),
  },
  'core/services/hooks/queries/useQueryRiskData': {
    useRiskDataOperationWorkspaceId: () => workspaceId,
    queryRiskData: async () => freshRows,
  },
  '@v2/services/security/homogeneous-group/ai-analyze-gse/service/ai-analyze-gse.service':
    { aiAnalyzeGse: api },
  '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.service':
    { aiAnalyzeCharacterization: api },
  'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState':
    stateModule,
  '../RiskFactorsAiProvider': {
    RiskFactorsAiProvider: 'SharedProvider',
    RiskFactorsAiDisabled: 'Disabled',
  },
  '../risk-factors-ai-scope.util': scopeUtil,
  './risk-by-occurrence-ai-session.util': {
    createRiskByOccurrenceAiSession: () =>
      new RiskByOccurrenceAiSession(sessionStorage),
  },
  './ai-risk-occurrence.identity': identityUtil,
  './ai-risk-occurrence-eligibility.util': eligibility,
});
let buttonContext: any;
const buttonModule = load(base + 'RiskFactorAiButton.tsx', {
  './RiskFactorsAiProvider': { useRiskFactorsAiOptional: () => buttonContext },
  '@mui/icons-material/AutoAwesomeOutlined': { __esModule: true, default: 'Star' },
  'components/atoms/SIconButton': { __esModule: true, default: 'SIconButton' },
});
let editorHierarchyType = 'OFFICE';
let editorNodeWorkspace = 'ws-a';
let editorKind = 'GSE';
let editorOwnerType = 'ACTIVITIES';
let editorLinkedWorkspaces = ['ws-a', 'ws-b'];
const editorModule = load(base + 'EditorProbabilityAiScope.tsx', {
  'core/services/hooks/queries/useQueryHierarchies': { useQueryHierarchies: () => ({ data: { 'owner-a': { id: 'owner-a', companyId: 'company', type: editorHierarchyType, status: 'ACTIVE', workspaceIds: [editorNodeWorkspace] } } }) },
  'core/hooks/useGetCompanyId': { useGetCompanyId: () => ({ companyId }) },
  'core/hooks/useTabWorkspaceId': { useTabWorkspaceId: () => ({ workspaceId }) },
  'core/services/hooks/queries/useQueryGHOAll': { useQueryGHOAll: () => ({ data: [{ id: 'owner-a', companyId: 'company', status: 'ACTIVE', type: editorKind === 'GSE' ? null : editorKind === 'HIERARCHY' ? 'HIERARCHY' : editorOwnerType, workspaceIds: editorLinkedWorkspaces }] }) },
  'core/services/hooks/queries/useQueryRiskDataByGho': { useQueryRiskDataByGho: () => ({ data: freshRows }) },
  './by-risk-occurrence/RiskByRiskAiScope': scopeModule,
  './RiskFactorsAiProvider': {
    useRiskFactorsAiOptional: () => ({ suggestions: { pendingFor: () => [] } }),
    RiskFactorAiOccurrenceBoundary: 'BoundColumns', RiskFactorsAiDisabled: 'Disabled',
  },
});
const mounts = new Map<string, Hooks>();
let used: Set<string>;
function expand(node: any, path = 'root'): any {
  if (Array.isArray(node))
    return node.map((item, i) => expand(item, path + '/' + i));
  if (!node || typeof node !== 'object') return node;
  if (typeof node.type === 'function') {
    const key =
      path + '/' + node.type.name + '/' + String(node.props.key || '');
    used.add(key);
    if (!mounts.has(key)) mounts.set(key, new Hooks());
    return expand(
      mounts.get(key)!.render(() => node.type(node.props)),
      key,
    );
  }
  if (node.type?.context) node.type.context.value = node.props.value;
  return {
    ...node,
    props: {
      ...node.props,
      children: expand(node.props?.children, path + '/children'),
    },
  };
}
function draw(currentRows = rows, type: string | null = null): any[] {
  used = new Set();
  const children = currentRows.map((item) =>
    react.createElement(scopeModule.RiskByRiskAiOccurrence, {
      key: item.id,
      gho: {
        id: item.homogeneousGroupId,
        companyId,
        status: 'ACTIVE',
        type,
        workspaceIds: ['ws-a', 'ws-b'],
      },
      row: item,
      rows: currentRows,
      riskId: 'risk',
      riskGroupId: 'group',
      children: 'columns',
    }),
  );
  const tree = expand(
    react.createElement(scopeModule.RiskByRiskAiScope, {
      riskId: 'risk',
      riskGroupId: 'group',
      viewData: type ? 'CHARACTERIZATION' : 'GSE',
      children,
    }),
  );
  for (const [key, mount] of mounts)
    if (!used.has(key)) {
      mount.unmount();
      mounts.delete(key);
    }
  const walk = (node: any): any[] =>
    Array.isArray(node)
      ? node.flatMap(walk)
      : node && typeof node === 'object'
        ? [node, ...walk(node.props?.children)]
        : [];
  return walk(tree).filter((node) => node.type === 'SharedProvider');
}
const review = (id: string) => ({
  riskId: 'risk',
  riskFactorDataId: id,
  name: 'Ruído',
  suggestions: [
    {
      field: 'generateSource',
      suggestedValues: ['Máquina'],
      currentValues: [],
      applyMode: 'append',
    },
  ],
});
const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};
async function main() {
  draw();
  let providers = draw();
  assert.equal(providers.length, 2);
  const [a, b] = providers.map((node) => node.props.byRiskOccurrence);
  assert.notEqual(
    identityUtil.aiRiskOccurrenceContextKey(a.identity),
    identityUtil.aiRiskOccurrenceContextKey(b.identity),
  );
  let closedA = 0;
  const unsubscribe = a.subscribeInactive(() => closedA++);
  const operationA = a
    .analyze(
      {
        scope: 'risk',
        riskId: 'risk',
        selectedFields: ['generateSource', 'probability'],
        userGuidance: 'Apenas esta ocorrência',
      },
      new AbortController().signal,
    )
    .then(
      () => 'resolved',
      (error: any) => error.name,
    );
  await tick();
  assert.equal(calls[0].occurrence.riskFactorDataId, 'rfd-a');
  assert.deepEqual(Array.from(calls[0].selectedFields), [
    'fonteGeradora',
    'probabilidade',
  ]);
  const operationB = b.analyze(
    { scope: 'field', riskId: 'risk', field: 'generateSource' },
    new AbortController().signal,
  );
  await tick();
  assert.equal(closedA, 1);
  assert.ok(calls[0].signal.aborted);
  deferred[0]({ existingRiskReviews: [review('rfd-a')] });
  assert.equal(await operationA, 'AbortError');
  const responseB = { existingRiskReviews: [review('rfd-b')] };
  deferred[1](responseB);
  assert.equal(await operationB, responseB);
  assert.ok(b.isResponseCurrent(responseB));
  assert.equal(calls.length, 2, 'generation performs no persistence calls');
  providers[1].props.target.analysis.mergeIncomingExistingRiskReviews(
    responseB.existingRiskReviews,
  );
  providers = draw();
  assert.equal(
    providers[1].props.target.analysis.existingRiskReviews.length,
    1,
  );
  assert.equal(
    providers[0].props.target.analysis.existingRiskReviews.length,
    0,
  );
  b.activate();
  a.activate();
  b.activate();
  assert.equal(
    b.isResponseCurrent(responseB),
    false,
    'old responses stay invalid even after returning to the same occurrence',
  );
  providers = draw();
  assert.equal(
    providers[1].props.target.analysis.existingRiskReviews[0].riskFactorDataId,
    'rfd-b',
  );
  const suggestion = pendingUtil.pendingSuggestionsForColumn({
    reviews: [review('rfd-b')] as any,
    riskId: 'risk',
    column: 'source',
    riskData: rows[1],
    appliedKeys: new Set(),
    dismissedKeys: new Set(),
  })[0];
  const acceptance = providers[1].props.byRiskOccurrence.prepareAcceptance(
    suggestion,
    rows[1],
  );
  assert.ok(acceptance);
  assert.equal(await acceptance.beforeWrite(), true);
  assert.ok(calls.at(-1).validateOnly);
  assert.equal(calls.at(-1).occurrence.riskFactorDataId, 'rfd-b');
  wrongValidationIdentity = true;
  assert.equal(await acceptance.beforeWrite(), false);
  wrongValidationIdentity = false;
  assert.equal(
    providers[1].props.byRiskOccurrence.prepareAcceptance(
      { ...suggestion, riskFactorDataId: 'rfd-a' },
      rows[1],
    ),
    null,
  );
  assert.equal(
    providers[1].props.byRiskOccurrence.canApproveProbability({
      ...rows[1],
      isQuantity: true,
    }),
    false,
  );
  assert.equal(
    providers[1].props.byRiskOccurrence.canApproveProbability({
      ...rows[1],
      locked: true,
    }),
    false,
  );
  let writes = 0,
    confirmations = 0;
  const control = {
    ...suggestion,
    field: 'existingAdministrativeMeasures',
    action: 'confirm-existence',
  } as any;
  const common: any = {
    suggestion: control,
    riskData: rows[1],
    companyId: 'company',
    isActive: acceptance.isActive,
    beforeWrite: acceptance.beforeWrite,
    write: async () => {
      writes++;
    },
    readSavedRow: async () => ({ ...rows[1], adms: [{ medName: 'Máquina' }] }),
    markApplied: () => {},
  };
  assert.equal(
    await acceptPendingAiSuggestion({
      ...common,
      confirmExistence: async () => {
        confirmations++;
        return false;
      },
    }),
    'cancelled',
  );
  assert.equal(writes, 0);
  assert.equal(
    await acceptPendingAiSuggestion({
      ...common,
      confirmExistence: async () => {
        confirmations++;
        return true;
      },
    }),
    'applied',
  );
  assert.equal(confirmations, 2);
  assert.equal(writes, 1);
  const wrong = { ...rows[1], homogeneousGroupId: 'foreign' };
  assert.equal(providers[1].props.byRiskOccurrence.validate(wrong), false);
  workspaceId = 'ws-b';
  providers = draw();
  draw();
  assert.equal(acceptance.isActive(), false);
  assert.equal(
    providers[1].props.target.analysis.existingRiskReviews.length,
    0,
  );
  workspaceId = 'ws-a';
  draw();
  providers = draw();
  assert.equal(
    providers[1].props.target.analysis.existingRiskReviews[0].riskFactorDataId,
    'rfd-b',
  );
  assert.equal(draw([{ ...rows[0], endDate: '2020-01-01' }]).length, 0);
  assert.equal(draw([{ ...rows[0], isDirect: false }]).length, 0);
  assert.equal(draw([rows[0], { ...rows[0], id: 'duplicate' }]).length, 0);
  const charRows = [row('char-a', 'rfd-char')];
  freshRows = charRows;
  draw(charRows, 'ACTIVITIES');
  providers = draw(charRows, 'ACTIVITIES');
  assert.equal(providers.length, 1);
  assert.equal(providers[0].props.target.kind, 'characterization');
  detailWorkspace = 'foreign';
  assert.equal(draw(charRows, 'ACTIVITIES').length, 0);
  detailWorkspace = 'ws-a';
  companyId = 'other-company';
  assert.equal(draw(charRows, 'ACTIVITIES').length, 0);
  unsubscribe();
  mounts.forEach((mount) => mount.unmount());
  mounts.clear();
  companyId = 'company'; workspaceId = 'ws-a'; detailWorkspace = 'ws-a';
  function drawEditor(kind = 'GSE', editorWorkspace = workspaceId, editorOwner = 'owner-a', hierarchyType = editorHierarchyType) {
    editorKind = kind;
    used = new Set();
    const tree = expand(react.createElement(editorModule.EditorProbabilityAiScope, {
      kind, companyId: 'company', ownerId: editorOwner, riskGroupId: 'group', workspaceId: editorWorkspace, hierarchyType,
      children: react.createElement(editorModule.EditorProbabilityAiBoundary, { data: freshRows[0], children: 'probability-column' }),
    }));
    for (const [key, mount] of mounts) if (!used.has(key)) { mount.unmount(); mounts.delete(key); }
    const found: any[] = [];
    const walk = (node: any) => { if (Array.isArray(node)) return node.forEach(walk); if (!node || typeof node !== 'object') return; if (node.type === 'SharedProvider') found.push(node); walk(node.props?.children); };
    walk(tree); return found;
  }
  freshRows = [row('owner-a', 'editor-row')];
  const callsBeforeMount = calls.length;
  let editorProviders = drawEditor();
  editorProviders = drawEditor();
  assert.equal(editorProviders.length, 1);
  assert.equal(calls.length, callsBeforeMount, 'rendering never generates or writes');
  assert.equal(editorProviders[0].props.probabilityFallback, undefined, 'shared GSE legacy evidence has no workspace provenance');
  editorLinkedWorkspaces = ['ws-a'];
  assert.ok(drawEditor()[0].props.probabilityFallback);
  editorLinkedWorkspaces = ['ws-a', 'ws-b'];
  const editorAdapter = drawEditor()[0].props.byRiskOccurrence;
  const analysisRequest = editorAdapter.analyze({ scope: 'risk', riskId: 'risk', selectedFields: ['probability'] }, new AbortController().signal);
  await Promise.resolve();
  assert.equal(calls.at(-1).scope, 'risk');
  assert.deepEqual(Array.from(calls.at(-1).selectedFields), ['probabilidade']);
  assert.equal(calls.at(-1).occurrence.riskFactorDataId, 'editor-row');
  assert.equal(calls.at(-1).workspaceId, 'ws-a');
  deferred.at(-1)!({ existingRiskReviews: [], metadata: { probabilityAnalysis: { status: 'unchanged', value: 2 } } });
  await analysisRequest;
  const editorSuggestion = { ...suggestion, riskFactorDataId: 'editor-row', field: 'probability', action: 'approve-probability', value: '3' };
  const editorLease = editorAdapter.prepareAcceptance(editorSuggestion, freshRows[0]);
  assert.ok(editorLease);
  assert.equal(await editorLease.beforeWrite(), true);
  let probabilityPatch: unknown;
  const residualBefore = freshRows[0].probabilityAfter;
  assert.equal(await acceptPendingAiSuggestion({
    suggestion: editorSuggestion as any, riskData: freshRows[0], companyId: 'company',
    isActive: editorLease.isActive, beforeWrite: editorLease.beforeWrite,
    confirmExistence: async () => { throw new Error('Probability is not an existing control'); },
    write: async (patch) => { probabilityPatch = patch; },
    readSavedRow: async () => ({ ...freshRows[0], probability: 3 }), markApplied: () => {},
  }), 'applied');
  assert.deepEqual(probabilityPatch, { probability: 3 });
  assert.equal(freshRows[0].probabilityAfter, residualBefore);
  const lateRequest = editorAdapter.analyze({ scope: 'risk', riskId: 'risk', selectedFields: ['probability'] }, new AbortController().signal);
  await Promise.resolve();
  const staleResponse = deferred.at(-1)!;
  workspaceId = 'ws-b'; drawEditor();
  assert.equal(editorLease.isActive(), false);
  staleResponse({ existingRiskReviews: [] });
  await assert.rejects(lateRequest, { name: 'AbortError' });
  workspaceId = ''; assert.equal(drawEditor().length, 0, 'GSE requires explicit establishment');
  workspaceId = 'ws-a';
  freshRows = [{ ...row('owner-a', 'editor-row'), endDate: '2020-01-01' }];
  assert.equal(drawEditor().length, 0);
  freshRows = [{ ...row('owner-a', 'editor-row'), isDirect: false }];
  assert.equal(drawEditor().length, 0);
  freshRows = [row('owner-a', 'editor-row'), row('owner-a', 'duplicate')];
  assert.equal(drawEditor().length, 0);
  freshRows = [{ ...row('owner-a', 'editor-row'), isQuantity: true }];
  editorProviders = drawEditor();
  assert.equal(editorProviders[0].props.byRiskOccurrence.canApproveProbability(freshRows[0]), false);
  freshRows = [row('owner-a', 'editor-row')];
  editorProviders = drawEditor('CHARACTERIZATION'); editorProviders = drawEditor('CHARACTERIZATION');
  assert.equal(editorProviders.length, 1);
  assert.equal(editorProviders[0].props.target.kind, 'characterization');
  assert.ok(editorProviders[0].props.probabilityFallback);
  const charAdapter = editorProviders[0].props.byRiskOccurrence;
  const charRequest = charAdapter.analyze({ scope: 'risk', riskId: 'risk', selectedFields: ['probability'] }, new AbortController().signal);
  await Promise.resolve();
  assert.deepEqual(Array.from(calls.at(-1).selectedFields), ['probabilidade']);
  assert.equal(calls.at(-1).characterizationId, 'owner-a');
  deferred.at(-1)!({ existingRiskReviews: [] }); await charRequest;
  assert.equal(drawEditor('CHARACTERIZATION', 'ws-b').length, 0, 'conflicting establishment is blocked');
  assert.equal(drawEditor('CHARACTERIZATION', 'ws-a', 'other-owner').length, 0);
  companyId = 'other-company'; assert.equal(drawEditor('CHARACTERIZATION').length, 0);
  companyId = 'company'; workspaceId = '';
  assert.equal(drawEditor('CHARACTERIZATION', 'ws-a').length, 1, 'characterization uses its verified own establishment');
  mounts.forEach((mount) => mount.unmount());
  mounts.clear(); workspaceId = 'ws-a'; companyId = 'company'; detailWorkspace = 'ws-a';
  editorOwnerType = 'ENVIRONMENT';
  for (const subtype of ['GENERAL', 'SUPPORT', 'OPERATION', 'ADMINISTRATIVE']) {
    detailType = subtype;
    editorProviders = drawEditor('CHARACTERIZATION');
    editorProviders = drawEditor('CHARACTERIZATION');
    assert.equal(editorProviders.length, 1, `environment ${subtype} is a valid characterization owner`);
    assert.equal(editorProviders[0].props.byRiskOccurrence.canApproveProbability(freshRows[0]), true);
    detailWorkspace = 'foreign';
    assert.equal(drawEditor('CHARACTERIZATION').length, 0);
    detailWorkspace = 'ws-a';
  }
  detailType = 'WORKSTATION'; assert.equal(drawEditor('CHARACTERIZATION').length, 0);
  detailType = 'OPERATION'; freshRows = [{ ...freshRows[0], homogeneousGroupId: 'foreign' }];
  assert.equal(drawEditor('CHARACTERIZATION').length, 0);
  mounts.forEach((mount) => mount.unmount());
  mounts.clear(); companyId = 'company'; workspaceId = 'ws-a'; editorNodeWorkspace = 'ws-a';
  for (const hierarchyType of identityUtil.AI_RISK_OCCURRENCE_HIERARCHY_TYPES) {
    editorHierarchyType = hierarchyType;
    freshRows = [row('owner-a', `hierarchy-${hierarchyType}`)];
    let hierarchyProviders = drawEditor('HIERARCHY'); hierarchyProviders = drawEditor('HIERARCHY');
    assert.equal(hierarchyProviders.length, 1, hierarchyType);
    const hierarchyAdapter = hierarchyProviders[0].props.byRiskOccurrence;
    assert.equal(hierarchyProviders[0].props.target.kind, 'hierarchy');
    assert.equal(hierarchyAdapter.identity.ownerType, 'HIERARCHY');
    assert.equal(hierarchyAdapter.identity.hierarchyId, 'owner-a');
    assert.equal(hierarchyAdapter.identity.hierarchyType, hierarchyType);
    assert.equal(freshRows[0].generateSources.length, 0, 'absence of sources alone never hides the shortcut');
    buttonContext = { byRiskOccurrence: hierarchyAdapter, openProbability: () => {} };
    assert.ok(buttonModule.RiskFactorProbabilityAiButton({ riskId: 'risk' }));
    assert.equal(buttonModule.RiskFactorProbabilityAiButton({}), null);
    const probabilityRequest = hierarchyAdapter.analyze({ scope: 'risk', riskId: 'risk', selectedFields: ['probability'] }, new AbortController().signal);
    await tick();
    const sent = calls.at(-1);
    assert.equal(sent.hierarchyId, 'owner-a'); assert.equal(sent.hierarchyType, hierarchyType);
    assert.equal(sent.riskFactorDataId, freshRows[0].id); assert.equal(sent.occurrence.ownerId, 'owner-a');
    assert.equal(sent.gseId, undefined); assert.equal(sent.characterizationId, undefined);
    assert.equal(sent.scope, 'risk'); assert.deepEqual(Array.from(sent.selectedFields), ['probabilidade']);
    const result = { existingRiskReviews: [{ ...review(freshRows[0].id), suggestions: [{ field: 'probability', suggestedValues: 3, currentValues: 2, applyMode: 'replace-scalar' }] }], metadata: { occurrence: hierarchyAdapter.identity, occurrenceValidated: true } };
    deferred.at(-1)!(result); await probabilityRequest;
    assert.equal(hierarchyAdapter.isResponseCurrent(result), true);
    const pSuggestion: any = { riskId: 'risk', riskFactorDataId: freshRows[0].id, field: 'probability', action: 'approve-probability', value: '3', key: 'risk:probability:3' };
    const lease = hierarchyAdapter.prepareAcceptance(pSuggestion, freshRows[0]); assert.ok(lease);
    assert.equal(await lease.beforeWrite(), true);
    assert.equal(calls.at(-1).validateOnly, true); assert.equal(calls.at(-1).hierarchyType, hierarchyType);
    let savedPatch: unknown;
    assert.equal(await acceptPendingAiSuggestion({ suggestion: pSuggestion, riskData: freshRows[0], companyId: 'company', isActive: lease.isActive, beforeWrite: lease.beforeWrite, confirmExistence: async () => true, write: async (value) => { savedPatch = value; }, readSavedRow: async () => ({ ...freshRows[0], probability: 3 }), markApplied: () => {} }), 'applied');
    assert.deepEqual(savedPatch, { probability: 3 }); assert.equal(freshRows[0].probabilityAfter, 1);
    freshRows = [{ ...freshRows[0], isQuantity: true }];
    hierarchyProviders = drawEditor('HIERARCHY');
    buttonContext = { byRiskOccurrence: hierarchyProviders[0].props.byRiskOccurrence, openProbability: () => {} };
    assert.equal(buttonModule.RiskFactorProbabilityAiButton({ riskId: 'risk' }), null);
    freshRows = [{ ...freshRows[0], isQuantity: false, locked: true }];
    hierarchyProviders = drawEditor('HIERARCHY'); buttonContext.byRiskOccurrence = hierarchyProviders[0].props.byRiskOccurrence;
    assert.equal(buttonModule.RiskFactorProbabilityAiButton({ riskId: 'risk' }), null);
    freshRows = [row('owner-a', `hierarchy-${hierarchyType}`)];
    hierarchyProviders = drawEditor('HIERARCHY'); const current = hierarchyProviders[0].props.byRiskOccurrence;
    const late = current.analyze({ scope: 'risk', riskId: 'risk', selectedFields: ['probability'] }, new AbortController().signal).catch((error: any) => error.name);
    await tick(); const lateResponse = deferred.at(-1)!;
    workspaceId = 'ws-b'; assert.equal(drawEditor('HIERARCHY').length, 0, 'node is not linked to another workspace');
    lateResponse({ existingRiskReviews: [] }); assert.equal(await late, 'AbortError'); assert.equal(lease.isActive(), false);
    workspaceId = 'ws-a';
    assert.equal(drawEditor('HIERARCHY', workspaceId, 'owner-a', 'INVALID').length, 0);
    freshRows = [{ ...freshRows[0], isDirect: false }]; assert.equal(drawEditor('HIERARCHY').length, 0);
  }
  // Employee selection uses its existing SUB_OFFICE owner; no employee id or technical GSE is substituted.
  const toolSource = readFileSync(base + '../RiskTool.tsx', 'utf8');
  const openSource = readFileSync(base + '../hooks/useOpenRiskTool.ts', 'utf8');
  assert.ok(toolSource.includes('ModalEnum.AUTOMATE_SUB_OFFICE'));
  assert.ok(openSource.includes('viewData = ViewsDataEnum.HIERARCHY'));
  mounts.forEach((mount) => mount.unmount());
  const rowSource = readFileSync(
    base + '../components/RiskToolViews/RiskToolByRiskView/Row.tsx',
    'utf8',
  );
  assert.ok(rowSource.includes('RiskByRiskAiOccurrence'));
  assert.ok(rowSource.includes('RiskFactorAiOccurrenceBoundary'));
  assert.ok(rowSource.includes('hideRiskAiButton={false}'));
  console.log(
    'Modal/ocorrência: identidade, GSE/elementos, sessão compartilhada, pendências, confirmação, revalidação e cancelamento integrados: OK',
  );
}
void main();
