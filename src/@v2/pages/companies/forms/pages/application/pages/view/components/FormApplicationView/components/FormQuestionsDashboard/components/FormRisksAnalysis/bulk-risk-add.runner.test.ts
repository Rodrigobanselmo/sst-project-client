import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BulkRiskAddExecution, runBulkRiskAdd } from './bulk-risk-add.runner';

it('continues other pairs after failure and retries only unfinished steps', async () => {
  const calls: string[] = [];
  let fail = true;
  const entries: BulkRiskAddExecution[] = [
    { task: { id: 'a', riskId: 'r1', label: 'a', level: 4, alreadyInInventory: false, sources: 1, recommendations: 1, hasAnalysis: true, steps: [
      async () => { calls.push('assign'); }, async () => { calls.push('apply'); },
      async () => { calls.push('accept'); if (fail) throw Error('synthetic'); },
    ] }, nextStep: 0, done: false },
    { task: { id: 'b', riskId: 'r2', label: 'b', level: 2, alreadyInInventory: false, sources: 0, recommendations: 0, hasAnalysis: false, steps: [async () => { calls.push('other'); }] }, nextStep: 0, done: false },
  ];
  await runBulkRiskAdd(entries, () => {});
  assert.equal(entries[0].nextStep, 2);
  assert.equal(entries[0].done, false);
  assert.equal(entries[1].done, true);
  fail = false;
  await runBulkRiskAdd(entries, () => {});
  assert.deepEqual(calls, ['assign', 'apply', 'accept', 'other', 'accept']);
  assert.equal(entries[0].done, true);
  await runBulkRiskAdd(entries, () => {});
  assert.equal(calls.length, 5);
});

it('identifies the failed stage and shows a validation reason without exposing server errors', async () => {
  const task = { id: 'a', riskId: 'r', label: 'a', level: 5, alreadyInInventory: false, sources: 0, recommendations: 0, hasAnalysis: false,
    stepLabels: ['Adicionar o risco ao inventário'], steps: [async () => { throw { response: { status: 400, data: { message: 'Informe o estabelecimento.' } } }; }] };
  const entries: BulkRiskAddExecution[] = [{ task, nextStep: 0, done: false }];
  await runBulkRiskAdd(entries, () => {});
  assert.equal(entries[0].error, 'Adicionar o risco ao inventário: Informe o estabelecimento.');
  task.steps[0] = async () => { throw { response: { status: 500, data: { message: 'private internal details' } } }; };
  await runBulkRiskAdd(entries, () => {});
  assert.ok(!entries[0].error?.includes('private internal'));
});
