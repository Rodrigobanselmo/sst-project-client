/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/core/utils/save-action-color.spec.ts
 */
import assert from 'assert';

import { getSaveActionColor, getSaveActionV2Color } from './save-action-color';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

run('pristine uses primary', () => {
  assert.strictEqual(getSaveActionColor(false), 'primary');
});

run('dirty uses error', () => {
  assert.strictEqual(getSaveActionColor(true), 'error');
});

run('never returns success', () => {
  assert.notStrictEqual(getSaveActionColor(false), 'success');
  assert.notStrictEqual(getSaveActionColor(true), 'success');
});

run('v2 dirty uses danger (error palette)', () => {
  assert.strictEqual(getSaveActionV2Color(false), 'primary');
  assert.strictEqual(getSaveActionV2Color(true), 'danger');
});

console.log('\nAll save-action-color tests passed.');
