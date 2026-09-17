/**
 * npx tsx src/@v2/models/form/helpers/form-participants-diagnostic-group-filters.spec.ts
 */
import assert from 'node:assert/strict';

import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import {
  buildCombinedHierarchyNestedAggregates,
  flattenCombinedHierarchyNestedLeaves,
} from './form-participants-aggregate-by-combined-hierarchy';
import { collectFilteredDiagnosticLeaves } from './form-participants-diagnostic-group-leaves';
import {
  ADHERENCE_BAND_FILTER_OPTIONS,
  buildDiagnosticFilterPdfNotes,
  classifyDiagnosticCapacity,
  deriveDiagnosticSummaryFromLeaves,
  filterCombinedHierarchyDiagnosticGroups,
  filterFlatDiagnosticGroups,
  filterParentChildDiagnosticGroups,
  isRecorteDiagnosticFilterActive,
  matchesAdherenceBand,
  matchesRecorteDiagnosticFilters,
  type DiagnosticGroupMetrics,
  type RecorteDiagnosticFilterParams,
} from './form-participants-diagnostic-group-filters';
import { shouldHideFrpsIndicatorData } from './frps-indicators-privacy.util';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';

function leaf(
  partial: Partial<DiagnosticGroupMetrics> &
    Pick<DiagnosticGroupMetrics, 'responded' | 'total'>,
): DiagnosticGroupMetrics {
  const notResponded =
    partial.notResponded ?? Math.max(0, partial.total - partial.responded);
  const responseRatePercent =
    partial.responseRatePercent ??
    (partial.total > 0
      ? Math.round((partial.responded / partial.total) * 1000) / 10
      : 0);
  return {
    total: partial.total,
    responded: partial.responded,
    notResponded,
    responseRatePercent,
  };
}

const min3 = {
  indicatorsMinParticipants: 3,
  isShareableLink: false,
} as const;

assert.equal(
  shouldHideFrpsIndicatorData({
    isShareableLink: false,
    participantCount: 2,
    minParticipants: 3,
  }),
  true,
);
assert.equal(
  shouldHideFrpsIndicatorData({
    isShareableLink: true,
    participantCount: 1,
    minParticipants: 3,
  }),
  false,
);
assert.equal(
  shouldHideFrpsIndicatorData({
    isShareableLink: false,
    participantCount: 2,
    minParticipants: 2,
  }),
  false,
);

assert.deepEqual(classifyDiagnosticCapacity({ responded: 0, ...min3 }), {
  isNoDiagnosis: true,
  isCriticalSecrecy: false,
});
assert.deepEqual(classifyDiagnosticCapacity({ responded: 1, ...min3 }), {
  isNoDiagnosis: false,
  isCriticalSecrecy: true,
});
assert.deepEqual(classifyDiagnosticCapacity({ responded: 3, ...min3 }), {
  isNoDiagnosis: false,
  isCriticalSecrecy: false,
});
assert.deepEqual(
  classifyDiagnosticCapacity({
    responded: 1,
    indicatorsMinParticipants: 3,
    isShareableLink: true,
  }),
  { isNoDiagnosis: false, isCriticalSecrecy: false },
);
assert.deepEqual(
  classifyDiagnosticCapacity({
    responded: 0,
    indicatorsMinParticipants: 3,
    isShareableLink: true,
  }),
  { isNoDiagnosis: true, isCriticalSecrecy: false },
);

const filterBase: RecorteDiagnosticFilterParams = {
  capacity: 'all',
  adherenceBand: 'all',
  ...min3,
};

assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 0 }), {
    ...filterBase,
    capacity: 'no_diagnosis',
  }),
  true,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 1 }), {
    ...filterBase,
    capacity: 'no_diagnosis',
  }),
  false,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 1 }), {
    ...filterBase,
    capacity: 'critical_secrecy',
  }),
  true,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 0 }), {
    ...filterBase,
    capacity: 'critical_secrecy',
  }),
  false,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 1 }), {
    ...filterBase,
    capacity: 'critical_secrecy',
    isShareableLink: true,
  }),
  false,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 1 }), {
    ...filterBase,
    capacity: 'no_diagnosis_and_critical_secrecy',
  }),
  true,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 0 }), {
    ...filterBase,
    capacity: 'no_diagnosis_and_critical_secrecy',
  }),
  true,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 10, responded: 8 }), {
    ...filterBase,
    capacity: 'no_diagnosis_and_critical_secrecy',
  }),
  false,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 1 }), {
    ...filterBase,
    capacity: 'no_diagnosis_and_critical_secrecy',
    isShareableLink: true,
  }),
  false,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 4, responded: 0 }), {
    ...filterBase,
    capacity: 'no_diagnosis_and_critical_secrecy',
    isShareableLink: true,
  }),
  true,
);

assert.equal(matchesAdherenceBand(0, 'eq_0'), true);
assert.equal(matchesAdherenceBand(0.1, 'eq_0'), false);
assert.equal(matchesAdherenceBand(0, 'gt_0_to_10'), false);
assert.equal(matchesAdherenceBand(0.1, 'gt_0_to_10'), true);
assert.equal(matchesAdherenceBand(10, 'gt_0_to_10'), true);
assert.equal(matchesAdherenceBand(10, 'gt_10_to_20'), false);
assert.equal(matchesAdherenceBand(10.1, 'gt_10_to_20'), true);
assert.equal(matchesAdherenceBand(20, 'gt_10_to_20'), true);
assert.equal(matchesAdherenceBand(90, 'gt_80_to_90'), true);
assert.equal(matchesAdherenceBand(90, 'gt_90_to_100'), false);
assert.equal(matchesAdherenceBand(90.1, 'gt_90_to_100'), true);
assert.equal(matchesAdherenceBand(100, 'gt_90_to_100'), true);

const bandIds = ADHERENCE_BAND_FILTER_OPTIONS.map((option) => option.id).filter(
  (id) => id !== 'all',
);
const sampleRates = [0, 0.1, 10, 10.1, 20, 50, 90, 90.1, 100];
for (const rate of sampleRates) {
  const hits = bandIds.filter((id) => matchesAdherenceBand(rate, id));
  assert.equal(hits.length, 1, `rate ${rate} matched ${hits.join(',')}`);
}

assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 10, responded: 1 }), {
    ...filterBase,
    capacity: 'critical_secrecy',
    adherenceBand: 'gt_0_to_10',
  }),
  true,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 10, responded: 5 }), {
    ...filterBase,
    capacity: 'critical_secrecy',
    adherenceBand: 'gt_0_to_10',
  }),
  false,
);
assert.equal(
  matchesRecorteDiagnosticFilters(leaf({ total: 10, responded: 1 }), {
    ...filterBase,
    capacity: 'critical_secrecy',
    adherenceBand: 'gt_50_to_60',
  }),
  false,
);

const nestedLevels = [
  { kind: HierarchyTypeEnum.DIRECTORY, missingLabel: 'Sem diretoria' },
  { kind: HierarchyTypeEnum.SECTOR, missingLabel: 'Sem setor' },
];

function participant(params: {
  id: number;
  directory: string;
  sector: string;
  hasResponded: boolean;
}): FormParticipantsBrowseResultModel {
  return {
    id: params.id,
    encryptedEmployeeId: String(params.id),
    name: `P${params.id}`,
    cpf: '000',
    email: `${params.id}@x.com`,
    status: 'ACTIVE',
    companyId: 'c1',
    hierarchyId: `h-${params.sector}`,
    hierarchyName: params.sector,
    hierarchies: [
      { id: `d-${params.directory}`, name: params.directory, type: HierarchyTypeEnum.DIRECTORY },
      { id: `s-${params.sector}`, name: params.sector, type: HierarchyTypeEnum.SECTOR },
    ],
    hasResponded: params.hasResponded,
    emailSent: false,
    emailSentAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  } as FormParticipantsBrowseResultModel;
}

const nestedRows = [
  ...Array.from({ length: 10 }, (_, index) =>
    participant({
      id: index + 1,
      directory: 'BAHIA',
      sector: 'COMUNS',
      hasResponded: index < 5,
    }),
  ),
  participant({
    id: 21,
    directory: 'BAHIA',
    sector: 'SPA',
    hasResponded: true,
  }),
  participant({
    id: 22,
    directory: 'BAHIA',
    sector: 'SPA',
    hasResponded: false,
  }),
  ...Array.from({ length: 8 }, (_, index) =>
    participant({
      id: 30 + index,
      directory: 'IBERICA',
      sector: 'GOLFE',
      hasResponded: false,
    }),
  ),
];

const nested = buildCombinedHierarchyNestedAggregates(nestedRows, nestedLevels);
const criticalNested = filterCombinedHierarchyDiagnosticGroups(nested, {
  ...filterBase,
  capacity: 'critical_secrecy',
});
assert.equal(criticalNested.length, 1);
assert.equal(criticalNested[0]?.label, 'BAHIA');
assert.equal(criticalNested[0]?.leaves.length, 1);
assert.equal(criticalNested[0]?.leaves[0]?.label, 'SPA');
assert.equal(criticalNested[0]?.total, 2);
assert.equal(criticalNested[0]?.responded, 1);
assert.equal(
  criticalNested[0]?.leaves.some((item) => item.label === 'COMUNS'),
  false,
);
assert.equal(
  criticalNested.some((item) => item.label === 'IBERICA'),
  false,
);

const criticalLeaves = flattenCombinedHierarchyNestedLeaves(criticalNested);
const criticalSummary = deriveDiagnosticSummaryFromLeaves(criticalLeaves);
assert.equal(criticalSummary.totalParticipants, 2);
assert.equal(criticalSummary.respondedCount, 1);
assert.equal(criticalSummary.notRespondedCount, 1);
assert.equal(criticalSummary.responseRatePercent, 50);
assert.notEqual(
  criticalSummary.totalParticipants,
  criticalNested[0]!.total + (criticalNested[0]!.leaves[0]?.total ?? 0),
);

const collected = collectFilteredDiagnosticLeaves({
  viewMode: 'grouped_directory_sector',
  rows: nestedRows,
  filter: { ...filterBase, capacity: 'critical_secrecy' },
});
assert.equal(collected.length, 1);
assert.equal(collected[0]?.total, 2);
assert.equal(collected[0]?.responded, 1);

assert.deepEqual(
  collectFilteredDiagnosticLeaves({
    viewMode: 'list',
    rows: nestedRows,
    filter: { ...filterBase, capacity: 'critical_secrecy' },
  }),
  [],
);

const parentChild = filterParentChildDiagnosticGroups(
  [
    {
      total: 12,
      responded: 6,
      notResponded: 6,
      responseRatePercent: 50,
      sectors: [
        leaf({ total: 10, responded: 5 }),
        leaf({ total: 2, responded: 1 }),
      ],
    },
    {
      total: 8,
      responded: 0,
      notResponded: 8,
      responseRatePercent: 0,
      sectors: [leaf({ total: 8, responded: 0 })],
    },
  ],
  (parent) => parent.sectors,
  (parent, sectors, metrics) => ({ ...parent, sectors, ...metrics }),
  { ...filterBase, capacity: 'critical_secrecy' },
);
assert.equal(parentChild.length, 1);
assert.equal(parentChild[0]?.sectors.length, 1);
assert.equal(parentChild[0]?.total, 2);
assert.equal(parentChild[0]?.responded, 1);

const inactive = filterFlatDiagnosticGroups(
  [leaf({ total: 2, responded: 1 }), leaf({ total: 8, responded: 0 })],
  filterBase,
);
assert.equal(inactive.length, 2);
assert.equal(isRecorteDiagnosticFilterActive(filterBase), false);
assert.equal(
  isRecorteDiagnosticFilterActive({
    capacity: 'critical_secrecy',
    adherenceBand: 'all',
  }),
  true,
);

const notes = buildDiagnosticFilterPdfNotes({
  ...filterBase,
  capacity: 'critical_secrecy',
  adherenceBand: 'gt_0_to_10',
});
assert.equal(notes[0], 'Capacidade diagnóstica: Sigilo crítico');
assert.equal(notes[1], 'Faixa de adesão: >0% a 10%');
assert.equal(
  notes[2],
  'Critério de capacidade diagnóstica: mínimo de 3 respondentes — Indicadores e Gráficos SimpleSST',
);
assert.match(notes[3] ?? '', /independente da configuração de Análise de Riscos/);
assert.equal(
  notes.some((line) => /Análise de Riscos com IA:/.test(line)),
  false,
);

const notesMin2 = buildDiagnosticFilterPdfNotes({
  capacity: 'no_diagnosis',
  adherenceBand: 'all',
  indicatorsMinParticipants: 2,
  isShareableLink: false,
});
assert.equal(
  notesMin2[1],
  'Critério de capacidade diagnóstica: mínimo de 2 respondentes — Indicadores e Gráficos SimpleSST',
);
assert.deepEqual(buildDiagnosticFilterPdfNotes(filterBase), []);

console.log('form-participants-diagnostic-group-filters.spec.ts ok');
