/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-use-scenario-gse.util.spec.ts
 */
import { CHEMICAL_USE_SCENARIO_RECONCILE_STALE_CODE } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import type { ChemicalUseScenarioGseReconcilePreviewItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  buildUseScenarioGseReconcileApplyPayload,
  canConfirmUseScenarioGseReconcileGroup,
  chemicalUseScenarioSurveyStatusUnchangedByGseLink,
  countUseScenarioGseReconcileStatuses,
  createUseScenarioGseReconcileDraft,
  expandUseScenarioGseReconcileGroupLinks,
  formatUseScenarioGseGroupImpact,
  formatUseScenarioGseMatchLine,
  groupUseScenarioGseReconcilePreview,
  identifyUseScenarioForReconcile,
  isChemicalUseScenarioReconcileStaleError,
  presentUseScenarioGse,
  unlinkPreservesExposureSnapshot,
} from './chemical-use-scenario-gse.util';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const caldeira = {
  id: 'gse-10009',
  name: 'GSE 10009 — Caldeira',
  deletedAt: null,
};

function item(
  overrides: Partial<ChemicalUseScenarioGseReconcilePreviewItem> & {
    scenarioId: string;
    status: ChemicalUseScenarioGseReconcilePreviewItem['status'];
  },
): ChemicalUseScenarioGseReconcilePreviewItem {
  return {
    snapshot: '10009',
    canonicalExposureCode: '10009',
    currentHomogeneousGroup: null,
    candidates: [],
    suggestedHomogeneousGroupId: null,
    reason: '',
    ...overrides,
  };
}

const matchUnique = item({
  scenarioId: 's-10009',
  status: 'MATCH_UNIQUE',
  candidates: [caldeira],
  suggestedHomogeneousGroupId: caldeira.id,
  reason: 'Código 10009 casa com um GSE técnico.',
});

const alreadyLinked = item({
  scenarioId: 's-linked',
  status: 'ALREADY_LINKED',
  currentHomogeneousGroup: caldeira,
  suggestedHomogeneousGroupId: null,
  reason: 'Cenário já vinculado.',
});

const noMatch = item({
  scenarioId: 's-none',
  status: 'NO_MATCH',
  snapshot: 'TODOS DO SETOR',
  canonicalExposureCode: null,
  reason: 'Snapshot sem código inequívoco.',
});

const mixer = {
  id: 'gse-1014',
  name: 'GSE 1014 — Mixer',
  deletedAt: null,
};

const ambiguous = item({
  scenarioId: 's-amb',
  status: 'AMBIGUOUS',
  snapshot: '1014',
  canonicalExposureCode: '1014',
  candidates: [mixer, { id: 'gse-1014-b', name: 'GSE 1014 — Extra', deletedAt: null }],
  suggestedHomogeneousGroupId: null,
  reason: 'Mais de um GSE candidato.',
});

assert(
  presentUseScenarioGse({
    homogeneousGroupId: caldeira.id,
    homogeneousGroup: caldeira,
    exposureGroupSnapshot: '10009',
  }).cellText === 'GSE 10009 — Caldeira',
  'GSE real vigente na coluna',
);
assert(
  presentUseScenarioGse({
    homogeneousGroupId: caldeira.id,
    homogeneousGroup: caldeira,
    exposureGroupSnapshot: '10009',
  }).kind === 'REAL',
  'vínculo real não substitui o snapshot no modelo, só na apresentação',
);
assert(
  presentUseScenarioGse({
    homogeneousGroupId: null,
    homogeneousGroup: null,
    exposureGroupSnapshot: '10009',
  }).cellText === '10009 · sem GSE real',
  'snapshot sem FK continua evidência, com hint discreto',
);
assert(
  presentUseScenarioGse({
    homogeneousGroupId: null,
    homogeneousGroup: null,
    exposureGroupSnapshot: null,
  }).cellText === '—',
  'vazio normal sem snapshot e sem vínculo',
);

assert(
  formatUseScenarioGseMatchLine(matchUnique) ===
    '10009 → GSE 10009 — Caldeira',
  'MATCH_UNIQUE mostra evidência → candidato',
);

const firstGroups = groupUseScenarioGseReconcilePreview([
  matchUnique,
  alreadyLinked,
  noMatch,
  ambiguous,
]);
const uniqueGroup = firstGroups.find((group) => group.documentaryCode === '10009');
const noMatchGroup = firstGroups.find((group) => group.kind === 'NO_MATCH');
const ambGroup = firstGroups.find((group) => group.documentaryCode === '1014');
assert(uniqueGroup?.kind === 'MATCH_UNIQUE', '10009 pendente+vinculado vira uma decisão');
assert(uniqueGroup?.pendingItems.length === 1, '10009 aplica só o pendente');
assert(uniqueGroup?.alreadyLinkedItems.length === 1, '10009 preserva o já vinculado');

const uniqueDraft = createUseScenarioGseReconcileDraft(uniqueGroup!);
assert(uniqueDraft.included, 'MATCH_UNIQUE pré-selecionado para revisão');
assert(
  uniqueDraft.selectedHomogeneousGroupId === caldeira.id,
  'MATCH_UNIQUE usa suggestedHomogeneousGroupId',
);
assert(
  canConfirmUseScenarioGseReconcileGroup(uniqueGroup!, uniqueDraft),
  'MATCH_UNIQUE confirmável',
);

const linkedOnlyGroup = groupUseScenarioGseReconcilePreview([alreadyLinked])[0];
const linkedDraft = createUseScenarioGseReconcileDraft(linkedOnlyGroup!);
assert(!linkedDraft.included, 'ALREADY_LINKED não cria trabalho');
assert(
  !canConfirmUseScenarioGseReconcileGroup(linkedOnlyGroup!, {
    ...linkedDraft,
    included: true,
    selectedHomogeneousGroupId: caldeira.id,
  }),
  'ALREADY_LINKED não entra no Apply',
);

const noMatchDraft = createUseScenarioGseReconcileDraft(noMatchGroup!);
assert(!noMatchDraft.included, 'NO_MATCH não inventa GSE');
assert(
  !canConfirmUseScenarioGseReconcileGroup(noMatchGroup!, {
    groupKey: noMatchGroup!.key,
    included: true,
    selectedHomogeneousGroupId: caldeira.id,
  }),
  'NO_MATCH não pode ser forçado no Apply',
);

const ambDraft = createUseScenarioGseReconcileDraft(ambGroup!);
assert(!ambDraft.included, 'AMBIGUOUS exige escolha humana');
assert(
  !canConfirmUseScenarioGseReconcileGroup(ambGroup!, ambDraft),
  'AMBIGUOUS sem escolha não confirma',
);
assert(
  canConfirmUseScenarioGseReconcileGroup(ambGroup!, {
    groupKey: ambGroup!.key,
    included: true,
    selectedHomogeneousGroupId: mixer.id,
  }),
  'AMBIGUOUS confirma só com candidate retornado',
);

const apply = buildUseScenarioGseReconcileApplyPayload({
  previewFingerprint: 'fp-1',
  groups: firstGroups,
  drafts: [
    uniqueDraft,
    noMatchDraft,
    {
      groupKey: ambGroup!.key,
      included: true,
      selectedHomogeneousGroupId: mixer.id,
    },
  ],
});
assert(apply.ok, 'Apply monta só pares confirmados');
if (!apply.ok) throw new Error(apply.error);
assert(apply.body.previewFingerprint === 'fp-1', 'envia fingerprint do preview');
assert(apply.body.links.length === 2, 'somente MATCH_UNIQUE e AMBIGUOUS escolhido');
assert(
  apply.body.links.every(
    (link) =>
      (link.scenarioId === 's-10009' &&
        link.homogeneousGroupId === caldeira.id) ||
      (link.scenarioId === 's-amb' && link.homogeneousGroupId === mixer.id),
  ),
  'pares explícitos, sem recálculo',
);

const skippedUnique = buildUseScenarioGseReconcileApplyPayload({
  previewFingerprint: 'fp-1',
  groups: [uniqueGroup!],
  drafts: [{ ...uniqueDraft, included: false }],
});
assert(!skippedUnique.ok, 'desmarcar MATCH_UNIQUE não envia o par');

const maker = {
  id: 'gse-1012',
  name: 'GSE 1012 — Maker',
  deletedAt: null,
};

const atlasItems = [
  ...Array.from({ length: 8 }, (_, index) =>
    item({
      scenarioId: `s-10009-${index + 1}`,
      status: 'MATCH_UNIQUE',
      snapshot: index === 0 ? 'GSE 10009' : '10009',
      canonicalExposureCode: '10009',
      candidates: [caldeira],
      suggestedHomogeneousGroupId: caldeira.id,
    }),
  ),
  ...Array.from({ length: 6 }, (_, index) =>
    item({
      scenarioId: `s-1012-${index + 1}`,
      status: 'MATCH_UNIQUE',
      snapshot: '1012',
      canonicalExposureCode: '1012',
      candidates: [maker],
      suggestedHomogeneousGroupId: maker.id,
    }),
  ),
  ...Array.from({ length: 5 }, (_, index) =>
    item({
      scenarioId: `s-1014-${index + 1}`,
      status: 'MATCH_UNIQUE',
      snapshot: '1014',
      canonicalExposureCode: '1014',
      candidates: [mixer],
      suggestedHomogeneousGroupId: mixer.id,
    }),
  ),
];
const atlasGroups = groupUseScenarioGseReconcilePreview(atlasItems);
assert(atlasGroups.length === 3, '8+6+5 MATCH_UNIQUE viram 3 decisões visuais');
const group10009 = atlasGroups.find((group) => group.documentaryCode === '10009');
const group1012 = atlasGroups.find((group) => group.documentaryCode === '1012');
const group1014 = atlasGroups.find((group) => group.documentaryCode === '1014');
assert(group10009?.kind === 'MATCH_UNIQUE', '10009 consolidado como MATCH_UNIQUE');
assert(group10009?.pendingItems.length === 8, '10009 afeta 8 cenários');
assert(
  group10009?.headline === '10009 → GSE 10009 — Caldeira',
  'headline documental do grupo 10009',
);
assert(group1012?.pendingItems.length === 6, '1012 permanece decisão independente');
assert(group1014?.pendingItems.length === 5, '1014 permanece decisão independente');

const atlasApply = buildUseScenarioGseReconcileApplyPayload({
  previewFingerprint: 'fp-atlas',
  groups: atlasGroups,
  drafts: [
    createUseScenarioGseReconcileDraft(group10009!),
    { ...createUseScenarioGseReconcileDraft(group1012!), included: false },
    { ...createUseScenarioGseReconcileDraft(group1014!), included: false },
  ],
});
assert(atlasApply.ok, 'confirmar só 10009 gera Apply');
if (!atlasApply.ok) throw new Error(atlasApply.error);
assert(atlasApply.body.links.length === 8, '1 decisão visual expande 8 links');
assert(
  atlasApply.body.links.every((link) => link.homogeneousGroupId === caldeira.id),
  'os 8 links usam o mesmo GSE confirmado',
);
assert(
  !atlasApply.body.links.some((link) => link.scenarioId.startsWith('s-1012-')),
  '1012 não entra quando não confirmado',
);

const mixedItems = [
  item({
    scenarioId: 's-linked-1',
    status: 'ALREADY_LINKED',
    currentHomogeneousGroup: caldeira,
  }),
  ...Array.from({ length: 7 }, (_, index) =>
    item({
      scenarioId: `s-pending-${index + 1}`,
      status: 'MATCH_UNIQUE',
      candidates: [caldeira],
      suggestedHomogeneousGroupId: caldeira.id,
    }),
  ),
];
const mixedGroup = groupUseScenarioGseReconcilePreview(mixedItems)[0];
assert(mixedGroup?.kind === 'MATCH_UNIQUE', 'mistura pendente+vinculado no mesmo GSE consolida');
assert(
  formatUseScenarioGseGroupImpact(mixedGroup!) ===
    '1 já vinculado · 7 serão vinculados',
  'impacto da mistura deixa o já vinculado explícito',
);
const mixedLinks = expandUseScenarioGseReconcileGroupLinks(
  mixedGroup!,
  createUseScenarioGseReconcileDraft(mixedGroup!),
);
assert(mixedLinks.length === 7, 'mistura aplica só os pendentes');
assert(
  !mixedLinks.some((link) => link.scenarioId === 's-linked-1'),
  'ALREADY_LINKED não reentra no Apply',
);

const noMatchOnly = groupUseScenarioGseReconcilePreview([
  noMatch,
  item({
    scenarioId: 's-none-2',
    status: 'NO_MATCH',
    snapshot: 'TODOS DO SETOR',
    canonicalExposureCode: null,
  }),
])[0];
assert(noMatchOnly?.kind === 'NO_MATCH', 'NO_MATCH sem código agrupa pela identidade');
assert(
  expandUseScenarioGseReconcileGroupLinks(
    noMatchOnly!,
    {
      groupKey: noMatchOnly!.key,
      included: true,
      selectedHomogeneousGroupId: caldeira.id,
    },
  ).length === 0,
  'NO_MATCH não gera link',
);

const conflictSuggested = groupUseScenarioGseReconcilePreview([
  item({
    scenarioId: 's-a',
    status: 'MATCH_UNIQUE',
    candidates: [caldeira],
    suggestedHomogeneousGroupId: caldeira.id,
  }),
  item({
    scenarioId: 's-b',
    status: 'MATCH_UNIQUE',
    candidates: [mixer],
    suggestedHomogeneousGroupId: mixer.id,
  }),
])[0];
assert(conflictSuggested?.kind === 'CONFLICT', 'mesmo código + GSE sugerido diferente = conflito');
assert(
  expandUseScenarioGseReconcileGroupLinks(conflictSuggested!, {
    groupKey: conflictSuggested!.key,
    included: true,
    selectedHomogeneousGroupId: caldeira.id,
  }).length === 0,
  'conflito não é consolidado silenciosamente',
);

const conflictCandidates = groupUseScenarioGseReconcilePreview([
  item({
    scenarioId: 's-amb-1',
    status: 'AMBIGUOUS',
    snapshot: '1014',
    canonicalExposureCode: '1014',
    candidates: [mixer, { id: 'gse-1014-b', name: 'GSE 1014 — Extra', deletedAt: null }],
  }),
  item({
    scenarioId: 's-amb-2',
    status: 'AMBIGUOUS',
    snapshot: '1014',
    canonicalExposureCode: '1014',
    candidates: [mixer, caldeira],
  }),
])[0];
assert(
  conflictCandidates?.kind === 'CONFLICT',
  'AMBIGUOUS com candidates incompatíveis não consolida',
);

assert(
  atlasItems.every((entry) => entry.snapshot === '10009' || entry.snapshot === 'GSE 10009' || entry.snapshot === '1012' || entry.snapshot === '1014'),
  'agrupar não reescreve snapshots dos itens',
);
assert(
  chemicalUseScenarioSurveyStatusUnchangedByGseLink({
    surveyStatus: 'LEVANTAMENTO_CONCLUIDO',
    homogeneousGroupId: caldeira.id,
  }) === 'LEVANTAMENTO_CONCLUIDO',
  'vínculo real não altera surveyStatus',
);

assert(
  isChemicalUseScenarioReconcileStaleError({
    response: {
      status: 409,
      data: { code: CHEMICAL_USE_SCENARIO_RECONCILE_STALE_CODE },
    },
  }),
  '409 stale pelo code',
);
assert(
  !isChemicalUseScenarioReconcileStaleError({
    response: { status: 400, data: { code: CHEMICAL_USE_SCENARIO_RECONCILE_STALE_CODE } },
  }),
  'stale só em 409',
);

assert(
  chemicalUseScenarioSurveyStatusUnchangedByGseLink({
    surveyStatus: 'LEVANTAMENTO_CONCLUIDO',
    homogeneousGroupId: null,
  }) === 'LEVANTAMENTO_CONCLUIDO',
  'cenário concluído sem FK continua concluído',
);

const afterUnlink = unlinkPreservesExposureSnapshot({
  exposureGroupSnapshot: '10009',
  homogeneousGroupId: null,
});
assert(afterUnlink.exposureGroupSnapshot === '10009', 'unlink preserva snapshot');
assert(afterUnlink.homogeneousGroupId === null, 'unlink zera só o FK');

const counts = countUseScenarioGseReconcileStatuses([
  matchUnique,
  alreadyLinked,
  noMatch,
  ambiguous,
]);
assert(counts.matchUnique === 1, 'conta MATCH_UNIQUE');
assert(counts.alreadyLinked === 1, 'conta ALREADY_LINKED');
assert(counts.noMatch === 1, 'conta NO_MATCH');
assert(counts.ambiguous === 1, 'conta AMBIGUOUS');

const identity = identifyUseScenarioForReconcile(matchUnique, [
  {
    id: 's-10009',
    activityName: 'Operação da caldeira',
    product: { tradeName: 'IRGANOX' } as never,
  },
]);
assert(identity.productName === 'IRGANOX', 'preview usa produto da listagem');
assert(identity.activityName === 'Operação da caldeira', 'preview usa tarefa da listagem');

console.log('chemical-use-scenario-gse.util.spec.ts: ok');
