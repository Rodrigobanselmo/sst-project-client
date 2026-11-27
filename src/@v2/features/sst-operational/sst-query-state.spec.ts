import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  hasSstQueryError,
  sstRefetchInterval,
  sstScopeAccessMessage,
} from './sst-query-state.ts';

test('automatic refresh stops on failure and resumes after a successful manual retry', () => {
  const interval = sstRefetchInterval(5000);
  assert.equal(interval(undefined, { state: { error: null } }), 5000);
  assert.equal(
    interval(undefined, { state: { error: new Error('denied') } }),
    false,
  );
  assert.equal(interval({ loaded: true }, { state: { error: null } }), 5000);
});

test('last error remains visible while React Query clears it during a retry', () => {
  assert.equal(
    hasSstQueryError({
      isError: false,
      isFetching: true,
      errorUpdatedAt: 20,
      dataUpdatedAt: 0,
    }),
    true,
  );
  assert.equal(
    hasSstQueryError({
      isError: false,
      isFetching: false,
      errorUpdatedAt: 20,
      dataUpdatedAt: 30,
    }),
    false,
  );
  assert.equal(
    hasSstQueryError({
      isError: false,
      isFetching: true,
      errorUpdatedAt: 0,
      dataUpdatedAt: 0,
    }),
    false,
  );
});

test('scope denial is explicit without widening permissions or masking other errors', () => {
  assert.match(
    sstScopeAccessMessage({
      response: {
        status: 403,
        data: {
          message: 'Sem contrato direto ativo com a empresa solicitada.',
        },
      },
    }) || '',
    /contrato direto ativo/,
  );
  assert.equal(
    sstScopeAccessMessage({
      response: {
        status: 403,
        data: { message: 'Sem permissão atual para esta operação.' },
      },
    }),
    null,
  );
  assert.equal(
    sstScopeAccessMessage({
      response: {
        status: 500,
        data: {
          message: 'Sem contrato direto ativo com a empresa solicitada.',
        },
      },
    }),
    null,
  );
  assert.equal(sstScopeAccessMessage(null), null);
});
