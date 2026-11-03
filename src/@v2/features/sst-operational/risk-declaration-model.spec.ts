import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  readRiskDeclaration,
  riskDeclarationError,
  riskDeclarationJson,
} from './risk-declaration-model.ts';

test('unanswered exposure and controls remain unknown rather than becoming no or yes', () => {
  const draft = readRiskDeclaration(undefined);
  assert.equal(draft.exposure, 'NOT_INFORMED');
  assert.equal(draft.epiUsed, 'NOT_INFORMED');
  assert.equal(draft.epcPresent, 'NOT_INFORMED');
  assert.equal(draft.assessmentType, '');
  assert.equal(draft.scope, '');
});

test('declaratory editing preserves measurement evidence and explicitly clears optional fields', () => {
  const source = {
    type: 'QUI',
    twaValue: '5',
    measuredOn: '2026-01-01',
    selectedMeasurement: 'twaValue',
    sstDeclaration: {
      exposure: 'PRESENT',
      epiUsed: 'NO',
      epcPresent: 'YES',
      notes: 'Observação anterior',
      agentDescription: 'Descrição anterior',
    },
  };
  const draft = {
    ...readRiskDeclaration(source),
    notes: 'Nova observação',
    agentDescription: '',
    assessmentType: 'QUALITATIVE',
  };
  const saved = riskDeclarationJson(source, draft);
  assert.equal(saved.twaValue, '5');
  assert.equal(saved.measuredOn, '2026-01-01');
  assert.equal(saved.selectedMeasurement, 'twaValue');
  assert.equal(saved.assessmentType, 'QUALITATIVE');
  assert.deepEqual(saved.sstDeclaration, {
    exposure: 'PRESENT',
    epiUsed: 'NO',
    epcPresent: 'YES',
    notes: 'Nova observação',
  });
  assert.equal(
    source.sstDeclaration.agentDescription,
    'Descrição anterior',
    'building the save must not mutate the displayed source',
  );
});

test('absence/out-of-scope needs justification and linked equipment must be consistent', () => {
  const base = readRiskDeclaration({});
  assert.match(
    riskDeclarationError({ ...base, exposure: 'ABSENT' }),
    /Justifique/,
  );
  assert.match(
    riskDeclarationError({ ...base, scope: 'OUT_OF_SCOPE' }),
    /Justifique/,
  );
  assert.equal(
    riskDeclarationError({
      ...base,
      exposure: 'ABSENT',
      justification: 'Fonte removida',
    }),
    '',
  );
  assert.match(
    riskDeclarationError({ ...base, epiUsed: 'NO' }, 1),
    /EPIs vinculados/,
  );
  assert.match(
    riskDeclarationError({ ...base, epcPresent: 'NO' }, 0, 1),
    /EPCs vinculados/,
  );
  assert.equal(
    riskDeclarationError({ ...base, epiUsed: 'YES', epcPresent: 'YES' }, 1, 1),
    '',
  );
});

test('optional judicial process and description limits are validated without changing source input', () => {
  const base = readRiskDeclaration({});
  assert.match(
    riskDeclarationError({ ...base, judicialProcess: '123.456' }),
    /somente com dígitos/,
  );
  assert.match(
    riskDeclarationError({ ...base, agentDescription: 'a'.repeat(101) }),
    /100 caracteres/,
  );
  assert.equal(
    riskDeclarationError({ ...base, judicialProcess: '12345678901234567890' }),
    '',
  );
});
