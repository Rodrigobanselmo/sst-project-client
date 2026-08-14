/**
 * Contrato visual + payload de classificação rápida no RecSelect.
 * Executar:
 * npx tsx src/components/organisms/tagSelects/RecSelect/resolve-rec-type-visual-state.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RecTypeEnum } from 'project/enum/recType.enum';

import { MISSING_REC_TYPE_TOOLTIP } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/isRecommendationRecTypeMissing.util';

import {
  buildRecMedQuickClassifyPayload,
  resolveRecTypeVisualState,
  shouldSelectRecOnListClick,
  stopRecSelectAdornmentEvent,
} from './resolve-rec-type-visual-state.util';

assert.equal(resolveRecTypeVisualState(null).kind, 'missing');
assert.equal(resolveRecTypeVisualState(undefined).kind, 'missing');
assert.equal(resolveRecTypeVisualState('').kind, 'missing');
assert.equal(resolveRecTypeVisualState('  ').kind, 'missing');
assert.equal(resolveRecTypeVisualState('OTHER').kind, 'missing');
assert.equal(resolveRecTypeVisualState(null).tooltip, MISSING_REC_TYPE_TOOLTIP);

const adm = resolveRecTypeVisualState(RecTypeEnum.ADM);
assert.equal(adm.kind, 'classified');
if (adm.kind === 'classified') {
  assert.equal(adm.recType, RecTypeEnum.ADM);
  assert.equal(adm.label, 'Administrativa');
}

const eng = resolveRecTypeVisualState('ENG');
assert.equal(eng.kind, 'classified');
if (eng.kind === 'classified') {
  assert.equal(eng.recType, RecTypeEnum.ENG);
  assert.equal(eng.label, 'Engenharia');
}

const epi = resolveRecTypeVisualState(RecTypeEnum.EPI);
assert.equal(epi.kind, 'classified');
if (epi.kind === 'classified') {
  assert.equal(epi.recType, RecTypeEnum.EPI);
  assert.equal(epi.label, 'EPI');
}

let selectCalls = 0;
const onSelect = () => {
  selectCalls += 1;
};
if (shouldSelectRecOnListClick('adornment')) onSelect();
assert.equal(selectCalls, 0);
if (shouldSelectRecOnListClick('item')) onSelect();
assert.equal(selectCalls, 1);

let stopped = false;
let prevented = false;
stopRecSelectAdornmentEvent({
  stopPropagation: () => {
    stopped = true;
  },
  preventDefault: () => {
    prevented = true;
  },
});
assert.equal(stopped, true);
assert.equal(prevented, true);

const payload = buildRecMedQuickClassifyPayload({
  rec: { id: 'rec-1', riskId: 'risk-1', companyId: 'co-1' },
  recType: RecTypeEnum.ENG,
});
assert.deepEqual(payload, {
  id: 'rec-1',
  riskId: 'risk-1',
  recType: RecTypeEnum.ENG,
  companyId: 'co-1',
});
assert.equal('probabilityAfter' in (payload as object), false);

const payloadFallbackRisk = buildRecMedQuickClassifyPayload({
  rec: { id: 'rec-2' },
  recType: RecTypeEnum.ADM,
  fallbackRiskId: 'risk-fallback',
});
assert.equal(payloadFallbackRisk?.riskId, 'risk-fallback');
assert.equal(payloadFallbackRisk?.companyId, undefined);

assert.equal(
  buildRecMedQuickClassifyPayload({
    rec: { id: '' },
    recType: RecTypeEnum.EPI,
    fallbackRiskId: 'risk-1',
  }),
  null,
);
assert.equal(
  buildRecMedQuickClassifyPayload({
    rec: { id: 'rec-3' },
    recType: RecTypeEnum.EPI,
  }),
  null,
);

const recSelectSource = readFileSync(
  resolve('src/components/organisms/tagSelects/RecSelect/index.tsx'),
  'utf8',
);
assert.equal(
  recSelectSource.includes('enableRecTypeQuickClassify = false'),
  true,
);
assert.equal(recSelectSource.includes('SMeasureControlIcon'), true);
assert.equal(recSelectSource.includes('RecSelectRecTypeAdornment'), true);
assert.equal(recSelectSource.includes('mutateAsync(payload)'), true);
assert.equal(recSelectSource.includes('probabilityAfter'), false);

const adornmentSource = readFileSync(
  resolve(
    'src/components/organisms/tagSelects/RecSelect/RecSelectRecTypeAdornment.tsx',
  ),
  'utf8',
);
assert.equal(adornmentSource.includes('stopRecSelectAdornmentEvent'), true);
assert.equal(adornmentSource.includes('MissingRecTypeClassifyPopover'), true);

const popoverSource = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskTool/components/MissingRecTypeClassifyPopover/index.tsx',
  ),
  'utf8',
);
assert.equal(popoverSource.includes('trigger ??'), true);
assert.equal(popoverSource.includes('event.stopPropagation()'), true);

const recColumnV1 = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskTool/components/SideRowTable/components/columns/RecColumn/index.tsx',
  ),
  'utf8',
);
assert.equal(recColumnV1.includes('enableRecTypeQuickClassify'), true);

const recColumnV2 = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/columns/RecColumn/index.tsx',
  ),
  'utf8',
);
assert.equal(recColumnV2.includes('enableRecTypeQuickClassify'), true);

const checklistNode = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/ChecklistTree/components/RenderCard/components/NodeCard/index.tsx',
  ),
  'utf8',
);
assert.equal(checklistNode.includes('enableRecTypeQuickClassify'), false);

const checklistModal = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/ChecklistTree/components/ModalEditCard/index.tsx',
  ),
  'utf8',
);
assert.equal(checklistModal.includes('enableRecTypeQuickClassify'), false);

console.log('resolve-rec-type-visual-state.util.spec.ts ok');
