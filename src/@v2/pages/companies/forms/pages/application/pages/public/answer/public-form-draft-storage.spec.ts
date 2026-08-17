/**
 * Executar: npx tsx src/@v2/pages/companies/forms/pages/application/pages/public/answer/public-form-draft-storage.spec.ts
 */
import assert from 'node:assert/strict';

import {
  buildIdentifiedSectorFieldValue,
  canPersistPublicFormDraft,
  collectPublicFormSectorQuestionIds,
  getLegacyPublicFormDraftStorageKey,
  getPublicFormDraftStorageKey,
  resolvePublicFormDraftRestore,
  serializePublicFormDraft,
} from './public-form-draft-storage';

const sectorQuestionId = 'q-sector';
const likertQuestionId = 'q-likert';
const textQuestionId = 'q-text';
const sectorA = { id: 'sector-a', text: 'ADIMITRATIVO', value: 'sector-a' };
const sectorB = { id: 'sector-b', text: 'CALDERARIA', value: 'sector-b' };

assert.equal(
  getLegacyPublicFormDraftStorageKey('app-1'),
  'form_answers_app-1',
);
assert.equal(getPublicFormDraftStorageKey('app-1'), 'form_answers_app-1');
assert.equal(
  getPublicFormDraftStorageKey('app-1', 23621),
  'form_answers_app-1_23621',
);
assert.notEqual(
  getPublicFormDraftStorageKey('app-1', 23621),
  getPublicFormDraftStorageKey('app-1', 23623),
);

assert.equal(
  canPersistPublicFormDraft({
    isIdentifiedSession: true,
    employeeId: undefined,
  }),
  false,
);
assert.equal(
  canPersistPublicFormDraft({
    isIdentifiedSession: true,
    employeeId: 23623,
  }),
  true,
);
assert.equal(
  canPersistPublicFormDraft({
    isIdentifiedSession: false,
    employeeId: undefined,
  }),
  true,
);

assert.deepEqual(
  collectPublicFormSectorQuestionIds([
    {
      questions: [
        { id: sectorQuestionId, details: { identifierType: 'SECTOR' } },
        { id: likertQuestionId, details: { identifierType: undefined } },
      ],
    },
  ]),
  [sectorQuestionId],
);

const legacyDraftA = serializePublicFormDraft({
  answers: {
    [sectorQuestionId]: sectorA,
    [likertQuestionId]: { id: 'opt-4' },
    [textQuestionId]: 'resposta textual de A',
  },
  currentStep: 1,
});

const storage: Record<string, string> = {
  [getLegacyPublicFormDraftStorageKey('app-1')]: legacyDraftA,
};

const employeeBOpens = resolvePublicFormDraftRestore({
  applicationId: 'app-1',
  employeeId: 23623,
  identityRaw: storage[getPublicFormDraftStorageKey('app-1', 23623)] ?? null,
  legacyRaw: storage[getLegacyPublicFormDraftStorageKey('app-1')] ?? null,
});

assert.equal(employeeBOpens.storageKey, 'form_answers_app-1_23623');
assert.equal(employeeBOpens.restoredFrom, 'none');
assert.equal(employeeBOpens.ignoredUnattributableLegacy, true);
assert.deepEqual(employeeBOpens.answers, {});
assert.equal(employeeBOpens.answers[sectorQuestionId], undefined);
assert.equal(employeeBOpens.answers[likertQuestionId], undefined);
assert.equal(employeeBOpens.answers[textQuestionId], undefined);
assert.equal(
  storage[getLegacyPublicFormDraftStorageKey('app-1')],
  legacyDraftA,
);

assert.equal(
  canPersistPublicFormDraft({
    isIdentifiedSession: true,
    employeeId: 23623,
  }),
  true,
);

storage[getPublicFormDraftStorageKey('app-1', 23623)] = serializePublicFormDraft(
  {
    answers: {
      [sectorQuestionId]: sectorB,
      [likertQuestionId]: { id: 'opt-2' },
    },
    currentStep: 0,
  },
);

assert.equal(
  Object.keys(storage).includes(getLegacyPublicFormDraftStorageKey('app-1')),
  true,
);
assert.equal(
  storage[getPublicFormDraftStorageKey('app-1', 23621)],
  undefined,
);
assert.notEqual(
  storage[getPublicFormDraftStorageKey('app-1', 23623)],
  storage[getLegacyPublicFormDraftStorageKey('app-1')],
);

const employeeAOwnDraft = serializePublicFormDraft({
  answers: {
    [sectorQuestionId]: sectorA,
    [likertQuestionId]: { id: 'opt-1' },
    [textQuestionId]: 'draft proprio de A',
  },
  currentStep: 2,
});

const restoredA = resolvePublicFormDraftRestore({
  applicationId: 'app-1',
  employeeId: 23621,
  identityRaw: employeeAOwnDraft,
  legacyRaw: legacyDraftA,
});

assert.equal(restoredA.restoredFrom, 'identity');
assert.equal(restoredA.answers[textQuestionId], 'draft proprio de A');
assert.deepEqual(restoredA.answers[likertQuestionId], { id: 'opt-1' });
assert.equal(restoredA.ignoredUnattributableLegacy, true);

const restoredBIgnoresA = resolvePublicFormDraftRestore({
  applicationId: 'app-1',
  employeeId: 23623,
  identityRaw: storage[getPublicFormDraftStorageKey('app-1', 23623)],
  legacyRaw: employeeAOwnDraft,
});

assert.equal(restoredBIgnoresA.restoredFrom, 'identity');
assert.notEqual(restoredBIgnoresA.answers[textQuestionId], 'draft proprio de A');
assert.deepEqual(restoredBIgnoresA.answers[likertQuestionId], { id: 'opt-2' });

const anonymous = resolvePublicFormDraftRestore({
  applicationId: 'app-1',
  employeeId: undefined,
  identityRaw: legacyDraftA,
  legacyRaw: legacyDraftA,
});

assert.equal(anonymous.storageKey, 'form_answers_app-1');
assert.equal(anonymous.restoredFrom, 'legacy');
assert.deepEqual(anonymous.answers[sectorQuestionId], sectorA);
assert.equal(anonymous.answers[textQuestionId], 'resposta textual de A');
assert.equal(anonymous.ignoredUnattributableLegacy, false);

const overwritten = buildIdentifiedSectorFieldValue({
  hierarchyId: 'sector-b',
  sectorOptions: [sectorA, sectorB],
});
assert.equal(overwritten.id, 'sector-b');
assert.notEqual(overwritten.id, 'sector-a');

console.log('public-form-draft-storage.spec.ts OK');
