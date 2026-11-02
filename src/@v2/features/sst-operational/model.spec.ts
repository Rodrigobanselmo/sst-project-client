import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diagnosticMessage } from './model.ts';
import { measurementOptions } from './measurement-model.ts';
test('seleção declaratória distingue componentes de vibração e doses sem escolher um resultado automaticamente', () => {
  assert.deepEqual(
    measurementOptions('VFB', { esocialCode: '02.01.003' }).map((o) => o.value),
    ['aren'],
  );
  assert.deepEqual(
    measurementOptions('VFB', { esocialCode: '02.01.004' }).map((o) => o.value),
    ['vdvr'],
  );
  const doses = measurementOptions('RADIATION');
  assert.equal(doses.length, 7);
  assert.ok(
    doses.some((o) => o.value === 'doseEyePublic' && /público/.test(o.label)),
  );
  assert.deepEqual(
    measurementOptions('NOISE', { appendix: '2' }).map((o) => o.value),
    ['impactPeak'],
  );
  assert.ok(!measurementOptions('NOISE').some((o) => o.value === 'twaValue'));
});

test('orienta a correção no cadastro de origem e trata diagnóstico desconhecido como impedimento', () => {
  assert.match(diagnosticMessage('WORKER_CPF_INVALID'), /CPF.*empregado/);
  assert.match(
    diagnosticMessage('SOURCE_CHANGE_NEEDS_REVIEW'),
    /não pôde ser incorporada/,
  );
  assert.match(
    diagnosticMessage('UNKNOWN_NEW_RULE'),
    /antes de preparar o envio/,
  );
});

test('orienta vigência de vínculo também para GSE e formatação na caracterização existente', () => {
  assert.match(
    diagnosticMessage('CHARACTERIZATION_LINK_START_REQUIRED'),
    /data de início.*vínculo.*cargo.*ambiente, atividade ou GSE.*cadastro de origem/,
  );
  assert.match(
    diagnosticMessage('CHARACTERIZATION_ACTIVITY_FORMAT_REQUIRES_REVIEW'),
    /texto das atividades.*caracterização de origem.*formatação.*antes de preparar o envio/,
  );
});
