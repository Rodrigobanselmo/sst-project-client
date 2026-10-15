import assert from 'node:assert/strict';

import {
  controlsForProbabilityAssistant,
  countSuggestionMayAutoSave,
  mergeProbabilityWriteIntoRiskRow,
  originKindForWorkspaceProbabilityWrite,
  prepareWorkspaceProbabilityWrite,
  requiresWorkspaceProbabilityControls,
  workspaceProbabilityAssistantNote,
  workspaceProbabilityCaption,
} from './workspace-probability-evaluation.util';

const manual = { id: 'manual' };
const derivedMoeve = { id: 'derivada-moeve' };
const epi = { id: 'epi-1' };

const moeveWrite = prepareWorkspaceProbabilityWrite({
  values: { probability: 2 },
  headerWorkspaceId: 'moeve',
});
const refinariaWrite = prepareWorkspaceProbabilityWrite({
  values: { probability: 3, probabilityCriteria: { medsImplemented: 2 } },
  headerWorkspaceId: 'refinaria',
});

assert.equal(moeveWrite.ok, true);
assert.equal(refinariaWrite.ok, true);
if (moeveWrite.ok && refinariaWrite.ok) {
  assert.equal(moeveWrite.values.workspaceId, 'moeve');
  assert.equal(refinariaWrite.values.workspaceId, 'refinaria');
  assert.notEqual(moeveWrite.values.workspaceId, refinariaWrite.values.workspaceId);
}

const missing = prepareWorkspaceProbabilityWrite({
  values: { probability: 2, workspaceId: 'outra-tela' },
  headerWorkspaceId: null,
});
assert.equal(missing.ok, false);

const headerWins = prepareWorkspaceProbabilityWrite({
  values: { probability: 2, workspaceId: 'outra-tela' },
  headerWorkspaceId: 'moeve',
});
assert.equal(headerWins.ok, true);
if (headerWins.ok) assert.equal(headerWins.values.workspaceId, 'moeve');

const characterization = prepareWorkspaceProbabilityWrite({
  values: { probability: 4 },
  originKind: 'CHARACTERIZATION',
  headerWorkspaceId: null,
});
assert.equal(characterization.ok, true);
if (characterization.ok) assert.equal(characterization.values.workspaceId, undefined);

const quantitative = prepareWorkspaceProbabilityWrite({
  values: { probability: 5 },
  isQuantity: true,
  headerWorkspaceId: null,
});
assert.equal(quantitative.ok, true);

const exposureOnly = prepareWorkspaceProbabilityWrite({
  values: { exposure: 'HP' } as { probability?: number; exposure: string },
  headerWorkspaceId: null,
});
assert.equal(exposureOnly.ok, true);

const filtered = controlsForProbabilityAssistant({
  engs: [{ id: 'eng-outro' }, { id: 'eng-manual' }],
  adms: [manual, derivedMoeve, { id: 'derivada-refinaria' }],
  epis: [epi, { id: 'epi-extra' }],
  controlsForWorkspaceProbabilityEstimate: {
    adms: [manual, derivedMoeve],
    engs: [{ id: 'eng-manual' }],
    epis: [epi],
  },
}, { requireWorkspaceControls: true });
assert.equal(filtered.available, true);
if (filtered.available) {
  assert.deepEqual(filtered.controls.adms?.map((item) => (item as { id: string }).id), ['manual', 'derivada-moeve']);
  assert.deepEqual(filtered.controls.engs?.map((item) => (item as { id: string }).id), ['eng-manual']);
  assert.deepEqual(filtered.controls.epis?.map((item) => (item as { id: string }).id), ['epi-1']);
}

const unfiltered = controlsForProbabilityAssistant({
  engs: [{ id: 'eng-manual' }],
  adms: [manual],
  epis: [epi],
  controlsForWorkspaceProbabilityEstimate: null,
});
assert.equal(unfiltered.available, true);
if (unfiltered.available) {
  assert.deepEqual(unfiltered.controls.adms, [manual]);
  assert.deepEqual(unfiltered.controls.epis, [epi]);
}

const blocked = controlsForProbabilityAssistant({
  engs: [{ id: 'eng-outro' }],
  adms: [manual, derivedMoeve],
  epis: [epi],
  controlsForWorkspaceProbabilityEstimate: null,
}, { requireWorkspaceControls: true });
assert.equal(blocked.available, false);

const characterizationView = controlsForProbabilityAssistant({
  engs: [{ id: 'epc' }],
  adms: [{ id: 'adm' }, { id: 'treinamento' }],
  epis: [epi],
  controlsForWorkspaceProbabilityEstimate: null,
}, {
  requireWorkspaceControls: requiresWorkspaceProbabilityControls({
    isQuantity: false,
    originKind: undefined,
    viewDataType: 'CHARACTERIZATION',
    headerWorkspaceId: 'altus',
  }),
});
assert.equal(characterizationView.available, true);
if (characterizationView.available) {
  assert.deepEqual(
    characterizationView.controls.engs?.map((item) => (item as { id: string }).id),
    ['epc'],
  );
  assert.equal(characterizationView.controls.adms?.length, 2);
}

const gseMissingControls = controlsForProbabilityAssistant({
  engs: [{ id: 'epc' }],
  adms: [manual],
  epis: [epi],
  controlsForWorkspaceProbabilityEstimate: null,
}, {
  requireWorkspaceControls: requiresWorkspaceProbabilityControls({
    isQuantity: false,
    originKind: 'GSE',
    viewDataType: 'GSE',
    headerWorkspaceId: 'altus',
  }),
});
assert.equal(gseMissingControls.available, false);

const gseWithoutControls = controlsForProbabilityAssistant({
  engs: [],
  adms: [],
  epis: [],
  controlsForWorkspaceProbabilityEstimate: { adms: [], engs: [], epis: [] },
}, {
  requireWorkspaceControls: requiresWorkspaceProbabilityControls({
    viewDataType: 'GSE',
    headerWorkspaceId: 'altus',
  }),
});
assert.equal(gseWithoutControls.available, true);
if (gseWithoutControls.available) {
  assert.deepEqual(gseWithoutControls.controls.adms, []);
  assert.deepEqual(gseWithoutControls.controls.engs, []);
  assert.deepEqual(gseWithoutControls.controls.epis, []);
}

assert.equal(
  requiresWorkspaceProbabilityControls({
    originKind: 'CHARACTERIZATION',
    viewDataType: 'GSE',
    headerWorkspaceId: 'altus',
  }),
  false,
);
assert.equal(
  requiresWorkspaceProbabilityControls({
    isQuantity: true,
    viewDataType: 'GSE',
    headerWorkspaceId: 'altus',
  }),
  false,
);
assert.equal(
  requiresWorkspaceProbabilityControls({
    viewDataType: 'WORKSTATION',
    headerWorkspaceId: 'altus',
  }),
  false,
);
assert.equal(
  requiresWorkspaceProbabilityControls({
    viewDataType: 'SIMPLE_BY_GROUP',
    headerWorkspaceId: 'altus',
  }),
  true,
);

assert.equal(
  originKindForWorkspaceProbabilityWrite({ viewDataType: 'CHARACTERIZATION' }),
  'CHARACTERIZATION',
);
assert.equal(
  originKindForWorkspaceProbabilityWrite({ viewDataType: 'WORKSTATION' }),
  'CHARACTERIZATION',
);
assert.equal(
  originKindForWorkspaceProbabilityWrite({
    originKind: 'GSE',
    viewDataType: 'GSE',
  }),
  'GSE',
);
assert.equal(
  originKindForWorkspaceProbabilityWrite({
    originKind: 'CHARACTERIZATION',
    viewDataType: 'GSE',
  }),
  'CHARACTERIZATION',
);
assert.equal(
  originKindForWorkspaceProbabilityWrite({ viewDataType: 'GSE' }),
  undefined,
);

const characterizationSave = prepareWorkspaceProbabilityWrite({
  values: { probability: 3, probabilityCriteria: { medsImplemented: 1 } },
  originKind: originKindForWorkspaceProbabilityWrite({
    viewDataType: 'CHARACTERIZATION',
  }),
  headerWorkspaceId: 'altus',
});
assert.equal(characterizationSave.ok, true);
if (characterizationSave.ok) {
  assert.equal(characterizationSave.values.workspaceId, undefined);
  assert.equal(characterizationSave.values.probability, 3);
}

assert.equal(
  workspaceProbabilityCaption({ authority: 'SHARED' }),
  'Avaliação histórica compartilhada',
);
assert.equal(
  workspaceProbabilityCaption({ authority: 'WORKSPACE', origin: 'ESTIMATE' }),
  'Estimativa deste estabelecimento',
);
assert.match(
  workspaceProbabilityCaption({ authority: 'WORKSPACE', origin: 'MANUAL' }) || '',
  /manualmente/,
);
assert.match(
  workspaceProbabilityCaption({ authority: 'WORKSPACE', origin: 'PROMOTION' }) || '',
  /Plano de Ação/,
);
assert.equal(workspaceProbabilityCaption({ authority: 'WORKSPACE', isQuantity: true }), null);
assert.equal(workspaceProbabilityCaption({ authority: null }), null);

assert.match(workspaceProbabilityAssistantNote({ origin: 'MANUAL' }) || '', /última estimativa/);
assert.match(workspaceProbabilityAssistantNote({ origin: 'PROMOTION' }) || '', /última estimativa/);
const manualWithoutEstimate =
  workspaceProbabilityAssistantNote({ authority: 'WORKSPACE', origin: 'MANUAL', hasAdoptedCriteria: false }) || '';
assert.match(manualWithoutEstimate, /definida manualmente/);
assert.doesNotMatch(manualWithoutEstimate, /última estimativa/);
const promotionWithoutEstimate =
  workspaceProbabilityAssistantNote({ authority: 'WORKSPACE', origin: 'PROMOTION', hasAdoptedCriteria: false }) || '';
assert.match(promotionWithoutEstimate, /Plano de Ação/);
assert.doesNotMatch(promotionWithoutEstimate, /última estimativa/);
assert.match(
  workspaceProbabilityAssistantNote({ authority: 'WORKSPACE', origin: 'MANUAL', hasAdoptedCriteria: true }) || '',
  /última estimativa/,
);
assert.match(
  workspaceProbabilityAssistantNote({ authority: 'SHARED' }) || '',
  /histórica compartilhada/,
);
assert.match(
  workspaceProbabilityAssistantNote({ authority: 'WORKSPACE', origin: 'ESTIMATE' }) || '',
  /Critérios adotados/,
);

assert.equal(countSuggestionMayAutoSave({ authority: 'SHARED', origin: null }), false);
assert.equal(countSuggestionMayAutoSave({ authority: 'WORKSPACE', origin: 'MANUAL' }), false);
assert.equal(countSuggestionMayAutoSave({ authority: 'WORKSPACE', origin: 'PROMOTION' }), false);
assert.equal(countSuggestionMayAutoSave({ authority: 'WORKSPACE', origin: 'ESTIMATE' }), true);
assert.equal(countSuggestionMayAutoSave({ authority: null, origin: null }), true);

const current = {
  probability: 4,
  probabilityAfter: 3,
  level: 4,
  ro: 'Alto',
  probabilityAuthority: 'WORKSPACE' as const,
  probabilityOrigin: 'ESTIMATE' as const,
  probabilityCriteria: { medsImplemented: 2 },
  criteriaAdoptedAt: '2026-01-01',
  controlsForWorkspaceProbabilityEstimate: { adms: [manual], engs: [], epis: [epi] },
};
const manualResponse = mergeProbabilityWriteIntoRiskRow(current, {
  probability: 2,
  probabilityAfter: 4,
  level: 1,
  ro: 'Baixo',
  probabilityAuthority: 'WORKSPACE',
  probabilityOrigin: 'MANUAL',
  probabilityCriteria: { medsImplemented: 9 },
  criteriaAdoptedAt: '2026-08-01',
  controlsForWorkspaceProbabilityEstimate: { adms: [], engs: [], epis: [] },
});
assert.equal(manualResponse.probability, 2);
assert.equal(manualResponse.probabilityAfter, 3);
assert.equal(manualResponse.level, 4);
assert.equal(manualResponse.ro, 'Alto');
assert.equal(manualResponse.probabilityOrigin, 'MANUAL');
assert.equal(manualResponse.probabilityCriteria?.medsImplemented, 2);
assert.equal(manualResponse.criteriaAdoptedAt, '2026-01-01');
assert.deepEqual(manualResponse.controlsForWorkspaceProbabilityEstimate?.adms, [manual]);

const estimateResponse = mergeProbabilityWriteIntoRiskRow(current, {
  probability: 1,
  probabilityOrigin: 'ESTIMATE',
  probabilityCriteria: { medsImplemented: 1 },
  criteriaAdoptedAt: '2026-04-01',
});
assert.equal(estimateResponse.probabilityCriteria?.medsImplemented, 1);
assert.equal(estimateResponse.criteriaAdoptedAt, '2026-04-01');
assert.equal(estimateResponse.probabilityAfter, 3);

const promotionResponse = mergeProbabilityWriteIntoRiskRow(current, {
  probability: 3,
  probabilityOrigin: 'PROMOTION',
  probabilityCriteria: { medsImplemented: 9 },
  criteriaAdoptedAt: '2026-09-01',
});
assert.equal(promotionResponse.probability, 3);
assert.equal(promotionResponse.probabilityOrigin, 'PROMOTION');
assert.equal(promotionResponse.probabilityCriteria?.medsImplemented, 2);
assert.equal(promotionResponse.criteriaAdoptedAt, '2026-01-01');
assert.equal(promotionResponse.probabilityAfter, 3);

const residualResponse = mergeProbabilityWriteIntoRiskRow(current, {
  probability: 9,
  probabilityAfter: 1,
  probabilityOrigin: 'MANUAL',
  probabilityCriteria: { medsImplemented: 9 },
  criteriaAdoptedAt: '2026-10-01',
  probabilityAuthority: 'WORKSPACE',
}, { probabilityAfter: 1 });
assert.equal(residualResponse.probability, 4);
assert.equal(residualResponse.probabilityAfter, 1);
assert.equal(residualResponse.probabilityOrigin, 'ESTIMATE');
assert.equal(residualResponse.probabilityCriteria?.medsImplemented, 2);
assert.equal(residualResponse.criteriaAdoptedAt, '2026-01-01');

const residualWrite = prepareWorkspaceProbabilityWrite({
  values: { probabilityAfter: 1 },
  headerWorkspaceId: 'moeve',
});
const residualOther = prepareWorkspaceProbabilityWrite({
  values: { probabilityAfter: 2 },
  headerWorkspaceId: 'refinaria',
});
assert.equal(residualWrite.ok, true);
assert.equal(residualOther.ok, true);
if (residualWrite.ok && residualOther.ok) {
  assert.equal(residualWrite.values.workspaceId, 'moeve');
  assert.equal(residualOther.values.workspaceId, 'refinaria');
  assert.equal('probability' in residualWrite.values, false);
}
const residualMissing = prepareWorkspaceProbabilityWrite({
  values: { probabilityAfter: 1 },
  headerWorkspaceId: null,
});
assert.equal(residualMissing.ok, false);
const residualCharacterization = prepareWorkspaceProbabilityWrite({
  values: { probabilityAfter: 1, workspaceId: 'outro' },
  originKind: 'CHARACTERIZATION',
  headerWorkspaceId: null,
});
assert.equal(residualCharacterization.ok, true);
if (residualCharacterization.ok) {
  assert.equal(residualCharacterization.values.workspaceId, 'outro');
}
const residualQuantity = prepareWorkspaceProbabilityWrite({
  values: { probabilityAfter: 1 },
  isQuantity: true,
  headerWorkspaceId: null,
});
assert.equal(residualQuantity.ok, true);

console.log('workspace-probability-evaluation.util.spec.ts OK');
