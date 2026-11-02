import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  toxicologyDraft,
  toxicologyPayload,
  type ToxicologyRecord,
} from './toxicology-model.ts';

const record: ToxicologyRecord = {
  id: 'exam',
  revision: 4,
  employeeId: 8,
  examDate: '2026-04-01T00:00:00Z',
  laboratoryCnpj: '11222333000181',
  examCode: 'AB123456789',
  doctorName: 'Médico responsável',
  doctorCrm: '12345',
  doctorUf: 'SP',
  workerLivesAbroad: false,
};

test('a new toxicology form does not silently choose dates, doctor or residence', () => {
  const draft = toxicologyDraft();
  assert.equal(draft.examDate, '');
  assert.equal(draft.doctorName, '');
  assert.equal(draft.workerLivesAbroad, '');
});
test('payload preserves an explicit negative residence answer and normalizes codes', () => {
  const draft = {
    ...toxicologyDraft(record),
    laboratoryCnpj: '11.222.333/0001-81',
    examCode: 'ab123456789',
  };
  const body = toxicologyPayload(draft, 8);
  assert.equal(body.workerLivesAbroad, false);
  assert.equal(body.laboratoryCnpj, record.laboratoryCnpj);
  assert.equal(body.examCode, record.examCode);
  assert.equal('expectedRevision' in body, false);
  assert.equal('status' in body, false);
});
test('editing sends the revision that was loaded with the form', () => {
  assert.equal(
    toxicologyPayload(toxicologyDraft(record), 8, record).expectedRevision,
    4,
  );
});
test('an accepted examination requires an explicit correction reason', () => {
  const accepted = { ...record, lastAcceptedDeliveryId: 'accepted-delivery' };
  assert.throws(
    () => toxicologyPayload(toxicologyDraft(accepted), 8, accepted),
    /Explique a correção/,
  );
  const body = toxicologyPayload(
    {
      ...toxicologyDraft(accepted),
      correctionReason: '  Corrigir o código do laboratório  ',
    },
    8,
    accepted,
  );
  assert.equal(body.correctionReason, 'Corrigir o código do laboratório');
});
test('a newly accepted record discovered by the server also requires a reason', () => {
  assert.throws(
    () => toxicologyPayload(toxicologyDraft(record), 8, record, true),
    /Explique a correção/,
  );
});
test('invalid civil dates, including overflowed February days, are rejected', () => {
  for (const examDate of ['2026-02-29', '2026-04-31', '01/04/2026', '']) {
    assert.throws(
      () => toxicologyPayload({ ...toxicologyDraft(record), examDate }, 8),
      /data válida/,
    );
  }
  assert.equal(
    toxicologyPayload({ ...toxicologyDraft(record), examDate: '2024-02-29' }, 8)
      .examDate,
    '2024-02-29',
  );
});
test('laboratory, exam and physician identifiers cannot be omitted or guessed', () => {
  const current = toxicologyDraft(record);
  for (const invalid of [
    { laboratoryCnpj: '123' },
    { examCode: '123456789' },
    { doctorName: '' },
    { doctorCrm: '' },
    { doctorUf: 'XX' },
    { workerLivesAbroad: '' as const },
  ]) {
    assert.throws(() => toxicologyPayload({ ...current, ...invalid }, 8));
  }
});
test('a resident abroad may omit CRM and UF without discarding the named physician', () => {
  const body = toxicologyPayload(
    {
      ...toxicologyDraft(record),
      workerLivesAbroad: 'YES',
      doctorCrm: '',
      doctorUf: '',
    },
    8,
    record,
  );
  assert.equal(body.workerLivesAbroad, true);
  assert.equal(body.doctorName, record.doctorName);
  assert.equal(body.doctorCrm, null);
  assert.equal(body.doctorUf, null);
});
test('optional physician identifiers are still validated when supplied abroad', () => {
  const foreign = {
    ...toxicologyDraft(record),
    workerLivesAbroad: 'YES' as const,
  };
  for (const patch of [{ doctorUf: 'XX' }, { doctorCrm: '12345678901' }])
    assert.throws(
      () => toxicologyPayload({ ...foreign, ...patch }, 8),
      /CRM e UF válidos/,
    );
  assert.equal(
    toxicologyPayload({ ...foreign, doctorUf: 'sp' }, 8).doctorUf,
    'SP',
  );
});
test('status changes keep the existing revision and require an explicit reason', () => {
  const draft = { ...toxicologyDraft(record), status: 'INACTIVE' as const };
  assert.throws(
    () => toxicologyPayload(draft, 8, record),
    /Explique a correção/,
  );
  const body = toxicologyPayload(
    { ...draft, correctionReason: 'Exame lançado por engano' },
    8,
    record,
  );
  assert.equal(body.status, 'INACTIVE');
  assert.equal(body.expectedRevision, record.revision);
  assert.equal(body.correctionReason, 'Exame lançado por engano');
  assert.throws(
    () => toxicologyPayload(draft, 8),
    /Um novo exame inicia ativo/,
  );
});
test('reactivation preserves an excluded acceptance and requires a reason for later corrections', () => {
  const inactive = {
    ...record,
    status: 'INACTIVE' as const,
    hasAcceptedHistory: true,
  };
  assert.equal(toxicologyDraft(inactive).status, 'INACTIVE');
  assert.throws(
    () => toxicologyPayload(toxicologyDraft(inactive), 8, inactive),
    /Explique a correção/,
  );
  const body = toxicologyPayload(
    {
      ...toxicologyDraft(inactive),
      status: 'ACTIVE',
      correctionReason: 'Retomar exame válido',
    },
    8,
    inactive,
  );
  assert.equal(body.status, 'ACTIVE');
  assert.equal(body.expectedRevision, 4);
  assert.equal('lastAcceptedDeliveryId' in body, false);
});
