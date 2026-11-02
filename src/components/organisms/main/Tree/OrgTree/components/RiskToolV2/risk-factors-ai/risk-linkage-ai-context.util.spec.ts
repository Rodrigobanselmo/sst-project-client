import assert from 'node:assert/strict';
import {
  PROBABILITY_AI_GUIDANCE,
  PROBABILITY_AI_MESSAGES,
} from './probability-ai-result.util';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import {
  resolveRiskLinkageAiContext,
  riskLinkageAiContextKey,
  riskLinkageAiOccurrenceSignature,
  canAnalyzeRiskLinkageOccurrence,
  canUseRiskLinkageRow,
  filterRiskLinkageOccurrenceReviews,
  RiskLinkageAiContext,
  RiskFactorAiOccurrenceScope,
} from './risk-linkage-ai-context.util';
import {
  buildAiAnalyzeScopePayload,
  filterReviewsForRiskFactorAi,
  scopedAiEmptyMessage,
  existingControlEmptyMessage,
} from './risk-factors-ai-scope.util';
import { acceptPendingAiSuggestion } from './accept-pending-ai-suggestion.util';
import * as pending from './risk-factor-ai-pending.util';
import {
  buildAiRiskAnalysisSessionKey,
  readAiRiskAnalysisSession,
  writeAiRiskAnalysisSession,
} from '../../../../../../modals/ModalAddCharacterization/utils/ai-risk-analysis-session-storage.util';

const context: RiskLinkageAiContext = {
  kind: 'gse',
  companyId: 'company',
  workspaceId: 'ws-2',
  entityId: 'gse-a',
  riskGroupId: 'group',
};
const row = {
  id: 'rfd-a',
  riskId: 'risk',
  companyId: 'company',
  homogeneousGroupId: 'gse-a',
  riskFactorGroupDataId: 'group',
  generateSources: [],
  recs: [],
  adms: [],
  engs: [],
  probability: 2,
  probabilityAfter: 1,
};
const scope: RiskFactorAiOccurrenceScope = { context, rows: [row] };
const entities = [
  {
    id: 'gse-a',
    companyId: 'company',
    type: null,
    status: 'ACTIVE',
    workspaceIds: ['ws-1', 'ws-2'],
  },
  {
    id: 'char-a',
    companyId: 'company',
    type: 'ENVIRONMENT',
    workspaceIds: ['ws-2'],
    characterization: { id: 'char-a' },
  },
];
const input = {
  viewData: 'GSE',
  companyId: 'company',
  riskGroupId: 'group',
  selectedEntityId: 'gse-a',
  workspaceId: 'ws-2',
  entities,
};
const review = (riskFactorDataId = 'rfd-a') => ({
  riskId: 'risk',
  riskFactorDataId,
  name: 'Ruído',
  suggestions: [
    {
      field: 'generateSource' as const,
      suggestedValues: ['Máquina'],
      currentValues: [],
      applyMode: 'append' as const,
    },
    {
      field: 'probability' as const,
      suggestedValues: 4,
      currentValues: 2,
      applyMode: 'replace-scalar' as const,
    },
  ],
});

// Render the production component/hook functions with isolated hook and I/O doubles.
// This exercises callbacks and effect cleanup without a browser or API request.
let current: HookHarness;
const react = {
  createElement: (type: any, props: any, ...children: any[]) => ({
    type,
    props: { ...props, ...(children.length ? { children } : {}) },
  }),
  createContext: (value: any) => {
    const ctx: any = { value };
    ctx.Provider = { context: ctx };
    return ctx;
  },
  useContext: (ctx: any) => ctx.value,
  useState: (initial: any) => current.state(initial),
  useRef: (initial: any) => current.ref(initial),
  useMemo: (fn: () => any) => fn(),
  useCallback: (fn: any) => fn,
  useEffect: (fn: () => any, deps: any[]) => current.effect(fn, deps),
  useLayoutEffect: (fn: () => any, deps: any[]) => current.effect(fn, deps),
};
class HookHarness {
  slots: any[] = [];
  index = 0;
  scheduled: Array<() => void> = [];
  state(initial: any) {
    const i = this.index++;
    if (!(i in this.slots))
      this.slots[i] = {
        value: typeof initial === 'function' ? initial() : initial,
      };
    return [
      this.slots[i].value,
      (value: any) => {
        this.slots[i].value =
          typeof value === 'function' ? value(this.slots[i].value) : value;
      },
    ];
  }
  ref(initial: any) {
    const i = this.index++;
    if (!(i in this.slots)) this.slots[i] = { current: initial };
    return this.slots[i];
  }
  effect(fn: () => any, deps: any[]) {
    const i = this.index++;
    const previous = this.slots[i];
    if (
      !previous ||
      deps.some((value, index) => value !== previous.deps[index])
    ) {
      this.scheduled.push(() => {
        previous?.cleanup?.();
        this.slots[i] = { deps, cleanup: fn() };
      });
    }
  }
  render(fn: () => any) {
    current = this;
    this.index = 0;
    const result = fn();
    this.scheduled.splice(0).forEach((effect) => effect());
    return result;
  }
  unmount() {
    this.slots.forEach((slot) => slot?.cleanup?.());
  }
}
function loadComponent(file: string, dependencies: Record<string, any>) {
  const exports: Record<string, any> = {};
  const source = readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, {
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
    require: (name: string) => {
      if (name === 'react') return react;
      if (name in dependencies) return dependencies[name];
      if (name === '@mui/material')
        return new Proxy({}, { get: (_, name) => String(name) });
      throw new Error('Missing test dependency: ' + name);
    },
  });
  return exports;
}
const nodes = (node: any): any[] =>
  Array.isArray(node)
    ? node.flatMap(nodes)
    : node && typeof node === 'object'
      ? [node, ...nodes(node.props?.children)]
      : [];
const base =
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/';
const occurrenceUtils = {
  canUseRiskLinkageRow,
  canAnalyzeRiskLinkageOccurrence,
  filterRiskLinkageOccurrenceReviews,
};

async function main() {
  assert.deepEqual(resolveRiskLinkageAiContext(input).context, context);
  assert.equal(
    resolveRiskLinkageAiContext({ ...input, selectedEntityId: 'gse-a//ws-1' })
      .context?.workspaceId,
    'ws-2',
  );
  const char = resolveRiskLinkageAiContext({
    ...input,
    viewData: 'CHARACTERIZATION',
    selectedEntityId: 'char-a',
  }).context!;
  assert.equal(char.kind, 'characterization');
  for (const patch of [
    { workspaceId: undefined },
    { workspaceId: 'other' },
    { routeWorkspaceId: 'ws-1' },
    { companyId: 'other-company' },
    { selectedEntityId: 'unknown' },
    { entities: [{ ...entities[0], type: 'HIERARCHY' }] },
    { entities: [{ ...entities[0], status: 'INACTIVE' }] },
  ])
    assert.equal(
      resolveRiskLinkageAiContext({ ...input, ...patch }).context,
      null,
    );
  for (const viewData of ['EMPLOYEE'])
    assert.deepEqual(resolveRiskLinkageAiContext({ ...input, viewData }), {
      context: null,
    });
  assert.ok(
    resolveRiskLinkageAiContext({
      ...input,
      workspaceId: undefined,
    }).message?.includes('Selecione um estabelecimento'),
  );
  assert.equal(canAnalyzeRiskLinkageOccurrence(scope, 'risk', 'rfd-a'), true);
  for (const patch of [
    { id: '' },
    { companyId: 'other' },
    { homogeneousGroupId: 'gse-b' },
    { homogeneousGroupId: undefined },
    { riskFactorGroupDataId: 'other' },
    { workspaceId: 'ws-1' },
    { endDate: '2020-01-01' },
    { deletedAt: '2020-01-01' },
    { startDate: '2999-01-01' },
    { startDate: 'invalid' },
    { isDirect: false },
    { canEditOnThisEntity: false },
    { originId: 'gse-b' },
    { originKind: 'HIERARCHY' as const },
    { hierarchyId: 'sector' },
    { resolutionSource: 'ORIGIN_ELEMENT' },
  ])
    assert.equal(
      canAnalyzeRiskLinkageOccurrence(
        { context, rows: [{ ...row, ...patch }] },
        'risk',
        'rfd-a',
      ),
      false,
      JSON.stringify(patch),
    );
  assert.equal(
    canAnalyzeRiskLinkageOccurrence(
      {
        context,
        rows: [row, { ...row, id: 'rfd-old', endDate: '2020-01-01' }],
      },
      'risk',
      'rfd-a',
    ),
    false,
  );
  assert.equal(
    canAnalyzeRiskLinkageOccurrence(scope, 'risk', 'rfd-other'),
    false,
  );
  assert.deepEqual(
    filterRiskLinkageOccurrenceReviews(
      [review(), review('rfd-other')],
      scope,
      'risk',
      'rfd-a',
    ),
    [review()],
  );
  assert.deepEqual(
    filterRiskLinkageOccurrenceReviews(
      [{ ...review(), riskFactorDataId: undefined }],
      scope,
      'risk',
      'rfd-a',
    ),
    [],
  );
  const partial = {
    scope: 'risk' as const,
    riskId: 'risk',
    selectedFields: ['generateSource' as const],
  };
  assert.deepEqual(
    filterReviewsForRiskFactorAi([review()], partial)[0].suggestions.map(
      (item) => item.field,
    ),
    ['generateSource'],
  );
  assert.deepEqual(
    buildAiAnalyzeScopePayload({
      ...partial,
      riskFactorDataId: 'rfd-a',
    } as any),
    { scope: 'risk', riskId: 'risk', selectedFields: ['fonteGeradora'] },
  );

  // Separate sessions preserve previous pending lists without changing any legacy key.
  const params = {
    gseId: context.entityId,
    companyId: context.companyId,
    workspaceId: context.workspaceId,
    riskGroupId: context.riskGroupId,
  };
  const oldKey = buildAiRiskAnalysisSessionKey(params)!;
  assert.equal(oldKey, 'gse-ai-risk-analysis:company:ws-2:gse-a:group');
  const signature = riskLinkageAiOccurrenceSignature([row]);
  const linkageKey = buildAiRiskAnalysisSessionKey({
    ...params,
    sessionNamespace: 'risk-linkage-v1',
    occurrenceSignature: signature,
  })!;
  assert.notEqual(oldKey, linkageKey);
  const storage = new Map<string, string>();
  (globalThis as any).window = {
    sessionStorage: {
      getItem: (key: string) => storage.get(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  };
  writeAiRiskAnalysisSession(linkageKey, {
    existingRiskReviews: [review()],
  } as any);
  writeAiRiskAnalysisSession(oldKey, {
    existingRiskReviews: [review('editor-row')],
  } as any);
  assert.equal(
    readAiRiskAnalysisSession(linkageKey)?.existingRiskReviews[0]
      .riskFactorDataId,
    'rfd-a',
  );
  assert.equal(
    readAiRiskAnalysisSession(oldKey)?.existingRiskReviews[0].riskFactorDataId,
    'editor-row',
  );
  for (const patch of [
    { companyId: 'other' },
    { workspaceId: 'ws-1' },
    { entityId: 'gse-b' },
    { kind: 'characterization' as const },
    { riskGroupId: 'other' },
  ])
    assert.notEqual(
      riskLinkageAiContextKey(context),
      riskLinkageAiContextKey({ ...context, ...patch }),
    );
  assert.notEqual(
    signature,
    riskLinkageAiOccurrenceSignature([{ ...row, id: 'replacement-row' }]),
  );
  assert.equal(
    signature,
    riskLinkageAiOccurrenceSignature([{ ...row, workspaceId: 'ws-2' }]),
  );
  delete (globalThis as any).window;

  const suggestion = pending.pendingSuggestionsForColumn({
    reviews: [review()],
    riskId: 'risk',
    column: 'source',
    riskData: row,
    appliedKeys: new Set(),
    dismissedKeys: new Set(),
  })[0];
  assert.equal(suggestion.riskFactorDataId, row.id);
  let writes = 0,
    applied = 0;
  assert.equal(
    await acceptPendingAiSuggestion({
      suggestion,
      riskData: row,
      companyId: 'company',
      confirmExistence: async () => true,
      write: () => {
        writes++;
      },
      readSavedRow: async () =>
        ({ ...row, generateSources: [{ name: 'Máquina' }] }) as any,
      markApplied: () => applied++,
    }),
    'applied',
  );
  assert.equal(writes, 1);
  assert.equal(applied, 1);
  let active = true;
  const control = {
    ...suggestion,
    field: 'existingAdministrativeMeasures' as const,
    action: 'confirm-existence' as const,
  };
  assert.equal(
    await acceptPendingAiSuggestion({
      suggestion: control,
      riskData: row,
      companyId: 'company',
      isActive: () => active,
      confirmExistence: async () => {
        active = false;
        return true;
      },
      write: () => {
        writes++;
      },
      readSavedRow: async () => row,
      markApplied: () => applied++,
    }),
    'cancelled',
  );
  assert.equal(writes, 1);
  assert.equal(applied, 1);
  assert.deepEqual(
    pending.buildPendingAcceptPayload({
      suggestion: {
        ...suggestion,
        field: 'probability',
        action: 'approve-probability',
        value: '4',
      },
      riskData: row,
      companyId: 'company',
    }),
    { probability: 4 },
  );

  // Actual shared provider: strict row binding, immediate field action, configured risk action,
  // unchanged API payloads and suppression of late results after each context switch.
  const calls: any[] = [];
  const merged: any[] = [];
  let resolveRequest!: (result: any) => void;
  const execute = (payload: any) => {
    calls.push(payload);
    return new Promise((resolve) => {
      resolveRequest = resolve;
    });
  };
  const module = loadComponent(base + 'RiskFactorsAiProvider.tsx', {
    '@v2/services/security/hierarchy/ai-analyze-hierarchy-risk.service': {
      aiAnalyzeHierarchyRisk: execute,
    },
    '@v2/components/atoms/SButton/SButton': { SButton: 'SButton' },
    '@v2/components/atoms/SText/SText': { SText: 'SText' },
    '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization':
      { useMutateAiAnalyzeCharacterization: () => ({ mutateAsync: execute }) },
    '@v2/services/security/homogeneous-group/ai-analyze-gse/hooks/useMutateAiAnalyzeGse':
      { useMutateAiAnalyzeGse: () => ({ mutateAsync: execute }) },
    '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/is-ai-analyze-request-canceled.util':
      { isAiAnalyzeRequestCanceled: () => false },
    'core/hooks/useGetCompanyId': {
      useGetCompanyId: () => ({ workspaceId: 'ignored-route' }),
    },
    'core/services/hooks/queries/useQueryRiskDataByGho': {
      useQueryRiskDataByGho: () => ({ data: [row] }),
    },
    'components/organisms/modals/ModalAddGHO/gse-ai-analyze.constants': {
      GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE: 'workspace required',
    },
    'components/organisms/modals/ModalAddGHO/get-gse-linked-workspace-ids.util':
      { getGseLinkedWorkspaceIds: () => ['legacy-first'] },
    './merge-probability-suggestion-actions.util': await import('./merge-probability-suggestion-actions.util'),
    './probability-ai-result.util': await import(
      './probability-ai-result.util'
    ),
    './risk-factor-ai-pending.util': pending,
    './risk-factors-ai-scope.util': {
      buildAiAnalyzeScopePayload,
      filterReviewsForRiskFactorAi,
      scopedAiEmptyMessage,
      existingControlEmptyMessage,
    },
    './useRiskFactorAiSuggestionActions': {
      useRiskFactorAiSuggestionActions: () => ({ pendingFor: () => [] }),
    },
    './RiskFactorAiConfigurationDialog': {
      RiskFactorAiConfigurationDialog: 'RiskFactorAiConfigurationDialog',
    },
    './run-cancelable-risk-analysis.util': await import(
      './run-cancelable-risk-analysis.util'
    ),
    './RiskFactorAiNewRiskCandidates': {
      RiskFactorAiNewRiskCandidates: 'RiskFactorAiNewRiskCandidates',
    },
    './risk-linkage-ai-context.util': occurrenceUtils,
  });
  for (const switched of [
    { ...context, entityId: 'gse-b' },
    { ...context, workspaceId: 'ws-1' },
  ]) {
    assert.notEqual(
      riskLinkageAiContextKey(context),
      riskLinkageAiContextKey(switched),
    );
    const mount = new HookHarness();
    const target = {
      kind: 'gse',
      companyId: context.companyId,
      gseId: context.entityId,
      workspaceId: context.workspaceId,
      riskGroupId: 'group',
      analysis: {
        mergeIncomingExistingRiskReviews: (reviews: any) =>
          merged.push(reviews),
      },
    };
    const render = () =>
      mount.render(() =>
        module.RiskFactorsAiProvider({
          target,
          individualOnly: true,
          occurrenceScope: scope,
          children: 'grid',
        }),
      );
    let tree = render();
    assert.equal(
      nodes(tree).some(
        (node) =>
          node.props?.text === 'Análise geral com IA' ||
          node.type === 'RiskFactorAiNewRiskCandidates',
      ),
      false,
    );
    tree.type.context.value = tree.props.value;
    const boundary = new HookHarness().render(() =>
      module.RiskFactorAiOccurrenceBoundary({ riskData: row, children: 'row' }),
    );
    const bound = boundary.props.value;
    const denied = new HookHarness().render(() =>
      module.RiskFactorAiOccurrenceBoundary({
        riskData: { ...row, isDirect: false },
        children: 'inherited row',
      }),
    );
    assert.equal(denied.props.value, null);
    bound.openField({ riskId: 'risk', field: 'generateSource' });
    tree = render();
    assert.equal(
      nodes(tree).some(
        (node) => node.type === 'RiskFactorAiConfigurationDialog',
      ),
      false,
    );
    assert.ok(nodes(tree).find((node) => node.type?.name === 'ScopedAiDialog'));
    bound.openRisk({ riskId: 'risk', riskName: 'Ruído' });
    tree = render();
    const configuration = nodes(tree).find(
      (node) => node.type === 'RiskFactorAiConfigurationDialog',
    );
    assert.ok(configuration);
    assert.equal(calls.length, merged.length);
    configuration.props.onGenerate({
      selectedFields: ['generateSource'],
      userGuidance: 'Uma única fonte.',
    });
    tree = render();
    const dialog = nodes(tree).find(
      (node) => node.type?.name === 'ScopedAiDialog',
    );
    assert.equal(dialog.props.request.riskFactorDataId, 'rfd-a');
    const dialogMount = new HookHarness();
    dialogMount.render(() => dialog.type(dialog.props));
    await Promise.resolve();
    const payload = calls[calls.length - 1];
    assert.equal(payload.workspaceId, 'ws-2');
    assert.equal(payload.gseId, 'gse-a');
    assert.deepEqual(Array.from(payload.selectedFields), ['fonteGeradora']);
    assert.equal(payload.userGuidance, 'Uma única fonte.');
    assert.equal('riskFactorDataId' in payload, false);
    mount.unmount();
    dialogMount.unmount();
    assert.equal(payload.signal.aborted, true);
    resolveRequest({ existingRiskReviews: [review()] });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(merged.length, 0);
    // Dispatch count is cumulative; no late result was ever incorporated.
    calls.length = 0;
  }
  // Characterization follows its own endpoint and accepts only the exact returned RFD.
  const charRow = { ...row, id: 'rfd-char', homogeneousGroupId: 'char-a' };
  const charMount = new HookHarness();
  const charTarget = {
    kind: 'characterization',
    companyId: 'company',
    workspaceId: 'ws-2',
    characterizationId: 'char-a',
    riskGroupId: 'group',
    analysis: {
      mergeIncomingExistingRiskReviews: (reviews: any) => merged.push(reviews),
    },
  };
  const charRender = () =>
    charMount.render(() =>
      module.RiskFactorsAiProvider({
        target: charTarget,
        individualOnly: true,
        occurrenceScope: { context: char, rows: [charRow] },
        children: 'grid',
      }),
    );
  let charTree = charRender();
  charTree.type.context.value = charTree.props.value;
  const charBoundary = new HookHarness().render(() =>
    module.RiskFactorAiOccurrenceBoundary({
      riskData: charRow,
      children: 'row',
    }),
  );
  charBoundary.props.value.openField({
    riskId: 'risk',
    field: 'generateSource',
  });
  charTree = charRender();
  const charDialog = nodes(charTree).find(
    (node) => node.type?.name === 'ScopedAiDialog',
  );
  const charDialogMount = new HookHarness();
  charDialogMount.render(() => charDialog.type(charDialog.props));
  await Promise.resolve();
  const charPayload = calls[calls.length - 1];
  assert.equal(charPayload.characterizationId, 'char-a');
  assert.equal(charPayload.workspaceId, 'ws-2');
  assert.equal(charPayload.scope, 'field');
  assert.equal(charPayload.field, 'fonteGeradora');
  assert.equal('gseId' in charPayload, false);
  resolveRequest({
    existingRiskReviews: [review('rfd-char'), review('other-occurrence')],
  });
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(merged.length, 1);
  assert.equal(merged[0].length, 1);
  assert.equal(merged[0][0].riskFactorDataId, 'rfd-char');
  assert.equal(merged[0][0].suggestions.length, 1);
  charMount.unmount();
  charDialogMount.unmount();

  // Exercise the adapter's real selection, keyed subtrees and detail validation.
  let state = {
    gho: { selected: { id: 'gse-a' } },
    riskAdd: { viewData: 'GSE' },
  };
  let headerWorkspace: string | undefined = 'ws-2';
  let detailWorkspace = 'ws-2';
  const sessionParams: any[] = [];
  const hierarchyEntities = [
    'DIRECTORY',
    'MANAGEMENT',
    'SECTOR',
    'SUB_SECTOR',
    'OFFICE',
    'SUB_OFFICE',
  ].map((type) => ({
    id: type,
    type,
    companyId: 'company',
    status: 'ACTIVE',
    workspaceIds: ['ws-2'],
  }));
  const ownerRefreshes: any[] = [];
  const adapterModule = loadComponent(base + 'RiskLinkageAiProvider.tsx', {
    'core/enums/query.enums': { QueryEnum: { GHO: 'gho' } },
    'core/services/queryClient': { queryClient: { invalidateQueries: (key: any) => { ownerRefreshes.push(key); return Promise.resolve(); } } },
    './EditorProbabilityAiScope': { EditorProbabilityAiScope: 'EditorProbabilityAiScope' },
    'core/hooks/useAppSelector': {
      useAppSelector: (select: any) => select(state),
    },
    'core/hooks/useTabWorkspaceId': {
      useTabWorkspaceId: () => ({ workspaceId: headerWorkspace }),
    },
    'core/hooks/useGetCompanyId': { useGetCompanyId: () => ({}) },
    'core/services/hooks/queries/useQueryHierarchies': {
      useQueryHierarchies: () => ({
        data: Object.fromEntries(
          hierarchyEntities.map((entity) => [entity.id, entity]),
        ),
      }),
    },
    'core/services/hooks/queries/useQueryGHOAll': {
      useQueryGHOAll: () => ({ data: entities }),
    },
    'core/services/hooks/queries/useQueryCharacterization': {
      useQueryCharacterization: () => ({
        data: {
          id: 'char-a',
          companyId: 'company',
          workspaceId: detailWorkspace,
        },
      }),
    },
    'core/services/hooks/queries/useQueryRiskDataByGho': {
      useQueryRiskDataByGho: (_: string, id: string) => ({
        data: id === 'char-a' ? [charRow] : [row],
      }),
    },
    'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState':
      {
        useCharacterizationAiRiskAnalysisState: (params: any) => {
          sessionParams.push(params);
          return {};
        },
      },
    './RiskFactorsAiProvider': {
      RiskFactorsAiProvider: 'RiskFactorsAiProvider',
    },
    './risk-linkage-ai-context.util': {
      resolveRiskLinkageAiContext,
      riskLinkageAiContextKey,
      riskLinkageAiOccurrenceSignature,
    },
  });
  const expand = (node: any): any => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map(expand);
    if (typeof node.type === 'function')
      return expand(new HookHarness().render(() => node.type(node.props)));
    return {
      ...node,
      props: { ...node.props, children: expand(node.props?.children) },
    };
  };
  const renderAdapter = () =>
    expand(
      new HookHarness().render(() =>
        adapterModule.RiskLinkageAiProvider({
          companyId: 'company',
          riskGroupId: 'group',
          children: 'grid',
        }),
      ),
    );
  let adapterTree = renderAdapter();
  let provider = nodes(adapterTree).find(
    (node) => node.type === 'RiskFactorsAiProvider',
  );
  assert.equal(provider.props.target.kind, 'gse');
  assert.equal(provider.props.target.workspaceId, 'ws-2');
  assert.equal(provider.props.individualOnly, true);
  const probabilityScope = nodes(adapterTree).find((node) => node.type === 'EditorProbabilityAiScope');
  assert.equal(probabilityScope.props.kind, 'GSE');
  assert.equal(probabilityScope.props.ownerId, 'gse-a');
  assert.equal(probabilityScope.props.workspaceId, 'ws-2');
  assert.equal(probabilityScope.props.jointWorkspaceScoped, true);
  assert.equal(ownerRefreshes.length, 0, 'existing GSE cache policy remains unchanged');
  assert.equal(sessionParams.at(-1).sessionNamespace, 'risk-linkage-v1');
  state = {
    gho: { selected: { id: 'char-a' } },
    riskAdd: { viewData: 'CHARACTERIZATION' },
  };
  provider = nodes(renderAdapter()).find(
    (node) => node.type === 'RiskFactorsAiProvider',
  );
  assert.equal(provider.props.target.kind, 'characterization');
  detailWorkspace = 'wrong-workspace';
  assert.equal(
    nodes(renderAdapter()).some(
      (node) => node.type === 'RiskFactorsAiProvider',
    ),
    false,
  );
  detailWorkspace = 'ws-2';
  headerWorkspace = undefined;
  assert.equal(
    nodes(renderAdapter()).some(
      (node) => node.type === 'RiskFactorsAiProvider',
    ),
    false,
  );
  headerWorkspace = 'ws-2';
  for (const viewData of ['EMPLOYEE']) {
    state.riskAdd.viewData = viewData;
    assert.equal(
      nodes(renderAdapter()).some(
        (node) => node.type === 'RiskFactorsAiProvider',
      ),
      false,
    );
  }

  for (const entity of hierarchyEntities) {
    state = {
      gho: { selected: { id: `${entity.id}//ws-2` } },
      riskAdd: { viewData: 'SIMPLE_BY_GROUP' },
    };
    const linkageHierarchyTree = renderAdapter();
    const probabilityScope = nodes(linkageHierarchyTree).find((node) => node.type === 'EditorProbabilityAiScope');
    assert.equal(probabilityScope.props.kind, 'HIERARCHY');
    assert.equal(probabilityScope.props.ownerId, entity.id);
    assert.equal(probabilityScope.props.hierarchyType, entity.type);
    const hierarchyProvider = nodes(linkageHierarchyTree).find(
      (node) => node.type === 'RiskFactorsAiProvider',
    );
    assert.equal(hierarchyProvider.props.target.kind, 'hierarchy');
    assert.equal(hierarchyProvider.props.target.hierarchyType, entity.type);
    assert.equal(sessionParams.at(-1).hierarchyId, entity.id);
    assert.equal(JSON.stringify(ownerRefreshes.at(-1)), JSON.stringify(['gho', 'company']));
    assert.equal(sessionParams.at(-1).gseId, undefined);
    const hierarchyContext = {
      ...context,
      kind: 'hierarchy' as const,
      entityId: entity.id,
      hierarchyType: entity.type,
    };
    const direct = {
      ...row,
      homogeneousGroupId: entity.id,
      hierarchyId: entity.id,
      originKind: 'HIERARCHY' as const,
      originId: entity.id,
    };
    const hierarchyScope = { context: hierarchyContext, rows: [direct] };
    assert.ok(canUseRiskLinkageRow(hierarchyScope, direct));
    for (const override of [
      { isDirect: false },
      { canEditOnThisEntity: false },
      { originId: 'parent' },
      { homogeneousGroupId: 'parent' },
      { hierarchyId: 'child' },
      { originKind: 'GSE' },
      { endDate: '2025-01-01' },
      { startDate: '2999-01-01' },
      { companyId: 'other' },
      { workspaceId: 'other' },
      { id: 'replacement' },
    ]) {
      assert.equal(
        canUseRiskLinkageRow(hierarchyScope, { ...direct, ...override } as any),
        false,
      );
    }
    assert.equal(
      filterRiskLinkageOccurrenceReviews(
        [review(), review('other')],
        hierarchyScope,
        row.riskId,
        row.id,
      ).length,
      1,
    );
    const otherContext = { ...hierarchyContext, entityId: 'other-level' };
    assert.equal(
      canUseRiskLinkageRow({ context: otherContext, rows: [direct] }, direct),
      false,
    );
    assert.notEqual(
      riskLinkageAiContextKey(hierarchyContext),
      riskLinkageAiContextKey(otherContext),
    );
    const key = buildAiRiskAnalysisSessionKey({
      companyId: context.companyId,
      workspaceId: context.workspaceId,
      hierarchyId: entity.id,
      hierarchyType: entity.type,
      riskGroupId: 'group',
    });
    assert.ok(key?.startsWith('hierarchy-ai-risk-analysis:'));
    assert.notEqual(
      key,
      buildAiRiskAnalysisSessionKey({ gseId: entity.id, riskGroupId: 'group' }),
    );
    const hierarchyMount = new HookHarness();
    const hierarchyTree = hierarchyMount.render(() =>
      module.RiskFactorsAiProvider({
        target: {
          ...hierarchyProvider.props.target,
          analysis: {
            mergeIncomingExistingRiskReviews: (incoming: any) =>
              merged.push(incoming),
          },
        },
        occurrenceScope: hierarchyScope,
        individualOnly: true,
        children: 'grid',
      }),
    );
    const hierarchyApi = hierarchyTree.props.value;
    hierarchyApi.openField({
      riskId: row.riskId,
      riskFactorDataId: row.id,
      field: 'generateSource',
    });
    const withDialog = hierarchyMount.render(() =>
      module.RiskFactorsAiProvider({
        target: {
          ...hierarchyProvider.props.target,
          analysis: {
            mergeIncomingExistingRiskReviews: (incoming: any) =>
              merged.push(incoming),
          },
        },
        occurrenceScope: hierarchyScope,
        individualOnly: true,
        children: 'grid',
      }),
    );
    const dialog = nodes(withDialog).find(
      (node) =>
        typeof node.type === 'function' && node.type.name === 'ScopedAiDialog',
    );
    const dialogMount = new HookHarness();
    dialogMount.render(() => dialog.type(dialog.props));
    await Promise.resolve();
    const payload = calls.at(-1);
    assert.equal(payload.hierarchyId, entity.id);
    assert.equal(payload.hierarchyType, entity.type);
    assert.equal(payload.riskFactorDataId, row.id);
    assert.equal(payload.riskGroupId, 'group');
    assert.equal('gseId' in payload, false);
    const before = merged.length;
    hierarchyMount.unmount();
    dialogMount.unmount();
    assert.ok(payload.signal.aborted);
    resolveRequest({ existingRiskReviews: [review()] });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(merged.length, before);
  }

  // The actual acceptance hook filters by RFD id and cannot fall back to another row.
  let accepted = 0,
    wrote = 0,
    failureMessages = 0;
  let openConfirmation: (...args: any[]) => Promise<boolean> = async () => true;
  const modalState: any = {
    modals: [],
    setModals: (modals: any[]) => {
      modalState.modals = modals;
    },
  };
  const actionsModule = loadComponent(
    base + 'useRiskFactorAiSuggestionActions.ts',
    {
      '@v2/components/organisms/SModal/hooks/useConfirmationModal': {
        useConfirmationModal: () => ({
          showConfirmation: (...options: any[]) => openConfirmation(...options),
        }),
      },
      '@v2/services/security/characterization/characterization/existing-control-suggestion/service/existing-control-suggestion.service':
        { updateExistingControlSuggestion: async () => {} },
      '@v2/hooks/useModal': {
        useModalState: { getState: () => modalState },
        ModalKeyEnum: { CONFIRMATION_MODAL: 'CONFIRMATION_MODAL' },
      },
      notistack: {
        useSnackbar: () => ({ enqueueSnackbar: () => failureMessages++ }),
      },
      'core/hooks/useTabWorkspaceId': {
        useTabWorkspaceId: () => ({ workspaceId: 'ws-2' }),
      },
      'core/services/hooks/queries/useQueryRiskDataByGho': {
        useQueryRiskDataByGho: () => ({
          refetch: async () => ({
            data: [
              {
                ...row,
                id: 'other-occurrence',
                generateSources: [{ name: 'Máquina' }],
              },
            ],
          }),
        }),
      },
      'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/suggestion-apply-plan.util':
        { existenceConfirmationCopy: () => ({}) },
      './accept-pending-ai-suggestion.util': { acceptPendingAiSuggestion },
      './risk-factor-ai-pending.util': pending,
    },
  );
  const actions = new HookHarness().render(() =>
    actionsModule.useRiskFactorAiSuggestionActions({
      companyId: 'company',
      apiWorkspaceId: 'ws-2',
      riskGroupId: 'group',
      entityId: 'gse-a',
      validateOccurrence: (candidate: any) =>
        canUseRiskLinkageRow(scope, candidate),
      analysis: {
        existingRiskReviews: [review(), review('other-occurrence')],
        appliedModularSuggestionKeysSet: new Set(),
        dismissedModularSuggestionKeysSet: new Set(),
        markModularSuggestionApplied: () => accepted++,
        dismissModularSuggestion: () => {},
      },
    }),
  );
  assert.equal(
    actions.pendingFor({ riskId: 'risk', column: 'source', riskData: row })
      .length,
    1,
  );
  assert.equal(
    actions.pendingFor({
      riskId: 'risk',
      column: 'source',
      riskData: { ...row, endDate: '2020-01-01' },
    }).length,
    0,
  );
  await actions.accept({
    suggestion: { ...suggestion, riskFactorDataId: 'other-occurrence' },
    riskData: row,
    handleSelect: async () => {
      wrote++;
    },
  });
  assert.equal(wrote, 0);
  await actions.accept({
    suggestion,
    riskData: row,
    handleSelect: async () => {
      wrote++;
    },
  });
  assert.equal(wrote, 1);
  assert.equal(accepted, 0);
  assert.equal(failureMessages, 1);

  // Hierarchy uses the same explicit confirmation/discard actions, with its own occurrence guard.
  for (const hierarchyType of [
    'DIRECTORY',
    'MANAGEMENT',
    'SECTOR',
    'SUB_SECTOR',
    'OFFICE',
    'SUB_OFFICE',
  ]) {
    const hierarchyRow = { ...row, homogeneousGroupId: 'node' };
    const hierarchyScope = {
      context: {
        ...context,
        kind: 'hierarchy' as const,
        entityId: 'node',
        hierarchyType,
      },
      rows: [hierarchyRow],
    };
    let confirmed = 0,
      dismissed = 0;
    const mutations: any[] = [];
    openConfirmation = async () => {
      confirmed++;
      return false;
    };
    const hierarchyActions = new HookHarness().render(() =>
      actionsModule.useRiskFactorAiSuggestionActions({
        companyId: 'company',
        apiWorkspaceId: 'ws-2',
        riskGroupId: 'group',
        entityId: 'node',
        validateOccurrence: (candidate: any) =>
          canUseRiskLinkageRow(hierarchyScope, candidate),
        analysis: {
          existingRiskReviews: [review()],
          appliedModularSuggestionKeysSet: new Set(),
          dismissedModularSuggestionKeysSet: new Set(),
          markModularSuggestionApplied: () => {},
          dismissModularSuggestion: () => dismissed++,
        },
      }),
    );
    await hierarchyActions.accept({
      suggestion: control,
      riskData: hierarchyRow,
      handleSelect: async (payload: any) => {
        mutations.push(payload);
      },
    });
    await hierarchyActions.accept({
      suggestion: {
        ...suggestion,
        field: 'probability',
        action: 'approve-probability',
        value: '4',
      },
      riskData: hierarchyRow,
      handleSelect: async (payload: any) => {
        mutations.push(payload);
      },
    });
    assert.equal(confirmed, 2);
    assert.equal(mutations.length, 0);
    openConfirmation = async () => true;
    await hierarchyActions.accept({
      suggestion: {
        ...suggestion,
        field: 'probability',
        action: 'approve-probability',
        value: '4',
      },
      riskData: hierarchyRow,
      handleSelect: async (payload: any) => {
        mutations.push(payload);
      },
    });
    assert.deepEqual(mutations, [{ probability: 4 }]);
    hierarchyActions.dismiss({
      suggestion,
      riskData: { ...hierarchyRow, isDirect: false },
    });
    assert.equal(dismissed, 0);
    hierarchyActions.dismiss({ suggestion, riskData: hierarchyRow });
    assert.equal(dismissed, 1);
    assert.equal(mutations.length, 1);
  }

  // An outstanding confirmation belongs to the old context and closes on unmount.
  const untouched = { key: 'UNRELATED', content: 'preserved' };
  modalState.modals = [untouched];
  openConfirmation = () =>
    new Promise<boolean>((resolve) => {
      modalState.modals.push({
        key: 'CONFIRMATION_MODAL',
        content: { props: { onCancel: () => resolve(false) } },
      });
    });
  const confirmationMount = new HookHarness();
  const confirmationActions = confirmationMount.render(() =>
    actionsModule.useRiskFactorAiSuggestionActions({
      companyId: 'company',
      apiWorkspaceId: 'ws-2',
      riskGroupId: 'group',
      entityId: 'gse-a',
      validateOccurrence: (candidate: any) =>
        canUseRiskLinkageRow(scope, candidate),
      analysis: {
        existingRiskReviews: [review()],
        appliedModularSuggestionKeysSet: new Set(),
        dismissedModularSuggestionKeysSet: new Set(),
        markModularSuggestionApplied: () => accepted++,
        dismissModularSuggestion: () => {},
      },
    }),
  );
  const confirmationPending = confirmationActions.accept({
    suggestion: {
      ...suggestion,
      field: 'probability',
      action: 'approve-probability',
      value: '4',
    },
    riskData: row,
    handleSelect: async () => {
      wrote++;
    },
  });
  assert.equal(modalState.modals.length, 2);
  confirmationMount.unmount();
  await confirmationPending;
  assert.equal(modalState.modals.length, 1);
  assert.equal(modalState.modals[0], untouched);
  assert.equal(wrote, 1);
  // New by-risk adapter reuses the SAME provider/dialog and acceptance hook.
  let inactive!: () => void;
  const byRiskCalls: any[] = [];
  const byRiskMerges: any[] = [];
  const byRiskAdapter: any = {
    identity: {
      companyId: 'company',
      workspaceId: 'ws-2',
      ownerType: 'GSE',
      ownerId: 'gse-a',
      riskGroupId: 'group',
      riskId: row.riskId,
      riskFactorDataId: row.id,
    },
    row,
    activate: () => {},
    validate: (candidate: any) =>
      candidate?.id === row.id &&
      candidate?.homogeneousGroupId === row.homogeneousGroupId,
    canApproveProbability: (candidate: any) => !candidate.isQuantity,
    subscribeInactive: (close: any) => {
      inactive = close;
      return () => {};
    },
    isResponseCurrent: () => true,
    analyze: async (request: any) => {
      byRiskCalls.push(request);
      return { existingRiskReviews: [review(), review('other-occurrence')] };
    },
  };
  const byRiskProps = {
    target: {
      kind: 'gse',
      companyId: 'company',
      workspaceId: 'ws-2',
      gseId: 'gse-a',
      riskGroupId: 'group',
      analysis: {
        mergeIncomingExistingRiskReviews: (value: any) =>
          byRiskMerges.push(value),
      },
    },
    byRiskOccurrence: byRiskAdapter,
    individualOnly: true,
    children: 'grid',
  };
  const byRiskMount = new HookHarness();
  let byRiskTree = byRiskMount.render(() =>
    module.RiskFactorsAiProvider(byRiskProps),
  );
  assert.equal(
    nodes(byRiskTree).some(
      (node) => node.type === 'RiskFactorAiNewRiskCandidates',
    ),
    false,
  );
  byRiskTree.props.value.openRisk({
    riskId: row.riskId,
    riskFactorDataId: row.id,
    riskName: 'Ruído',
  });
  byRiskTree = byRiskMount.render(() =>
    module.RiskFactorsAiProvider(byRiskProps),
  );
  assert.ok(
    nodes(byRiskTree).some(
      (node) => node.type === 'RiskFactorAiConfigurationDialog',
    ),
  );
  inactive();
  byRiskTree = byRiskMount.render(() =>
    module.RiskFactorsAiProvider(byRiskProps),
  );
  assert.equal(
    nodes(byRiskTree).some(
      (node) => node.type === 'RiskFactorAiConfigurationDialog',
    ),
    false,
  );
  byRiskTree.props.value.openProbability({
    riskId: row.riskId,
    riskFactorDataId: row.id,
  });
  byRiskTree = byRiskMount.render(() =>
    module.RiskFactorsAiProvider(byRiskProps),
  );
  let byRiskDialog = nodes(byRiskTree).find(
    (node) =>
      typeof node.type === 'function' && node.type.name === 'ScopedAiDialog',
  );
  const byRiskDialogMount = new HookHarness();
  byRiskDialogMount.render(() => byRiskDialog.type(byRiskDialog.props));
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(byRiskCalls.length, 1);
  assert.deepEqual(Array.from(byRiskCalls[0].selectedFields), ['probability']);
  assert.equal(byRiskMerges[0].length, 1);
  assert.equal(byRiskMerges[0][0].riskFactorDataId, row.id);
  assert.deepEqual(
    Array.from(byRiskMerges[0][0].suggestions.map((item: any) => item.field)),
    ['probability'],
  );
  byRiskDialogMount.unmount();
  // Render the actual dialog after completion, including session filters and eligibility.
  for (const scenario of [
    { outcome: 'pending', value: 4 },
    { outcome: 'unchanged', value: 2 },
    { outcome: 'unavailable' },
    { outcome: 'applied', value: 4 },
    { outcome: 'dismissed', value: 4 },
    { outcome: 'ineligible', value: 4 },
    { outcome: 'rejected' },
    { outcome: 'joint' },
  ]) {
    const resolvedKeys = new Set([`risk:probability:${scenario.value}`]);
    const appliedKeys =
      scenario.outcome === 'applied' ? resolvedKeys : new Set<string>();
    const dismissedKeys =
      scenario.outcome === 'dismissed' ? resolvedKeys : new Set<string>();
    const incoming = scenario.value === 4 ? [review()] : [];
    const metadata =
      scenario.outcome === 'unchanged'
        ? { status: 'unchanged', value: 2 }
        : scenario.value === 4
          ? { status: 'suggested', value: 4 }
          : { status: 'unavailable' };
    const props = {
      ...byRiskDialog.props,
      request: {
        ...byRiskDialog.props.request,
        probabilityShortcut: scenario.outcome !== 'joint',
      },
      analysis: {
        ...byRiskDialog.props.analysis,
        appliedModularSuggestionKeysSet: appliedKeys,
        dismissedModularSuggestionKeysSet: dismissedKeys,
      },
      byRiskOccurrence: {
        ...byRiskAdapter,
        canApproveProbability: () => scenario.outcome !== 'ineligible',
        analyze: async () => {
          if (scenario.outcome === 'rejected')
            throw {
              response: {
                status: 422,
                data: { code: 'HISTORICAL_OCCURRENCE' },
              },
            };
          return {
            existingRiskReviews: incoming,
            metadata: { probabilityAnalysis: metadata },
          };
        },
      },
      suggestions: {
        pendingFor: (params: any) =>
          pending.pendingSuggestionsForColumn({
            ...params,
            reviews: incoming,
            appliedKeys,
            dismissedKeys,
          }),
      },
    };
    const mount = new HookHarness();
    mount.render(() => byRiskDialog.type(props));
    for (let tick = 0; tick < 8; tick++) await Promise.resolve();
    const completed = mount.render(() => byRiskDialog.type(props));
    const text = JSON.stringify(completed);
    if (scenario.outcome === 'joint') {
      assert.ok(text.includes(scopedAiEmptyMessage('risk')));
      assert.equal(text.includes(PROBABILITY_AI_GUIDANCE), false);
    } else {
      assert.ok(text.includes(PROBABILITY_AI_GUIDANCE));
      assert.equal(text.includes(scopedAiEmptyMessage('risk')), false);
      if (scenario.outcome === 'pending') {
        assert.ok(text.includes('1 sugestão está disponível'));
        assert.ok(text.includes('Nada foi gravado'));
      } else {
        const outcome =
          scenario.outcome === 'rejected' ? 'ineligible' : scenario.outcome;
        assert.ok(
          text.includes(
            PROBABILITY_AI_MESSAGES[
              outcome as keyof typeof PROBABILITY_AI_MESSAGES
            ],
          ),
          scenario.outcome,
        );
        assert.equal(text.includes('1 sugestão está disponível'), false);
      }
    }
    mount.unmount();
  }
  byRiskMount.unmount();

  const timeline: string[] = [],
    patches: any[] = [],
    metadata: any[] = [];
  let saved: any = row,
    dismissed = 0,
    appliedByRisk = 0;
  openConfirmation = async () => {
    timeline.push('confirmation');
    return true;
  };
  const actionsAdapter = {
    ...byRiskAdapter,
    prepareAcceptance: (_suggestion: any, candidate: any) =>
      candidate.isQuantity
        ? null
        : {
            isActive: () => true,
            beforeWrite: async () => {
              timeline.push('revalidate');
              return true;
            },
          },
    readSavedRow: async () => saved,
  };
  const byRiskActionsMount = new HookHarness();
  const byRiskActions = byRiskActionsMount.render(() =>
    actionsModule.useRiskFactorAiSuggestionActions({
      companyId: 'company',
      apiWorkspaceId: 'ws-2',
      riskGroupId: 'group',
      entityId: 'gse-a',
      byRiskOccurrence: actionsAdapter,
      validateOccurrence: byRiskAdapter.validate,
      analysis: {
        existingRiskReviews: [review()],
        appliedModularSuggestionKeysSet: new Set(),
        dismissedModularSuggestionKeysSet: new Set(),
        markModularSuggestionApplied: () => appliedByRisk++,
        dismissModularSuggestion: () => dismissed++,
      },
    }),
  );
  const write = async (payload: any, context: any) => {
    timeline.push('write');
    patches.push(payload);
    metadata.push(context);
    if (payload.admsAddOnly)
      saved = { ...row, adms: [{ medName: control.value }] };
    else if (payload.recAddOnly)
      saved = { ...row, recs: [{ recName: suggestion.value }] };
    else if (payload.probability)
      saved = { ...row, probability: payload.probability };
  };
  await byRiskActions.accept({
    suggestion: control,
    riskData: row,
    handleSelect: write,
  });
  assert.deepEqual(timeline.slice(0, 3), [
    'confirmation',
    'revalidate',
    'write',
  ]);
  assert.equal(appliedByRisk, 1);
  await byRiskActions.accept({
    suggestion: {
      ...suggestion,
      field: 'recommendedAdministrativeMeasures',
      action: 'accept-recommendation',
    },
    riskData: row,
    handleSelect: write,
  });
  assert.ok(patches.at(-1).recAddOnly);
  await byRiskActions.accept({
    suggestion: {
      ...suggestion,
      field: 'probability',
      action: 'approve-probability',
      value: '4',
    },
    riskData: row,
    handleSelect: write,
  });
  assert.deepEqual(patches.at(-1), { probability: 4 });
  assert.equal(metadata.at(-1).occurrence.riskFactorDataId, row.id);
  const beforeQuantity = patches.length;
  await byRiskActions.accept({
    suggestion: {
      ...suggestion,
      field: 'probability',
      action: 'approve-probability',
      value: '4',
    },
    riskData: { ...row, isQuantity: true },
    handleSelect: write,
  });
  assert.equal(patches.length, beforeQuantity);
  byRiskActions.dismiss({ suggestion, riskData: row });
  assert.equal(dismissed, 1);
  assert.equal(patches.length, beforeQuantity);
  byRiskActionsMount.unmount();

  const legacy = new HookHarness().render(() =>
    module.RiskFactorsAiProvider({
      target: {
        kind: 'gse',
        companyId: 'company',
        gseId: 'gse-a',
        ghoData: {},
        ghoQuery: {},
        analysis: {},
      },
      renderGeneral: () => 'general',
      children: 'grid',
    }),
  );
  assert.ok(
    nodes(legacy).some((node) => node.props?.text === 'Análise geral com IA'),
  );
  assert.ok(
    nodes(legacy).some((node) => node.type === 'RiskFactorAiNewRiskCandidates'),
  );
  const tab = readFileSync(
    'src/pages/dashboard/empresas/[companyId]/novo/[stage]/components/CharacterizationStage/RiskToolByEntityTabContent.tsx',
    'utf8',
  );
  assert.ok(tab.includes('RiskLinkageAiProvider'));
  const adapter = readFileSync(base + 'RiskLinkageAiProvider.tsx', 'utf8');
  assert.ok(adapter.includes('useTabWorkspaceId'));
  assert.ok(
    adapter.includes('key={riskLinkageAiContextKey(resolved.context)}'),
  );
  assert.ok(adapter.includes('key={signature}'));
  assert.ok(adapter.includes('entity.workspaceId !== context.workspaceId'));
  console.log(
    'risk-linkage-ai-context: contexto, estabelecimento, ocorrência, sessões, ações e cancelamento do provider OK',
  );
}
void main();
