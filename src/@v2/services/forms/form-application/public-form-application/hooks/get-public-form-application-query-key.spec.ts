/**
 * Executar: npx tsx src/@v2/services/forms/form-application/public-form-application/hooks/get-public-form-application-query-key.spec.ts
 */
import assert from 'node:assert/strict';

import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';

import { getPublicFormApplicationQueryKey } from './get-public-form-application-query-key';

const keyA = getPublicFormApplicationQueryKey('app-1', 'encrypt-a');
const keyB = getPublicFormApplicationQueryKey('app-1', 'encrypt-b');
const keyAnonymous = getPublicFormApplicationQueryKey('app-1');
const keyEmpty = getPublicFormApplicationQueryKey('app-1', '');

assert.deepEqual(keyA, [
  QueryKeyFormEnum.PUBLIC_FORM_APPLICATION,
  'app-1',
  'encrypt-a',
]);
assert.notDeepEqual(keyA, keyB);
assert.deepEqual(keyAnonymous[2], 'anonymous');
assert.deepEqual(keyEmpty[2], 'anonymous');
assert.notDeepEqual(keyA, keyAnonymous);

console.log('get-public-form-application-query-key.spec.ts OK');
