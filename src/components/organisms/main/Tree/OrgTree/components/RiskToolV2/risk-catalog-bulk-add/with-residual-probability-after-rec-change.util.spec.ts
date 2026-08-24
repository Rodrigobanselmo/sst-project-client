/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-bulk-add/with-residual-probability-after-rec-change.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RecTypeEnum } from 'project/enum/recType.enum';

import { resolveResidualProbabilityAfterRecChange } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';

import {
  applyRecBulkResidual,
  buildRecsAttachPayload,
  resolveRecsSelectedForAdd,
  withResidualProbabilityAfterRecChange,
} from './with-residual-probability-after-rec-change.util';

const adm = (id: string) => ({ id, recType: RecTypeEnum.ADM });
const eng = (id: string) => ({ id, recType: RecTypeEnum.ENG });

const autoMultiple = buildRecsAttachPayload({
  recsToAdd: [adm('a'), adm('b')],
  currentRecs: [],
  realProbability: 3,
  currentResidual: undefined,
});
assert.deepEqual(autoMultiple.recs, ['a', 'b']);
assert.equal(
  autoMultiple.probabilityAfter,
  resolveResidualProbabilityAfterRecChange({
    realProbability: 3,
    currentResidual: undefined,
    previousRecommendations: [],
    nextRecommendations: [adm('a'), adm('b')],
  }),
);
assert.equal(autoMultiple.probabilityAfter, 2);

const singleViaMulti = buildRecsAttachPayload({
  recsToAdd: [eng('e1')],
  currentRecs: [],
  realProbability: 3,
  currentResidual: undefined,
});
const individualEquivalent = buildRecsAttachPayload({
  recsToAdd: [eng('e1')],
  currentRecs: [],
  realProbability: 3,
  currentResidual: undefined,
});
assert.deepEqual(singleViaMulti, individualEquivalent);
assert.equal(singleViaMulti.probabilityAfter, 2);

const recTypeMatters = buildRecsAttachPayload({
  recsToAdd: [adm('a1')],
  currentRecs: [],
  realProbability: 3,
  currentResidual: undefined,
});
assert.equal(recTypeMatters.probabilityAfter, 3);
assert.notEqual(recTypeMatters.probabilityAfter, singleViaMulti.probabilityAfter);

const manualPreserved = buildRecsAttachPayload({
  recsToAdd: [adm('a'), adm('b')],
  currentRecs: [],
  realProbability: 3,
  currentResidual: 5,
});
assert.deepEqual(manualPreserved.recs, ['a', 'b']);
assert.equal('probabilityAfter' in manualPreserved, false);

const omitted = withResidualProbabilityAfterRecChange(
  { recs: ['x'] },
  {
    realProbability: 3,
    currentResidual: 5,
    previousRecommendations: [],
    nextRecommendations: [adm('x')],
  },
);
assert.equal('probabilityAfter' in omitted, false);
assert.deepEqual(omitted.recs, ['x']);

const selected = resolveRecsSelectedForAdd(
  [adm('n1'), adm('linked'), eng('n2')],
  ['linked'],
);
assert.deepEqual(
  selected.map((rec) => rec.id),
  ['n1', 'n2'],
);
assert.equal(selected[1]?.recType, RecTypeEnum.ENG);

const newBulk = applyRecBulkResidual({
  payload: { recAddOnly: [{ recName: 'Nova', recType: RecTypeEnum.ADM, companyId: 'c' }] },
  currentRecs: [],
  catalogMatches: [],
  namesToCreate: ['Nova'],
  recType: RecTypeEnum.ADM,
  realProbability: 3,
  currentResidual: undefined,
});
assert.equal(newBulk.probabilityAfter, 3);

const mixedBulk = applyRecBulkResidual({
  payload: {
    recs: ['cat-1'],
    recAddOnly: [{ recName: 'Nova ENG', recType: RecTypeEnum.ENG, companyId: 'c' }],
  },
  currentRecs: [],
  catalogMatches: [adm('cat-1')],
  namesToCreate: ['Nova ENG'],
  recType: RecTypeEnum.ENG,
  realProbability: 3,
  currentResidual: undefined,
});
assert.equal(
  mixedBulk.probabilityAfter,
  resolveResidualProbabilityAfterRecChange({
    realProbability: 3,
    currentResidual: undefined,
    previousRecommendations: [],
    nextRecommendations: [adm('cat-1'), { recName: 'Nova ENG', recType: RecTypeEnum.ENG }],
  }),
);
assert.equal(mixedBulk.probabilityAfter, 2);

const mixedManual = applyRecBulkResidual({
  payload: { recs: ['cat-1'] },
  currentRecs: [],
  catalogMatches: [adm('cat-1')],
  namesToCreate: ['Nova'],
  recType: RecTypeEnum.ADM,
  realProbability: 3,
  currentResidual: 4,
});
assert.equal('probabilityAfter' in mixedManual, false);

const recColumn = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/columns/RecColumn/index.tsx',
  ),
  'utf8',
);
assert.equal(recColumn.includes('buildRecsAttachPayload'), true);
assert.equal(recColumn.includes('resolveMultipleAsItems'), true);
assert.equal(recColumn.includes('buildAddPayload'), true);
assert.equal(recColumn.includes('handleSelect({ recs: ids })'), false);

const recSelect = readFileSync(
  resolve('src/components/organisms/tagSelects/RecSelect/index.tsx'),
  'utf8',
);
assert.equal(recSelect.includes('resolveMultipleAsItems = false'), true);
assert.equal(recSelect.includes('probabilityAfter'), false);

const recColumnV1 = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskTool/components/SideRowTable/components/columns/RecColumn/index.tsx',
  ),
  'utf8',
);
assert.equal(recColumnV1.includes('resolveMultipleAsItems'), false);

const checklistNode = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/ChecklistTree/components/RenderCard/components/NodeCard/index.tsx',
  ),
  'utf8',
);
const checklistModal = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/ChecklistTree/components/ModalEditCard/index.tsx',
  ),
  'utf8',
);
assert.equal(checklistNode.includes('resolveMultipleAsItems'), false);
assert.equal(checklistModal.includes('resolveMultipleAsItems'), false);

const bulkHook = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-bulk-add/useRiskCatalogBulkAdd.ts',
  ),
  'utf8',
);
assert.equal(bulkHook.includes('applyRecBulkResidual'), true);
assert.equal(bulkHook.includes("kind === 'rec'"), true);

console.log('with-residual-probability-after-rec-change.util.spec.ts ok');
