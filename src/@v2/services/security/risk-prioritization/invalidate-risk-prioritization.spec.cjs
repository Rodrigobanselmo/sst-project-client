const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
const { QueryClient, QueryObserver } = require('@tanstack/react-query');

// Run the helper with a real V2 cache without loading browser API modules.
const source = readFileSync(join(__dirname, 'invalidate-risk-prioritization.ts'), 'utf8');
const hook = readFileSync(join(__dirname, 'useFetchBrowseRiskPrioritization.ts'), 'utf8');
const key = hook.match(/RISK_PRIORITIZATION_QUERY_KEY = '([^']+)'/)[1];
const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
const moduleExports = {};
runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  exports: moduleExports,
  require: (id) => {
    if (id === '@v2/services/query-client') return { v2QueryClient: client };
    if (id === './useFetchBrowseRiskPrioritization') return { RISK_PRIORITIZATION_QUERY_KEY: key };
    throw new Error(`Unexpected dependency: ${id}`);
  },
});

(async () => {
  const active = [key, 'company', 'ws1'];
  const inactive = [key, 'company', 'ws2'];
  const foreign = [key, 'other-company', 'ws1'];
  const unrelated = ['OTHER_QUERY', 'company'];
  for (const queryKey of [active, inactive, foreign, unrelated]) client.setQueryData(queryKey, 'old');
  let fetches = 0;
  const observer = new QueryObserver(client, { queryKey: active, queryFn: async () => { fetches++; return 'new'; } });
  const unsubscribe = observer.subscribe(() => {});
  await moduleExports.invalidateRiskPrioritization('company');
  assert.equal(fetches, 1);
  assert.equal(client.getQueryData(active), 'new');
  assert.equal(client.getQueryState(inactive).isInvalidated, true);
  assert.equal(client.getQueryState(foreign).isInvalidated, false);
  assert.equal(client.getQueryState(unrelated).isInvalidated, false);
  for (const name of ['useMutUpsertRiskData', 'useMutUpsertManyRiskData', 'useMutApplyCurrentRiskMatrix', 'useMutDeleteManyRiskData']) {
    const mutation = readFileSync(join(__dirname, '../../../../core/services/hooks/mutations/checklist/riskData', name, 'index.ts'), 'utf8');
    assert.ok(mutation.indexOf('invalidateRiskPrioritization(companyId)') > mutation.indexOf('onSuccess:'), name);
  }
  unsubscribe();
  console.log('PASS: active refetch, inactive invalidation, company isolation, unrelated cache and four mutation integrations');
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => client.clear());
