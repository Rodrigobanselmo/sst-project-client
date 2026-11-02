import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canChooseEsocialEnvironment,
  esocialEnvironment,
  canOperateEsocialEnvironment,
} from './environment-model.ts';
test('only the master role exposes the environment choice', () => {
  for (const roles of [[], ['0'], ['16'], ['19'], ['masterish'], ['14-u']])
    assert.equal(canChooseEsocialEnvironment(roles), false);
  assert.equal(canChooseEsocialEnvironment(), false);
  assert.equal(canChooseEsocialEnvironment(['master']), true);
  assert.equal(canChooseEsocialEnvironment(['master-crud']), true);
});
test('customer sessions always prepare production even with a stale test selection', () => {
  assert.equal(esocialEnvironment(false, 2), 1);
  assert.equal(esocialEnvironment(false, 1), 1);
  assert.equal(esocialEnvironment(true, 2), 2);
  assert.equal(esocialEnvironment(true, 1), 1);
});
test('historical test artifacts cannot expose transmit or resume actions to a customer', () => {
  assert.equal(canOperateEsocialEnvironment(false, 2), false);
  assert.equal(canOperateEsocialEnvironment(false, 1), true);
  assert.equal(canOperateEsocialEnvironment(true, 2), true);
  assert.equal(canOperateEsocialEnvironment(true, 1), true);
  assert.equal(canOperateEsocialEnvironment(true, 3), false);
});
