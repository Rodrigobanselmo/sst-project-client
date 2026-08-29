/**
 * npx tsx src/core/utils/company/resolve-visual-identity-context.spec.ts
 */
import assert from 'node:assert/strict';

import {
  canApplyVisualIdentity,
  peekLastKnownVisualIdentityCompanyId,
  rememberVisualIdentityCompanyId,
  resetVisualIdentityCompanyIdMemory,
  resolveVisualIdentityFetchCompanyId,
} from './resolve-visual-identity-context';

const SIMPLESST = 'company-simplesst';
const ALTUS = 'company-altus';
const CONSULTORIA_X = 'company-consultoria-x';
const CLIENT = 'company-client';

assert.equal(
  resolveVisualIdentityFetchCompanyId({
    isRouterReady: true,
    sessionCompanyId: ALTUS,
    selectedCompanyId: ALTUS,
  }),
  ALTUS,
  'rota pronta: empresa operacional da rota',
);

assert.equal(
  resolveVisualIdentityFetchCompanyId({
    isRouterReady: true,
    sessionCompanyId: SIMPLESST,
    selectedCompanyId: undefined,
  }),
  SIMPLESST,
  'rota pronta sem companyId: sessão',
);

assert.equal(
  resolveVisualIdentityFetchCompanyId({
    isRouterReady: true,
    sessionCompanyId: CLIENT,
    selectedCompanyId: ALTUS,
  }),
  ALTUS,
  'rota operacional prevalece sobre a sessão',
);

assert.equal(
  resolveVisualIdentityFetchCompanyId({
    isRouterReady: false,
    sessionCompanyId: CLIENT,
    selectedCompanyId: undefined,
    lastKnownCompanyId: ALTUS,
  }),
  ALTUS,
  'router ainda não pronto: mantém último ID, não a sessão',
);

assert.equal(
  resolveVisualIdentityFetchCompanyId({
    isRouterReady: true,
    sessionCompanyId: CLIENT,
    selectedCompanyId: undefined,
    lastKnownCompanyId: ALTUS,
  }),
  ALTUS,
  'query vazia com isReady true (flicker): mantém último ID',
);

assert.equal(
  resolveVisualIdentityFetchCompanyId({
    isRouterReady: true,
    sessionCompanyId: SIMPLESST,
    selectedCompanyId: CLIENT,
    lastKnownCompanyId: SIMPLESST,
  }),
  CLIENT,
  'master/admin em cliente: rota nova substitui o último ID',
);

assert.equal(
  resolveVisualIdentityFetchCompanyId({
    isRouterReady: false,
    sessionCompanyId: CLIENT,
    selectedCompanyId: undefined,
    lastKnownCompanyId: undefined,
  }),
  CLIENT,
  'primeiro paint sem lastKnown: sessão',
);

assert.equal(
  resolveVisualIdentityFetchCompanyId({
    isRouterReady: true,
    sessionCompanyId: CLIENT,
    selectedCompanyId: '',
    lastKnownCompanyId: CONSULTORIA_X,
  }),
  CONSULTORIA_X,
  'string vazia na rota não é ID operacional',
);

assert.equal(
  canApplyVisualIdentity({
    visualIdentity: { companyId: CLIENT, visualIdentityEnabled: true },
  }),
  true,
);

assert.equal(
  canApplyVisualIdentity({
    visualIdentity: { companyId: SIMPLESST, visualIdentityEnabled: true },
  }),
  true,
  'aplica identidade da âncora mesmo se companyId ≠ operacional',
);

assert.equal(
  canApplyVisualIdentity({
    visualIdentity: { companyId: CONSULTORIA_X, visualIdentityEnabled: true },
  }),
  true,
  'aplica identidade da consultoria resolvida pela API',
);

assert.equal(
  canApplyVisualIdentity({
    visualIdentity: { companyId: CLIENT, visualIdentityEnabled: false },
  }),
  false,
);

assert.equal(
  canApplyVisualIdentity({
    visualIdentity: null,
  }),
  false,
  'sem identidade da API → neutro',
);

resetVisualIdentityCompanyIdMemory();
rememberVisualIdentityCompanyId(CLIENT);
assert.equal(peekLastKnownVisualIdentityCompanyId(), CLIENT);
resetVisualIdentityCompanyIdMemory();
assert.equal(peekLastKnownVisualIdentityCompanyId(), '');

console.log('resolve-visual-identity-context.spec.ts OK');
