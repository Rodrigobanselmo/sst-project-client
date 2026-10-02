/**
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddProbability/qualitative-probability.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  classifyMedsImplemented,
  countSuggestionEffectAction,
  countSuggestionSignature,
  criteriaFromForm,
  journeyMinutesForModalOpen,
  medsImplementedForModalOpen,
  qualitativeProbabilityFromCriteria,
  qualitativeProbabilityPreview,
  resolveCountSuggestion,
} from './qualitative-probability.util';

const dir = dirname(fileURLToPath(import.meta.url));

const saved = {
  employeeCountTotal: 100,
  employeeCountGho: 5,
  minDurationJT: 480,
  minDurationEO: 120,
  chancesOfHappening: 3,
  frequency: 3,
  history: 1,
  medsImplemented: 4,
};

const fromSaved = qualitativeProbabilityFromCriteria(saved);
assert.equal(fromSaved, 3);

const typed = criteriaFromForm({
  employeeCountTotal: '100',
  employeeCountGho: '5',
  minDurationJT: '480',
  minDurationEO: '120',
  chancesOfHappening: '3',
  frequency: '3',
  history: '1',
  medsImplemented: '4',
});
assert.deepEqual(typed, saved);
assert.equal(qualitativeProbabilityFromCriteria(typed), fromSaved);

const countSensitive = {
  employeeCountTotal: 100,
  employeeCountGho: 5,
  minDurationJT: null,
  minDurationEO: null,
  chancesOfHappening: null,
  frequency: 5,
  history: null,
  medsImplemented: null,
};
assert.equal(qualitativeProbabilityFromCriteria(countSensitive), 3);
assert.equal(
  qualitativeProbabilityFromCriteria({
    ...countSensitive,
    employeeCountTotal: 0,
    employeeCountGho: 0,
  }),
  5,
);

assert.equal(qualitativeProbabilityFromCriteria({}), null);

assert.equal(
  resolveCountSuggestion({
    adopted: null,
    adoptedProbability: 3,
    currentTotal: 80,
    currentGho: 40,
  }).kind,
  'none',
);

const drifted = resolveCountSuggestion({
  adopted: countSensitive,
  adoptedProbability: 3,
  currentTotal: 100,
  currentGho: 80,
});
assert.equal(drifted.kind, 'auto');
if (drifted.kind === 'auto') {
  assert.equal(drifted.probability, 5);
  assert.equal(drifted.criteria.employeeCountGho, 80);
  assert.equal(drifted.criteria.frequency, 5);
  assert.equal(drifted.criteria.medsImplemented, null);
}

const manual = resolveCountSuggestion({
  adopted: countSensitive,
  adoptedProbability: 1,
  currentTotal: 100,
  currentGho: 80,
});
assert.equal(manual.kind, 'hint');
if (manual.kind === 'hint') {
  assert.equal(manual.probability, 5);
  assert.equal(manual.criteria.employeeCountGho, 80);
  assert.equal(manual.criteria.frequency, countSensitive.frequency);
}

assert.equal(
  resolveCountSuggestion({
    adopted: saved,
    adoptedProbability: fromSaved,
    currentTotal: saved.employeeCountTotal,
    currentGho: saved.employeeCountGho,
  }).kind,
  'none',
);

assert.equal(
  resolveCountSuggestion({
    adopted: saved,
    adoptedProbability: fromSaved,
    currentTotal: 80,
    currentGho: 40,
    isQuantity: true,
  }).kind,
  'none',
);

assert.equal(countSuggestionEffectAction(null, drifted), 'baseline');
const signature = countSuggestionSignature(drifted);
assert.equal(countSuggestionEffectAction(signature, drifted), 'ignore');
assert.equal(
  countSuggestionEffectAction('none', drifted),
  'auto',
);
assert.equal(countSuggestionEffectAction(null, manual), 'baseline');
assert.equal(countSuggestionEffectAction('none', manual), 'ignore');

const present = [{}];
const matrix = [
  { engs: present, adms: present, epis: present, expected: 1 },
  { engs: present, adms: present, epis: [], expected: 2 },
  { engs: present, adms: [], epis: present, expected: 3 },
  { engs: [], adms: present, epis: present, expected: 3 },
  { engs: present, adms: [], epis: [], expected: 4 },
  { engs: [], adms: present, epis: [], expected: 4 },
  { engs: [], adms: [], epis: present, expected: 4 },
  { engs: [], adms: [], epis: [], expected: 5 },
] as const;
for (const row of matrix) {
  assert.equal(classifyMedsImplemented(row), row.expected);
}
assert.equal(
  classifyMedsImplemented({
    engs: [{ efficientlyCheck: false }],
    adms: [],
    epis: [{ trainingCheck: false, epcCheck: true }],
  }),
  3,
);
assert.equal(classifyMedsImplemented({ engs: [null], adms: [], epis: [] }), 5);

const allControls = { engs: present, adms: present, epis: present };
assert.equal(medsImplementedForModalOpen({ controls: allControls }), 1);
assert.equal(medsImplementedForModalOpen({ controls: { engs: [], adms: [], epis: [] } }), 5);
assert.equal(medsImplementedForModalOpen({}), null);
assert.equal(
  medsImplementedForModalOpen({ adopted: saved, controls: allControls }),
  saved.medsImplemented,
);
assert.equal(
  medsImplementedForModalOpen({
    adopted: { ...saved, medsImplemented: null },
    controls: allControls,
  }),
  null,
);

const medsBase = {
  employeeCountTotal: 100,
  employeeCountGho: 5,
  minDurationJT: null,
  minDurationEO: null,
  chancesOfHappening: null,
  frequency: 1,
  history: null,
  medsImplemented: 5,
};
const fromMeds = qualitativeProbabilityFromCriteria(medsBase);
assert.equal(fromMeds, 3);

const controlDrift = resolveCountSuggestion({
  adopted: medsBase,
  adoptedProbability: fromMeds,
  currentTotal: 100,
  currentGho: 5,
  currentMedsImplemented: 1,
});
assert.equal(controlDrift.kind, 'auto');
if (controlDrift.kind === 'auto') {
  assert.equal(controlDrift.probability, 1);
  assert.equal(controlDrift.criteria.medsImplemented, 1);
  assert.equal(controlDrift.criteria.frequency, 1);
  assert.equal(controlDrift.criteria.employeeCountGho, 5);
}

const manualMeds = resolveCountSuggestion({
  adopted: medsBase,
  adoptedProbability: 5,
  currentTotal: 100,
  currentGho: 5,
  currentMedsImplemented: 1,
});
assert.equal(manualMeds.kind, 'hint');
if (manualMeds.kind === 'hint') {
  assert.equal(manualMeds.probability, 1);
  assert.equal(manualMeds.criteria.medsImplemented, 1);
  assert.equal(manualMeds.criteria.frequency, 1);
}

const joint = resolveCountSuggestion({
  adopted: medsBase,
  adoptedProbability: fromMeds,
  currentTotal: 100,
  currentGho: 80,
  currentMedsImplemented: 1,
});
assert.equal(joint.kind, 'auto');
if (joint.kind === 'auto') {
  assert.equal(joint.probability, 2);
  assert.equal(joint.criteria.employeeCountGho, 80);
  assert.equal(joint.criteria.medsImplemented, 1);
  assert.equal(joint.criteria.frequency, 1);
}

assert.equal(
  resolveCountSuggestion({
    adopted: {
      ...medsBase,
      frequency: 5,
      medsImplemented: 5,
    },
    adoptedProbability: 4,
    currentTotal: 100,
    currentGho: 5,
    currentMedsImplemented: 4,
  }).kind,
  'none',
);

assert.equal(
  resolveCountSuggestion({
    adopted: medsBase,
    adoptedProbability: fromMeds,
    currentTotal: 100,
    currentGho: 5,
    currentMedsImplemented: 1,
    isQuantity: true,
  }).kind,
  'none',
);

assert.equal(countSuggestionEffectAction(null, controlDrift), 'baseline');
assert.equal(countSuggestionEffectAction('none', controlDrift), 'auto');
assert.equal(countSuggestionEffectAction(null, manualMeds), 'baseline');
assert.equal(countSuggestionEffectAction('none', manualMeds), 'ignore');

assert.equal(journeyMinutesForModalOpen({}), null);
assert.equal(journeyMinutesForModalOpen({ suggestedMinutes: null }), null);
assert.equal(journeyMinutesForModalOpen({ suggestedMinutes: 480 }), 480);
assert.equal(
  journeyMinutesForModalOpen({
    adopted: { minDurationJT: 360 },
    suggestedMinutes: 480,
  }),
  360,
);
assert.equal(
  journeyMinutesForModalOpen({
    adopted: { minDurationJT: null },
    suggestedMinutes: 480,
  }),
  null,
);

const journeyBase = {
  employeeCountTotal: 100,
  employeeCountGho: 5,
  minDurationJT: null as number | null,
  minDurationEO: null as number | null,
  chancesOfHappening: null,
  frequency: 1,
  history: null,
  medsImplemented: null,
};
const fromJourneyBase = qualitativeProbabilityFromCriteria(journeyBase);
assert.equal(
  resolveCountSuggestion({
    adopted: journeyBase,
    adoptedProbability: fromJourneyBase,
    currentTotal: 100,
    currentGho: 5,
    currentJourneyMinutes: 480,
  }).kind,
  'none',
);
assert.equal(qualitativeProbabilityPreview({ minDurationJT: 480 }), null);
assert.equal(
  qualitativeProbabilityPreview({ minDurationJT: 480, minDurationEO: 120 })?.criteriaCount,
  1,
);

const adoptedWithExposure = { ...journeyBase, minDurationEO: 120 };
const fromExposureOnly = qualitativeProbabilityFromCriteria(adoptedWithExposure);
const journeyAuto = resolveCountSuggestion({
  adopted: adoptedWithExposure,
  adoptedProbability: fromExposureOnly,
  currentTotal: 100,
  currentGho: 5,
  currentJourneyMinutes: 480,
});
assert.equal(journeyAuto.kind, 'auto');
if (journeyAuto.kind === 'auto') {
  assert.equal(journeyAuto.criteria.minDurationJT, 480);
  assert.equal(journeyAuto.criteria.minDurationEO, 120);
  assert.notEqual(journeyAuto.probability, fromExposureOnly);
}

const journeyManual = resolveCountSuggestion({
  adopted: { ...adoptedWithExposure, minDurationJT: 360 },
  adoptedProbability: 5,
  currentTotal: 100,
  currentGho: 5,
  currentJourneyMinutes: 480,
});
assert.equal(journeyManual.kind, 'hint');
if (journeyManual.kind === 'hint') {
  assert.equal(journeyManual.criteria.minDurationJT, 480);
  assert.equal(journeyManual.criteria.minDurationEO, 120);
}

assert.equal(
  resolveCountSuggestion({
    adopted: { ...adoptedWithExposure, minDurationJT: 360 },
    adoptedProbability: qualitativeProbabilityFromCriteria({
      ...adoptedWithExposure,
      minDurationJT: 360,
    }),
    currentTotal: 100,
    currentGho: 5,
    currentJourneyMinutes: null,
  }).kind,
  'none',
);
assert.equal(
  resolveCountSuggestion({
    adopted: { ...adoptedWithExposure, minDurationJT: 360 },
    adoptedProbability: qualitativeProbabilityFromCriteria({
      ...adoptedWithExposure,
      minDurationJT: 360,
    }),
    currentTotal: 100,
    currentGho: 5,
  }).kind,
  'none',
);
assert.equal(
  resolveCountSuggestion({
    adopted: adoptedWithExposure,
    adoptedProbability: fromExposureOnly,
    currentTotal: 100,
    currentGho: 5,
    currentJourneyMinutes: 480,
    isQuantity: true,
  }).kind,
  'none',
);
assert.equal(countSuggestionEffectAction(null, journeyAuto), 'baseline');
assert.equal(countSuggestionEffectAction('none', journeyAuto), 'auto');
assert.equal(countSuggestionEffectAction('none', journeyManual), 'ignore');

const hook = readFileSync(join(dir, 'hooks/useProbability.ts'), 'utf8');
assert.match(hook, /criteriaFromForm\(values\)/);
assert.match(hook, /medsImplementedForModalOpen/);
assert.match(hook, /journeyMinutesForModalOpen/);
assert.match(hook, /journeyStatus/);
assert.doesNotMatch(hook, /journeyOptions\.length > 1/);
const journeyEffect = hook.slice(
  hook.indexOf('const minutes = journeyMinutesForModalOpen'),
  hook.indexOf('const onClose'),
);
assert.doesNotMatch(journeyEffect, /onCreate/);
assert.match(hook, /probabilityData\.onCreate\?\.\(/);
const openEffect = hook.slice(hook.indexOf('const medsForOpen'), hook.indexOf('const onClose'));
assert.doesNotMatch(openEffect, /onCreate/);
assert.doesNotMatch(hook, /probabilityData\.employeeCountGho/);
assert.doesNotMatch(hook, /useMutUpsertRiskData/);

const modal = readFileSync(join(dir, 'index.tsx'), 'utf8');
assert.doesNotMatch(modal, /useMutUpsertRiskData/);

const util = readFileSync(join(dir, 'qualitative-probability.util.ts'), 'utf8');
assert.doesNotMatch(util, /calculateSuggestedResidualProbability/);
assert.doesNotMatch(util, /1\.25/);
assert.doesNotMatch(util, /trainingCheck/);
assert.doesNotMatch(util, /efficientlyCheck/);
assert.doesNotMatch(util, /epcCheck/);
assert.doesNotMatch(util, /probabilityAfter/);
assert.doesNotMatch(util, /dataRecs/);
assert.doesNotMatch(util, /\brecs\b/);

const measures = readFileSync(
  join(dir, '../../../../core/constants/maps/probability/measures.map.ts'),
  'utf8',
);
assert.match(measures, /EPC \+ ADM \+ EPI/);
assert.match(measures, /name: 'EPC \+ ADM',/);
assert.match(measures, /EPC \+ EPI ou ADM \+ EPI/);
assert.match(measures, /Apenas uma medida de controle: EPC, ADM ou EPI/);
assert.match(measures, /Sem Medidas de Prevenção/);
assert.doesNotMatch(measures, /Treinamentos/);

const onlyMeds = { medsImplemented: 4 };
const onlyMedsPreview = qualitativeProbabilityPreview(onlyMeds);
assert.equal(onlyMedsPreview?.probability, 4);
assert.equal(onlyMedsPreview?.criteriaCount, 1);
assert.equal(onlyMedsPreview?.probability, qualitativeProbabilityFromCriteria(onlyMeds));

assert.equal(
  qualitativeProbabilityPreview({ employeeCountTotal: 100, employeeCountGho: null }),
  null,
);
assert.equal(
  qualitativeProbabilityPreview({ minDurationJT: 480, minDurationEO: null }),
  null,
);

const countsOnly = { employeeCountTotal: 100, employeeCountGho: 5 };
const countsPreview = qualitativeProbabilityPreview(countsOnly);
assert.equal(countsPreview?.criteriaCount, 1);
assert.equal(countsPreview?.probability, qualitativeProbabilityFromCriteria(countsOnly));
assert.equal(countsPreview?.probability, 1);

const durationOnly = { minDurationJT: 480, minDurationEO: 120 };
const durationPreview = qualitativeProbabilityPreview(durationOnly);
assert.equal(durationPreview?.criteriaCount, 1);
assert.equal(durationPreview?.probability, qualitativeProbabilityFromCriteria(durationOnly));

const partialThenMore = {
  medsImplemented: 4,
  frequency: 2,
  employeeCountTotal: 100,
  employeeCountGho: 5,
};
const partialPreview = qualitativeProbabilityPreview(partialThenMore);
assert.equal(partialPreview?.criteriaCount, 3);
assert.equal(partialPreview?.probability, qualitativeProbabilityFromCriteria(partialThenMore));
assert.equal(partialPreview?.probability, Math.ceil((4 + 2 + 1) / 3));

assert.equal(qualitativeProbabilityPreview({}), null);

const form = readFileSync(join(dir, 'components/ProbabilityForm/index.tsx'), 'utf8');
assert.match(form, /qualitativeProbabilityPreview\(criteriaFromForm/);
assert.match(form, /Probabilidade estimada: P/);
assert.match(form, /Calculada com 1 critério informado/);
assert.match(form, /Preencha os critérios para visualizar a probabilidade estimada/);
assert.doesNotMatch(form, /Math\.ceil/);
assert.doesNotMatch(form, /percentageCheck/);
assert.doesNotMatch(form, /onCreate/);
assert.doesNotMatch(form, /useMutUpsertRiskData/);
assert.match(form, /bgcolor: 'primary.main'/);
assert.match(form, /variant="outlined"/);
assert.match(form, /borderColor: 'common.black'/);
assert.match(form, /type="submit"/);
assert.match(form, /Jornadas diferentes identificadas/);
assert.match(form, /Atenção: jornada identificada para apenas|<strong>Atenção:<\/strong>/);
assert.match(form, /homogeneidade da exposição/);
assert.match(form, /#FFF8E1/);
assert.match(form, /common\.black/);
assert.match(form, /journeyStatus === 'CONFLITANTE'/);
assert.match(form, /journeyStatus === 'CONSISTENTE_INCOMPLETO'/);
assert.doesNotMatch(form, /Escolha a duração a adotar/);
assert.doesNotMatch(form, /setValue\('minDurationJT', option\.durationMinutes\)/);
assert.match(form, />\s*Aplicar\s*</);

const journeysHook = readFileSync(join(dir, 'use-applicable-journeys.ts'), 'utf8');
assert.match(journeysHook, /normalizeApplicableJourneys/);
const journeysUtil = readFileSync(join(dir, 'applicable-journeys.util.ts'), 'utf8');
assert.match(journeysUtil, /CONSISTENTE_INCOMPLETO/);
assert.match(journeysUtil, /knownJourneyCount < coveredEmployeeCount/);
assert.doesNotMatch(form, /Cancelar/);
assert.match(util, /qualitativeProbabilityFromCriteria\(criteria\)/);
assert.match(modal, /onClose=\{onCloseUnsaved\}/);
assert.match(modal, /onSubmit=\{\(handleSubmit as any\)\(onSubmit\)\}/);
assert.doesNotMatch(modal, /SModalButtons/);
assert.doesNotMatch(modal, /Cancelar/);
assert.doesNotMatch(modal, /Criar/);

const suggestion = readFileSync(join(dir, 'RealProbabilityCountSuggestion.tsx'), 'utf8');
assert.match(suggestion, /Sugestão atual/);
assert.match(suggestion, /currentMedsImplemented/);
assert.match(suggestion, /currentJourneyMinutes/);
assert.match(suggestion, /journeys\.ready/);
assert.match(suggestion, /action !== 'auto'/);
assert.match(suggestion, /probabilityCriteria: decision\.criteria/);
assert.doesNotMatch(suggestion, /calculateSuggestedResidualProbability/);
assert.doesNotMatch(util, /calculateSuggestedResidualProbability/);

console.log('qualitative-probability.util.spec: ok');
