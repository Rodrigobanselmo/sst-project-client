import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import {
  buildAiAnalyzeScopePayload,
  filterReviewsForRiskFactorAi,
  RISK_FACTOR_AI_API_FIELD,
  RiskFactorAiSelectedField,
} from './risk-factors-ai-scope.util';
import { runCancelableRiskAnalysis } from './run-cancelable-risk-analysis.util';
import { mergeExistingRiskReviews } from '../../../../../../modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';
import { appendTranscribedGuidance } from '../../../../../../modals/ModalAddCharacterization/components/ModalAiAnalysisContent/append-transcribed-guidance.util';
import type { ExistingRiskReview } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

const fields: RiskFactorAiSelectedField[] = [
  ...(Object.keys(RISK_FACTOR_AI_API_FIELD) as Array<
    keyof typeof RISK_FACTOR_AI_API_FIELD
  >),
  'probability',
];
const reviews: ExistingRiskReview[] = ['risk-1', 'other'].map((riskId) => ({
  riskId,
  name: riskId,
  suggestions: fields.map((field) => ({
    field,
    currentValues: [],
    suggestedValues: field === 'probability' ? 3 : ['Texto'],
    applyMode: field === 'probability' ? 'replace-scalar' : 'append',
  })),
}));

async function main() {
  for (let mask = 1; mask < 64; mask++) {
    const selectedFields = fields.filter((_, bit) => (mask & (1 << bit)) !== 0);
    const request = {
      scope: 'risk' as const,
      riskId: 'risk-1',
      selectedFields,
      userGuidance: '  Uma única fonte.  ',
    };
    const payload = buildAiAnalyzeScopePayload(request);
    assert.deepEqual(
      payload.selectedFields,
      selectedFields.map((field) =>
        field === 'probability'
          ? 'probabilidade'
          : RISK_FACTOR_AI_API_FIELD[field],
      ),
    );
    assert.equal(payload.userGuidance, 'Uma única fonte.');
    const filtered = filterReviewsForRiskFactorAi(reviews, request);
    assert.equal(filtered.length, 1);
    assert.deepEqual(
      filtered[0].suggestions.map((suggestion) => suggestion.field),
      selectedFields,
    );
  }
  assert.throws(() =>
    buildAiAnalyzeScopePayload({
      scope: 'risk',
      riskId: 'risk-1',
      selectedFields: [],
    }),
  );
  assert.deepEqual(
    buildAiAnalyzeScopePayload({ scope: 'risk', riskId: 'risk-1' }),
    { scope: 'risk', riskId: 'risk-1' },
  );
  assert.equal(
    filterReviewsForRiskFactorAi(reviews, {
      scope: 'risk',
      riskId: 'risk-1',
    })[0].suggestions.length,
    5,
  );
  assert.deepEqual(
    buildAiAnalyzeScopePayload({
      scope: 'field',
      riskId: 'risk-1',
      field: 'generateSource',
    }),
    { scope: 'field', riskId: 'risk-1', field: 'fonteGeradora' },
  );
  assert.equal(
    buildAiAnalyzeScopePayload({
      scope: 'risk',
      riskId: 'risk-1',
      selectedFields: ['generateSource'],
      userGuidance: '  ',
    }).userGuidance,
    undefined,
  );

  const previous = filterReviewsForRiskFactorAi(reviews, {
    scope: 'risk',
    riskId: 'risk-1',
    selectedFields: ['recommendedEngineeringMeasures'],
  });
  const incoming = filterReviewsForRiskFactorAi(reviews, {
    scope: 'risk',
    riskId: 'risk-1',
    selectedFields: ['probability'],
  });
  const snapshot = JSON.stringify(previous);
  const merged = mergeExistingRiskReviews({ existing: previous, incoming });
  assert.deepEqual(
    merged[0].suggestions.map((item) => item.field),
    ['recommendedEngineeringMeasures', 'probability'],
  );
  assert.equal(JSON.stringify(previous), snapshot);
  assert.equal(
    appendTranscribedGuidance('Texto editado.', 'Nova orientação.'),
    'Texto editado.\nNova orientação.',
  );

  let dispatched = 0;
  let incorporated = 0;
  const cancelled = new AbortController();
  const skipped = runCancelableRiskAnalysis(
    cancelled.signal,
    async () => {
      dispatched++;
      return 1;
    },
    () => incorporated++,
  );
  cancelled.abort();
  await skipped;
  assert.equal(dispatched, 0);
  assert.equal(incorporated, 0);

  const late = new AbortController();
  let resolve!: (value: number) => void;
  const deferred = new Promise<number>((done) => {
    resolve = done;
  });
  const pending = runCancelableRiskAnalysis(
    late.signal,
    () => {
      dispatched++;
      return deferred;
    },
    () => incorporated++,
  );
  await Promise.resolve();
  assert.equal(dispatched, 1);
  late.abort();
  resolve(3);
  await pending;
  assert.equal(incorporated, 0);

  // Simulate the effect setup/cleanup/setup performed by React StrictMode.
  const first = new AbortController();
  const strictFirst = runCancelableRiskAnalysis(
    first.signal,
    async () => {
      dispatched++;
      return 1;
    },
    () => incorporated++,
  );
  first.abort();
  const strictSecond = runCancelableRiskAnalysis(
    new AbortController().signal,
    async () => {
      dispatched++;
      return 1;
    },
    () => incorporated++,
  );
  await Promise.all([strictFirst, strictSecond]);
  assert.equal(dispatched, 2);
  assert.equal(incorporated, 1);
  await assert.rejects(
    runCancelableRiskAnalysis(
      new AbortController().signal,
      async () => {
        throw new Error('falha');
      },
      () => incorporated++,
    ),
  );
  assert.equal(incorporated, 1);

  const base =
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/';
  const provider = readFileSync(base + 'RiskFactorsAiProvider.tsx', 'utf8');
  const openRisk = provider
    .split('const openRisk =')[1]
    .split('useEffect(() =>')[0];
  assert.ok(openRisk.includes('setConfigureRisk(params)'));
  assert.ok(!openRisk.includes('setScoped({'));
  const openField = provider
    .split('const openField =')[1]
    .split('const openRisk =')[0];
  assert.ok(openField.includes("scope: 'field'"));
  assert.ok(!openField.includes('setConfigureRisk'));
  const dialog = readFileSync(
    base + 'RiskFactorAiConfigurationDialog.tsx',
    'utf8',
  );
  assert.ok(dialog.includes('audioBusy'));
  assert.ok(dialog.includes('submitted.current = true'));
  assert.ok(dialog.includes('!selectedFields.length'));
  assert.ok(dialog.includes('AiAnalyzeGuidanceAudioField'));
  // Exercise the actual component's handlers with lightweight hook/UI doubles.
  // No browser, microphone service or external request is needed for selection.
  const state: unknown[] = [];
  let hook = 0;
  const react = {
    createElement: (type: unknown, props: object, ...children: unknown[]) => ({
      type,
      props: { ...props, children },
    }),
    useState: (initial: unknown) => {
      const index = hook++;
      if (!(index in state))
        state[index] = typeof initial === 'function' ? initial() : initial;
      return [
        state[index],
        (next: unknown) => {
          state[index] = typeof next === 'function' ? next(state[index]) : next;
        },
      ];
    },
    useRef: (current: unknown) => ({ current }),
  };
  const exported: Record<string, any> = {};
  const compiled = ts.transpileModule(dialog, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  runInNewContext(compiled, {
    exports: exported,
    require: (name: string) =>
      name === 'react' ? react : new Proxy({}, { get: (_, key) => key }),
  });
  const flatten = (node: any): any[] =>
    Array.isArray(node)
      ? node.flatMap(flatten)
      : node && typeof node === 'object'
        ? [node, ...flatten(node.props?.children)]
        : [];
  const render = () => {
    hook = 0;
    return flatten(
      exported.RiskFactorAiConfigurationDialog({
        riskName: 'Ruído',
        target: {
          kind: 'gse',
          companyId: 'company',
          workspaceId: 'workspace',
          entityId: 'gse',
        },
        onClose: () => {},
        onGenerate: () => {},
      }),
    );
  };
  const bulk = (nodes: any[]) => nodes.find((node) => node.type === 'Button');
  const checkboxes = (nodes: any[]) =>
    nodes
      .filter((node) => node.type === 'FormControlLabel')
      .map((node) => node.props.control);
  const generate = (nodes: any[]) =>
    nodes.find((node) => node.props?.text === 'Gerar sugestões com IA');
  const audio = (nodes: any[]) =>
    nodes.find((node) => node.type === 'AiAnalyzeGuidanceAudioField');
  let nodes = render();
  assert.equal(checkboxes(nodes).length, 6);
  assert.ok(checkboxes(nodes).every((node) => node.props.checked));
  assert.equal(bulk(nodes).props.children[0], 'Desmarcar todos');
  assert.equal(generate(nodes).props.disabled, false);
  audio(nodes).props.onChange('Orientação preservada');
  bulk(nodes).props.onClick();
  nodes = render();
  assert.ok(checkboxes(nodes).every((node) => !node.props.checked));
  assert.equal(bulk(nodes).props.children[0], 'Marcar todos');
  assert.equal(generate(nodes).props.disabled, true);
  bulk(nodes).props.onClick();
  nodes = render();
  assert.ok(checkboxes(nodes).every((node) => node.props.checked));
  assert.equal(generate(nodes).props.disabled, false);
  checkboxes(nodes)[0].props.onChange(null, false);
  nodes = render();
  assert.equal(
    checkboxes(nodes).filter((node) => node.props.checked).length,
    5,
  );
  assert.equal(bulk(nodes).props.children[0], 'Marcar todos');
  bulk(nodes).props.onClick();
  nodes = render();
  assert.ok(checkboxes(nodes).every((node) => node.props.checked));
  assert.equal(bulk(nodes).props.children[0], 'Desmarcar todos');
  assert.equal(audio(nodes).props.value, 'Orientação preservada');
  audio(nodes).props.onBusyChange(true);
  nodes = render();
  assert.equal(generate(nodes).props.disabled, true);
  audio(nodes).props.onBusyChange(false);
  assert.equal(generate(render()).props.disabled, false);
  console.log(
    'Controle Marcar/Desmarcar todos: estado inicial, vazio, parcial, texto e bloqueio por áudio OK',
  );
  console.log(
    'risk-factor-ai-configuration: 63 combinações, compatibilidade, merge, orientação, cancelamento e StrictMode OK',
  );
}
void main();
