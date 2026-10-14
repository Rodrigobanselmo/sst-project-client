import assert from 'node:assert/strict';

import { ViewsDataEnum } from '../utils/view-data-type.constant';
import { resolveSuggestCatalogRisksContext } from './resolve-suggest-catalog-risks-context.util';

const gse = resolveSuggestCatalogRisksContext({
  viewDataType: ViewsDataEnum.GSE,
  companyId: 'c1',
  riskGroupId: 'rg1',
  selectedEntityId: 'gse-1',
  tabWorkspaceId: 'ws-1',
});
assert.deepEqual(gse, {
  kind: 'gse',
  companyId: 'c1',
  workspaceId: 'ws-1',
  entityId: 'gse-1',
  riskGroupId: 'rg1',
});

const element = resolveSuggestCatalogRisksContext({
  viewDataType: ViewsDataEnum.CHARACTERIZATION,
  companyId: 'c1',
  riskGroupId: 'rg1',
  selectedEntityId: 'el-1//ws-2',
  routeWorkspaceId: undefined,
  tabWorkspaceId: undefined,
});
assert.deepEqual(element, {
  kind: 'characterization',
  companyId: 'c1',
  workspaceId: 'ws-2',
  entityId: 'el-1',
  riskGroupId: 'rg1',
});

assert.equal(
  resolveSuggestCatalogRisksContext({
    viewDataType: ViewsDataEnum.HIERARCHY,
    companyId: 'c1',
    riskGroupId: 'rg1',
    selectedEntityId: 'h-1',
    tabWorkspaceId: 'ws-1',
  }),
  null,
);

assert.equal(
  resolveSuggestCatalogRisksContext({
    viewDataType: ViewsDataEnum.GSE,
    companyId: 'c1',
    riskGroupId: 'rg1',
    selectedEntityId: 'gse-1',
  }),
  null,
);

console.log('resolve-suggest-catalog-risks-context.util.spec.ts OK');
