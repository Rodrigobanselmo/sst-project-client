import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  canRequestAfterSessionEnd,
  isPublicAuthRequest,
  purgeSessionDrafts,
} from './auth-session-policy.ts';

const baseURL = 'https://api.qa.example.invalid';
const publicRoutes = [
  ['POST', '/session'],
  ['POST', '/session/google'],
  ['POST', '/users'],
  ['POST', '/v2/sessions/signin'],
  ['POST', '/forgot-password'],
  ['PATCH', '/users/reset-password'],
  ['GET', '/v2/public/login-stats'],
  ['GET', '/v2/forms/applications/application_123-ABC/public'],
  ['POST', '/v2/forms/applications/application_123-ABC/public'],
  ['POST', '/v2/forms/applications/application_123-ABC/public/login'],
  ['GET', '/employee-history/exam/schedule/clinic/time'],
] as const;

for (const [method, url] of publicRoutes) {
  test(`the exact public ${method} ${url} remains usable after browser logout`, () => {
    assert.equal(isPublicAuthRequest(method, url), true);
    assert.equal(
      canRequestAfterSessionEnd({ isBrowser: true, ended: true, method, url }),
      true,
    );
  });
}

test('Axios lowercase verbs, bare relative routes and ordinary query strings preserve the exact public operation', () => {
  assert.equal(isPublicAuthRequest('post', 'session'), true);
  assert.equal(
    isPublicAuthRequest('patch', 'users/reset-password?mode=reset'),
    true,
  );
  assert.equal(
    isPublicAuthRequest(undefined, '/v2/public/login-stats?cache=0'),
    true,
  );
  assert.equal(
    isPublicAuthRequest(
      'GET',
      '/v2/forms/applications/public-form-123/public?encrypt=opaque',
    ),
    true,
  );
});

test('a same-origin absolute API URL requires an explicit matching base URL', () => {
  assert.equal(
    isPublicAuthRequest('POST', baseURL + '/session', baseURL),
    true,
  );
  assert.equal(isPublicAuthRequest('POST', baseURL + '/session'), false);
  assert.equal(
    isPublicAuthRequest(
      'POST',
      'https://elsewhere.example.invalid/session',
      baseURL,
    ),
    false,
  );
  assert.equal(
    isPublicAuthRequest(
      'POST',
      'http://api.qa.example.invalid/session',
      baseURL,
    ),
    false,
  );
  assert.equal(
    isPublicAuthRequest(
      'POST',
      'https://api.qa.example.invalid:444/session',
      baseURL,
    ),
    false,
  );
});

test('private calls without an Authorization header are refused after logout', () => {
  for (const url of [
    '/notification',
    '/users/me',
    '/company',
    '/company/by-user',
    '/risk-data',
    '/v2/companies/company-a/visual-identity',
    '/v2/companies/company-a/workspaces/all',
    '/risk-group-data/company-a',
  ]) {
    assert.equal(isPublicAuthRequest('GET', url), false, url);
    assert.equal(
      canRequestAfterSessionEnd({
        isBrowser: true,
        ended: true,
        method: 'GET',
        url,
      }),
      false,
      url,
    );
  }
});

test('refresh, clinical editor, documents, health and legacy public-looking test routes do not become logout exceptions', () => {
  for (const [method, url] of [
    ['POST', '/refresh'],
    ['GET', '/refresh'],
    ['GET', '/v2/companies/company-a/forms/applications/application-a'],
    ['GET', '/companies/company-a/sst-operational/health'],
    ['GET', '/master/sst-operational/health'],
    ['GET', '/health'],
    ['GET', '/files/company/employees/download'],
    ['GET', '/employee-history/exam/record/download/company-a'],
    ['POST', '/esocial/events/all/send-batch'],
    ['POST', '/company/test-route-123'],
  ]) {
    assert.equal(isPublicAuthRequest(method, url), false, `${method} ${url}`);
  }
});

test('method changes cannot reuse a public path to authorize a private operation', () => {
  for (const [method, url] of [
    ['GET', '/session'],
    ['DELETE', '/users'],
    ['PATCH', '/users'],
    ['POST', '/users/reset-password'],
    ['PATCH', '/forgot-password'],
    ['POST', '/v2/public/login-stats'],
    ['GET', '/v2/forms/applications/application-a/public/login'],
    ['DELETE', '/v2/forms/applications/application-a/public'],
    ['PUT', '/employee-history/exam/schedule/clinic/time'],
  ]) {
    assert.equal(isPublicAuthRequest(method, url), false, `${method} ${url}`);
  }
});

test('prefixes, suffixes and empty form IDs cannot impersonate an exact public route', () => {
  for (const url of [
    '/session-admin',
    '/session/google/extra',
    '/v2/sessions/signin-evil',
    '/v2/public/login-stats/private',
    '/v2/forms/applications//public',
    '/v2/forms/applications/application-a/public/private',
    '/v2/forms/applications/application-a/public/login/confirm',
    '/private/session',
    '/private/v2/public/login-stats',
    '/employee-history/exam/schedule/clinic/time/extra',
    '/employee-history/exam/schedule/clinic/times',
  ]) {
    for (const method of ['GET', 'POST'])
      assert.equal(isPublicAuthRequest(method, url), false, `${method} ${url}`);
  }
});

test('backslashes and encoded path separators are rejected instead of normalized into public routes', () => {
  for (const url of [
    '\\session',
    '/session\\google',
    '/v2/forms/applications/a%2Fb/public',
    '/v2/forms/applications/a%2fb/public/login',
    '/v2/forms/applications/a%5Cb/public',
    '/v2/forms/applications/a%5cb/public/login',
  ]) {
    for (const method of ['GET', 'POST'])
      assert.equal(
        isPublicAuthRequest(method, url, baseURL),
        false,
        `${method} ${url}`,
      );
  }
});

test('unknown or malformed URLs do not allow browser requests once the session ended', () => {
  for (const url of [
    undefined,
    '',
    'https://',
    'javascript:/session',
    'data:/session',
  ]) {
    assert.equal(isPublicAuthRequest('POST', url, baseURL), false);
    assert.equal(
      canRequestAfterSessionEnd({
        isBrowser: true,
        ended: true,
        method: 'POST',
        url,
        baseURL,
      }),
      false,
    );
  }
});

test('a query string naming a public route cannot disguise a private endpoint', () => {
  assert.equal(
    isPublicAuthRequest('GET', '/notification?redirect=/v2/public/login-stats'),
    false,
  );
  assert.equal(isPublicAuthRequest('POST', '/refresh?url=/session'), false);
});

test('the policy does not impose a browser lifecycle on SSR request clients', () => {
  for (const ended of [true, false])
    assert.equal(
      canRequestAfterSessionEnd({
        isBrowser: false,
        ended,
        method: 'GET',
        url: '/users/me',
      }),
      true,
    );
});

test('an active browser session still permits private requests through the existing server authorization', () => {
  assert.equal(
    canRequestAfterSessionEnd({
      isBrowser: true,
      ended: false,
      method: 'POST',
      url: '/risk-data',
    }),
    true,
  );
});

test('draft cleanup removes only SST keys and preserves unrelated browser values', () => {
  const removed: string[] = [];
  const sessionStorage = {
    'sst-edit-draft': 'draft',
    'sst-visit-review': 'review',
    'nextauth.token': 'not-a-draft',
    unrelated: 'keep',
    removeItem(key: string) {
      removed.push('session:' + key);
      delete (this as Record<string, unknown>)[key];
    },
  };
  const localStorage = {
    'sst-company-context': 'suggestion',
    theme: 'keep',
    removeItem(key: string) {
      removed.push('local:' + key);
      delete (this as Record<string, unknown>)[key];
    },
  };
  purgeSessionDrafts({ sessionStorage, localStorage });
  assert.deepEqual(removed.sort(), [
    'local:sst-company-context',
    'session:sst-edit-draft',
    'session:sst-visit-review',
  ]);
  assert.equal(sessionStorage['nextauth.token'], 'not-a-draft');
  assert.equal(sessionStorage.unrelated, 'keep');
  assert.equal(localStorage.theme, 'keep');
});

test('a SecurityError reading one storage does not abort cleanup of the other storage', () => {
  const removed: string[] = [];
  const browser = {
    get sessionStorage(): never {
      throw new DOMException('synthetic unavailable storage', 'SecurityError');
    },
    localStorage: {
      'sst-local-draft': 'draft',
      removeItem(key: string) {
        removed.push(key);
      },
    },
  };
  assert.doesNotThrow(() => purgeSessionDrafts(browser));
  assert.deepEqual(removed, ['sst-local-draft']);
});

test('a storage enumeration failure does not stop another storage from being cleaned', () => {
  const removed: string[] = [];
  const inaccessible = new Proxy(
    { removeItem() {} },
    {
      ownKeys() {
        throw new DOMException('synthetic denied enumeration', 'SecurityError');
      },
    },
  );
  assert.doesNotThrow(() =>
    purgeSessionDrafts({
      sessionStorage: inaccessible,
      localStorage: {
        'sst-recoverable-draft': 'draft',
        removeItem(key: string) {
          removed.push(key);
        },
      },
    }),
  );
  assert.deepEqual(removed, ['sst-recoverable-draft']);
});

test('failure to remove one draft does not stop the remaining keys or storage', () => {
  const attempted: string[] = [];
  assert.doesNotThrow(() =>
    purgeSessionDrafts({
      sessionStorage: {
        'sst-locked': 'locked',
        'sst-removable': 'draft',
        removeItem(key: string) {
          attempted.push('session:' + key);
          if (key === 'sst-locked')
            throw new DOMException(
              'synthetic blocked removal',
              'SecurityError',
            );
        },
      },
      localStorage: {
        'sst-other': 'draft',
        removeItem(key: string) {
          attempted.push('local:' + key);
        },
      },
    }),
  );
  assert.deepEqual(attempted, [
    'session:sst-locked',
    'session:sst-removable',
    'local:sst-other',
  ]);
});

test('missing storages and repeated cleanup remain harmless to the logout path', () => {
  assert.doesNotThrow(() => purgeSessionDrafts({}));
  const storage = {
    removeItem() {
      assert.fail('no draft keys should be removed');
    },
  };
  assert.doesNotThrow(() =>
    purgeSessionDrafts({ sessionStorage: storage, localStorage: storage }),
  );
  assert.doesNotThrow(() =>
    purgeSessionDrafts({ sessionStorage: storage, localStorage: storage }),
  );
});
