'use strict';
const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  ts = require('typescript');
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  );
const root = path.resolve(__dirname, '../..'),
  base =
    root +
    '/src/components/organisms/modals/company/IllustrationAdministration/';
const {
  createIllustrationAdministrationApi,
  settingsInput,
  settingsValidation,
  administrationError,
  periodLabels,
  adminQueryKey,
} = require(base + 'illustration-administration.api');
const { createIllustrationApi, capabilityMessage } = require(
  root +
    '/src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/illustrations.api',
);
const settings = {
  enabled: false,
  generationLimit: 20,
  generationPeriod: 'DAY',
  budgetUsd: '5.000000',
  budgetPeriod: 'MONTH',
  version: 3,
  configured: true,
};
test('settings save uses actual endpoint, independent periods, explicit enabled and expectedVersion only', async () => {
  const calls = [],
    http = {
      put: async (...args) => {
        calls.push(args);
        return { data: { ...settings, version: 4 } };
      },
      get: async () => ({ data: settings }),
    };
  const api = createIllustrationAdministrationApi(http),
    result = await api.save('company/a', settingsInput(settings));
  assert.equal(
    calls[0][0],
    '/v2/companies/company%2Fa/illustration-administration/settings',
  );
  assert.deepEqual(calls[0][1], {
    enabled: false,
    generationLimit: 20,
    generationPeriod: 'DAY',
    budgetUsd: '5.000000',
    budgetPeriod: 'MONTH',
    expectedVersion: 3,
  });
  assert.equal(result.version, 4);
  assert.equal(settings.version, 3);
  assert.equal('configured' in calls[0][1], false);
});
test('all administrative GET contracts and pagination/filter names are preserved', async () => {
  const calls = [],
    api = createIllustrationAdministrationApi({
      get: async (...args) => {
        calls.push(args);
        return { data: {} };
      },
      put: async () => {
        throw Error('unexpected write');
      },
    });
  const filter = {
    skip: 20,
    take: 10,
    from: '2026-10-01T00:00:00Z',
    to: '2026-11-01T00:00:00Z',
    status: 'UNKNOWN',
    requestedById: 8,
    workspaceId: 'w',
  };
  await api.settings('c');
  await api.usage('c');
  await api.history('c', filter);
  await api.audit('c', { skip: 10, take: 10 });
  assert.deepEqual(
    calls.map((c) => c[0].split('/').pop()),
    ['settings', 'usage', 'generations', 'settings-audit'],
  );
  assert.deepEqual(calls[2][1], { params: filter });
  assert.deepEqual(calls[3][1], { params: { skip: 10, take: 10 } });
});
test('409 is surfaced without retry or draft mutation; permission/financial errors retain server detail', async () => {
  let calls = 0;
  const api = createIllustrationAdministrationApi({
    put: async () => {
      calls++;
      throw {
        response: {
          status: 409,
          data: {
            message: 'Configuração alterada; recarregue antes de salvar',
          },
        },
      };
    },
  });
  await assert.rejects(
    api.save('c', settingsInput(settings)),
    (e) => e.status === 409 && e.message.includes('recarregue'),
  );
  assert.equal(calls, 1);
  assert.equal(settings.version, 3);
  assert.equal(
    administrationError({
      response: { status: 403, data: { message: 'MASTER revogado' } },
    }).message,
    'MASTER revogado',
  );
  assert.equal(
    administrationError({
      response: { status: 429, data: { message: 'Orçamento atingido' } },
    }).message,
    'Orçamento atingido',
  );
  assert.equal(
    administrationError({
      response: {
        status: 400,
        data: { message: ['Campo A inválido', 'Campo B inválido'] },
      },
    }).message,
    'Campo A inválido Campo B inválido',
  );
});
test('budget remains decimal text; invalid budgets/counts are rejected without writes', () => {
  assert.equal(settingsValidation(settings), null);
  assert.equal(
    settingsValidation({ ...settings, budgetUsd: '9999999999.123456' }),
    null,
  );
  for (const budgetUsd of ['-1', '1e2', '1.0000001', '10000000000'])
    assert.ok(settingsValidation({ ...settings, budgetUsd }));
  for (const generationLimit of [-1, NaN, 0.5, 2147483648])
    assert.ok(settingsValidation({ ...settings, generationLimit }));
  assert.equal(
    settingsValidation({ ...settings, generationLimit: 0, budgetUsd: '0' }),
    null,
  );
  assert.deepEqual(periodLabels, { DAY: 'Dia', WEEK: 'Semana', MONTH: 'Mês' });
});
test('query cache isolates company and actor; capabilities distinct from gallery and never generate', async () => {
  assert.notDeepEqual(
    adminQueryKey('a', 1, 'usage'),
    adminQueryKey('b', 1, 'usage'),
  );
  assert.notDeepEqual(
    adminQueryKey('a', 1, 'usage'),
    adminQueryKey('a', 2, 'usage'),
  );
  const calls = [],
    api = createIllustrationApi({
      get: async (url) => {
        calls.push(url);
        return {
          data: url.endsWith('capabilities')
            ? {
                canGenerate: false,
                available: true,
                reason: 'ILLUSTRATION_COMPANY_BUDGET_LIMIT',
              }
            : [],
        };
      },
    });
  const scope = {
    userId: 1,
    companyId: 'c',
    workspaceId: 'w',
    characterizationId: 'e',
  };
  const capability = await api.capabilities(scope);
  const gallery = await api.list(scope);
  assert.equal(capability.canGenerate, false);
  assert.deepEqual(gallery, []);
  assert.equal(
    calls[0],
    '/v2/companies/c/workspaces/w/characterizations/e/illustrations/capabilities',
  );
  assert.match(capabilityMessage(capability), /orçamento/);
  assert.equal(
    capabilityMessage({
      canGenerate: false,
      available: true,
      reason: 'NEW',
      message: 'Limite específico da API',
    }),
    'Limite específico da API',
  );
});

test('platform accounting uses separate server endpoints and billing cannot be selected for generation', async () => {
  const calls = [];
  const http = {
    get: async (...args) => {
      calls.push(args);
      return { data: {} };
    },
    post: async (...args) => {
      calls.push(args);
      return { data: {} };
    },
  };
  const admin = createIllustrationAdministrationApi(http);
  await admin.platformUsage('payer');
  await admin.platformHistory('payer', { skip: 0, take: 10 });
  assert.equal(
    calls[0][0],
    '/v2/companies/payer/illustration-administration/platform-master/usage',
  );
  assert.equal(
    calls[1][0],
    '/v2/companies/payer/illustration-administration/platform-master/generations',
  );
  const api = createIllustrationApi(http);
  await api.generate(
    {
      userId: 1,
      companyId: 'target',
      workspaceId: 'w',
      characterizationId: 'e',
      billingMode: 'PLATFORM_MASTER',
      billingCompanyId: 'forged',
    },
    'idempotency-key',
  );
  assert.equal(
    calls[2][0],
    '/v2/companies/target/workspaces/w/characterizations/e/illustrations/generations',
  );
  assert.equal(calls[2][1], undefined);
  assert.deepEqual(calls[2][2].headers, {
    'Idempotency-Key': 'idempotency-key',
  });
});
