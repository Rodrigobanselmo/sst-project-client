/**
 * npx tsx src/components/organisms/modals/ModalAddProbability/workspace-employee-counts.spec.ts
 */
import assert from 'node:assert/strict';

import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

import {
  CountSuggestionDecision,
  probabilityModalOpenState,
  QualitativeProbabilityCriteria,
  resolveCountSuggestion,
} from './qualitative-probability.util';
import {
  buildProbabilityCountSource,
  resolveProbabilityEntityContext,
  sumWorkspaceEmployees,
} from './probability-count-context.util';
import {
  CountSuggestionTracking,
  countSuggestionContextKey,
  decideCountSuggestionAutoSave,
} from './count-suggestion-auto-save.util';

const MOEVE = '9506af25-2078-4c94-9811-b556e0a91f08';
const REFINARIA = '2cc00c71-8ca7-4cbe-9cab-73ed7dde09b2';
const MATRIZ = 'ws-matriz';
const GSE_06 = '835d3253-65a5-4cf6-b628-6c7783b40d7c';

const companyWorkspaces = [
  { id: MOEVE, employeeCount: 30 },
  { id: REFINARIA, employeeCount: 2 },
  { id: MATRIZ, employeeCount: 17 },
];

const gse06 = {
  id: GSE_06,
  employeeCount: 6,
  employeeCountByWorkspace: { [MOEVE]: 6, [REFINARIA]: 0 },
  workspaceIds: [MOEVE, REFINARIA],
};

function countsFor(headerWorkspaceId?: string) {
  const ctx = resolveProbabilityEntityContext({
    gho: gse06,
    viewData: ViewsDataEnum.GSE,
    headerWorkspaceId,
  });
  assert.ok(ctx);
  return {
    ctx: ctx!,
    total: sumWorkspaceEmployees({
      workspaces: companyWorkspaces,
      workspaceIds: ctx!.workspaceIds,
    }),
  };
}

// MOEVE: 30 no estabelecimento, 6 no GSE
{
  const { ctx, total } = countsFor(MOEVE);
  assert.deepEqual(ctx.workspaceIds, [MOEVE]);
  assert.equal(total, 30);
  assert.equal(ctx.employeeCountGho, 6);

  const source = buildProbabilityCountSource(gse06, ViewsDataEnum.GSE, MOEVE);
  assert.deepEqual(source?.workspaceIds, [MOEVE]);
  assert.equal(source?.ghoEmployeeCount, 6);
}

// Refinaria: 2 no estabelecimento, 0 no GSE (sem somar MOEVE)
{
  const { ctx, total } = countsFor(REFINARIA);
  assert.deepEqual(ctx.workspaceIds, [REFINARIA]);
  assert.equal(total, 2);
  assert.equal(ctx.employeeCountGho, 0);

  const source = buildProbabilityCountSource(
    gse06,
    ViewsDataEnum.GSE,
    REFINARIA,
  );
  assert.equal(source?.ghoEmployeeCount, 0);
}

// Alternar estabelecimentos troca as contagens sem misturar
{
  const moeve = countsFor(MOEVE);
  const refinaria = countsFor(REFINARIA);
  const moeveAgain = countsFor(MOEVE);
  assert.deepEqual(
    [moeve.total, moeve.ctx.employeeCountGho],
    [30, 6],
  );
  assert.deepEqual(
    [refinaria.total, refinaria.ctx.employeeCountGho],
    [2, 0],
  );
  assert.deepEqual(
    [moeveAgain.total, moeveAgain.ctx.employeeCountGho],
    [30, 6],
  );
}

// Sem cabeçalho: comportamento anterior (soma dos estabelecimentos do GSE, GSE global)
{
  const { ctx, total } = countsFor(undefined);
  assert.deepEqual(ctx.workspaceIds, [MOEVE, REFINARIA]);
  assert.equal(total, 32);
  assert.equal(ctx.employeeCountGho, 6);
}

// Estabelecimento fora do GSE: ambíguo, GSE null
{
  const { ctx, total } = countsFor(MATRIZ);
  assert.deepEqual(ctx.workspaceIds, [MATRIZ]);
  assert.equal(total, 17);
  assert.equal(ctx.employeeCountGho, null);
}

// Sem contagem por estabelecimento em GSE compartilhado: não usa a global
{
  const ctx = resolveProbabilityEntityContext({
    gho: { id: GSE_06, employeeCount: 6, workspaceIds: [MOEVE, REFINARIA] },
    viewData: ViewsDataEnum.GSE,
    headerWorkspaceId: REFINARIA,
  });
  assert.equal(ctx!.employeeCountGho, null);
  const source = buildProbabilityCountSource(
    { id: GSE_06, employeeCount: 6, workspaceIds: [MOEVE, REFINARIA] },
    ViewsDataEnum.GSE,
    REFINARIA,
  );
  assert.equal(source?.ghoEmployeeCount, null);
}

// GSE de estabelecimento único: igual com e sem contagem por estabelecimento
{
  const single = { id: 'gse-unico', employeeCount: 8, workspaceIds: [MOEVE] };
  const withoutMap = resolveProbabilityEntityContext({
    gho: single,
    viewData: ViewsDataEnum.GSE,
    headerWorkspaceId: MOEVE,
  });
  assert.equal(withoutMap!.employeeCountGho, 8);
  const withMap = resolveProbabilityEntityContext({
    gho: { ...single, employeeCountByWorkspace: { [MOEVE]: 8 } },
    viewData: ViewsDataEnum.GSE,
    headerWorkspaceId: MOEVE,
  });
  assert.equal(withMap!.employeeCountGho, 8);
  const noHeader = resolveProbabilityEntityContext({
    gho: single,
    viewData: ViewsDataEnum.GSE,
  });
  assert.equal(noHeader!.employeeCountGho, 8);
}

// Hierarquia não muda com o cabeçalho
{
  const ctx = resolveProbabilityEntityContext({
    gho: { id: `office-1//${MOEVE}`, employeeCount: 99 },
    viewData: ViewsDataEnum.HIERARCHY,
    headerWorkspaceId: REFINARIA,
  });
  assert.equal(ctx!.isHierarchy, true);
  assert.deepEqual(ctx!.workspaceIds, [MOEVE]);
  assert.equal(ctx!.employeeCountGho, 0);
}

// Abertura do assistente sem estimativa: Refinaria inicia com 2 / 0
{
  const { ctx, total } = countsFor(REFINARIA);
  const open = probabilityModalOpenState({
    adoptedCriteria: null,
    employeeCountTotal: total,
    employeeCountGho: ctx.employeeCountGho,
  });
  assert.equal(open.formValues.employeeCountTotal, 2);
  assert.equal(open.formValues.employeeCountGho, 0);
}

// Abertura com estimativa anterior: critérios adotados preservados
{
  const adopted: QualitativeProbabilityCriteria = {
    employeeCountTotal: 32,
    employeeCountGho: 6,
    minDurationJT: 480,
    minDurationEO: null,
    chancesOfHappening: null,
    frequency: null,
    history: null,
    medsImplemented: 2,
  };
  const { ctx, total } = countsFor(REFINARIA);
  const open = probabilityModalOpenState({
    adoptedCriteria: adopted,
    employeeCountTotal: total,
    employeeCountGho: ctx.employeeCountGho,
  });
  assert.equal(open.formValues.employeeCountTotal, 32);
  assert.equal(open.formValues.employeeCountGho, 6);
  assert.deepEqual(open.adoptedCriteria, adopted);
}

// Refinaria com 0 no GSE: o par de trabalhadores sai da média (fórmula intacta)
{
  const adopted: QualitativeProbabilityCriteria = {
    employeeCountTotal: 32,
    employeeCountGho: 6,
    minDurationJT: 480,
    minDurationEO: null,
    chancesOfHappening: null,
    frequency: null,
    history: null,
    medsImplemented: 2,
  };
  const decision = resolveCountSuggestion({
    adopted,
    adoptedProbability: 4,
    currentTotal: 2,
    currentGho: 0,
    currentJourneyMinutes: 480,
  });
  if (decision.kind !== 'none') {
    assert.equal(decision.criteria.employeeCountTotal, 2);
    assert.equal(decision.criteria.employeeCountGho, 0);
  }
}

// --- Gravação automática ---

const autoDecision = (probability: number, total: number, gho: number) =>
  ({
    kind: 'auto',
    probability,
    criteria: {
      employeeCountTotal: total,
      employeeCountGho: gho,
      minDurationJT: 480,
      minDurationEO: null,
      chancesOfHappening: null,
      frequency: null,
      history: null,
      medsImplemented: 2,
    },
  }) as CountSuggestionDecision;

const keyFor = (
  workspaceId: string,
  extra: Partial<Parameters<typeof countSuggestionContextKey>[0]> = {},
) =>
  countSuggestionContextKey({
    riskDataId: 'rfd-1',
    headerWorkspaceId: workspaceId,
    countWorkspaceIds: [workspaceId],
    authority: 'WORKSPACE',
    origin: 'ESTIMATE',
    criteriaAdoptedAt: `2026-10-01-${workspaceId}`,
    ...extra,
  });

function observe(
  previous: CountSuggestionTracking | null,
  params: {
    workspaceId: string;
    decision: CountSuggestionDecision;
    authority?: 'SHARED' | 'WORKSPACE' | null;
    origin?: 'ESTIMATE' | 'MANUAL' | 'PROMOTION' | null;
    countWorkspaceIds?: string[];
    contextKey?: string;
  },
) {
  const authority =
    params.authority === undefined ? 'WORKSPACE' : params.authority;
  const origin = params.origin === undefined ? 'ESTIMATE' : params.origin;
  return decideCountSuggestionAutoSave({
    previous,
    contextKey:
      params.contextKey ??
      keyFor(params.workspaceId, {
        authority,
        origin,
        countWorkspaceIds: params.countWorkspaceIds ?? [params.workspaceId],
      }),
    decision: params.decision,
    authority,
    origin,
    isGhoSource: true,
    headerWorkspaceId: params.workspaceId,
    countWorkspaceIds: params.countWorkspaceIds ?? [params.workspaceId],
  });
}

// Primeira observação nunca grava
{
  const first = observe(null, {
    workspaceId: MOEVE,
    decision: autoDecision(3, 30, 6),
  });
  assert.equal(first.save, false);
}

// WORKSPACE + ESTIMATE: mudança legítima das contagens do próprio estabelecimento grava
{
  const base = observe(null, {
    workspaceId: MOEVE,
    decision: { kind: 'none' },
  });
  const next = observe(base.tracking, {
    workspaceId: MOEVE,
    decision: autoDecision(3, 31, 7),
  });
  assert.equal(next.save, true);
}

// Troca MOEVE → Refinaria: nova linha de base, sem gravação cruzada
{
  const moeve = observe(null, {
    workspaceId: MOEVE,
    decision: autoDecision(3, 30, 6),
  });
  const switched = observe(moeve.tracking, {
    workspaceId: REFINARIA,
    decision: autoDecision(2, 2, 0),
  });
  assert.equal(switched.save, false);
  assert.equal(switched.tracking.contextKey, keyFor(REFINARIA));

  const back = observe(switched.tracking, {
    workspaceId: MOEVE,
    decision: autoDecision(3, 30, 6),
  });
  assert.equal(back.save, false);
}

// Linha do novo estabelecimento chega depois do cabeçalho: não grava
{
  const headerOnly = observe(null, {
    workspaceId: REFINARIA,
    decision: { kind: 'none' },
    contextKey: keyFor(REFINARIA, { authority: null, origin: null, criteriaAdoptedAt: null }),
  });
  const rowArrived = observe(headerOnly.tracking, {
    workspaceId: REFINARIA,
    decision: autoDecision(2, 2, 0),
  });
  assert.equal(rowArrived.save, false);
}

// MANUAL e PROMOTION não são recalculados; SHARED também não
for (const params of [
  { authority: 'WORKSPACE' as const, origin: 'MANUAL' as const },
  { authority: 'WORKSPACE' as const, origin: 'PROMOTION' as const },
  { authority: 'SHARED' as const, origin: null },
]) {
  const base = observe(null, {
    workspaceId: MOEVE,
    decision: { kind: 'none' },
    ...params,
  });
  const next = observe(base.tracking, {
    workspaceId: MOEVE,
    decision: autoDecision(3, 31, 7),
    ...params,
  });
  assert.equal(next.save, false, `${params.authority}/${params.origin}`);
}

// Contagens de outro estabelecimento (contexto ambíguo): não grava
{
  const base = observe(null, {
    workspaceId: REFINARIA,
    decision: { kind: 'none' },
    countWorkspaceIds: [MOEVE, REFINARIA],
  });
  const next = observe(base.tracking, {
    workspaceId: REFINARIA,
    decision: autoDecision(2, 32, 6),
    countWorkspaceIds: [MOEVE, REFINARIA],
  });
  assert.equal(next.save, false);
}

// Sem cabeçalho e sem autoridade (caracterizado): regra anterior mantida
{
  const key = countSuggestionContextKey({
    riskDataId: 'rfd-char',
    countWorkspaceIds: [MOEVE],
  });
  const base = decideCountSuggestionAutoSave({
    previous: null,
    contextKey: key,
    decision: { kind: 'none' },
    isGhoSource: true,
    countWorkspaceIds: [MOEVE],
  });
  const next = decideCountSuggestionAutoSave({
    previous: base.tracking,
    contextKey: key,
    decision: autoDecision(3, 31, 7),
    isGhoSource: true,
    countWorkspaceIds: [MOEVE],
  });
  assert.equal(next.save, true);
}

console.log('workspace-employee-counts.spec: ok');
