import assert from 'node:assert/strict';

import { IRiskData } from 'core/interfaces/api/IRiskData';
import { StatusEnum } from 'project/enum/status.enum';

import {
  getCharacterizationPlanItemTintSx,
  getRecommendationPlanStatus,
  getRecommendationPlanTooltipStatus,
  isRecommendationDeletionAllowed,
  recommendationHasDerivedMeasureLink,
} from './characterization-action-plan-visual';

const REC = 'rec-aep';
const MOEVE = 'moeve';
const REFINARIA = 'refinaria';

const factor = {
  recs: [{ id: REC, recName: 'Elaborar uma Análise Ergonômica Preliminar (AEP).' }],
  dataRecs: [{ recMedId: REC, workspaceId: MOEVE, status: StatusEnum.DONE }],
  riskFactorDataRecDerivedMeasures: [
    { sourceRecMedId: REC, derivedRecMedId: 'adm-aep', workspaceId: MOEVE },
  ],
} as IRiskData;

const doneTint = getCharacterizationPlanItemTintSx(StatusEnum.DONE);

assert.equal(getRecommendationPlanStatus(factor, REC, MOEVE), StatusEnum.DONE);
assert.equal(
  getRecommendationPlanTooltipStatus(factor, REC, MOEVE),
  StatusEnum.DONE,
);
assert.deepEqual(
  getCharacterizationPlanItemTintSx(
    getRecommendationPlanTooltipStatus(factor, REC, MOEVE),
  ),
  doneTint,
);
assert.equal(recommendationHasDerivedMeasureLink(factor, REC, MOEVE), true);

assert.equal(getRecommendationPlanStatus(factor, REC, REFINARIA), undefined);
assert.equal(
  getRecommendationPlanTooltipStatus(factor, REC, REFINARIA),
  StatusEnum.PENDING,
);
assert.notDeepEqual(
  getCharacterizationPlanItemTintSx(
    getRecommendationPlanTooltipStatus(factor, REC, REFINARIA),
  ),
  doneTint,
);
assert.equal(recommendationHasDerivedMeasureLink(factor, REC, REFINARIA), false);
assert.equal(factor.recs?.length, 1);
assert.equal(factor.dataRecs?.length, 1);

const concludedInRefinaria = {
  ...factor,
  dataRecs: [
    ...(factor.dataRecs ?? []),
    { recMedId: REC, workspaceId: REFINARIA, status: StatusEnum.DONE },
  ],
  riskFactorDataRecDerivedMeasures: [
    ...(factor.riskFactorDataRecDerivedMeasures ?? []),
    { sourceRecMedId: REC, derivedRecMedId: 'adm-aep-ref', workspaceId: REFINARIA },
  ],
} as IRiskData;

assert.equal(
  getRecommendationPlanStatus(concludedInRefinaria, REC, REFINARIA),
  StatusEnum.DONE,
);
assert.equal(
  recommendationHasDerivedMeasureLink(concludedInRefinaria, REC, REFINARIA),
  true,
);
assert.equal(
  getRecommendationPlanStatus(concludedInRefinaria, REC, MOEVE),
  StatusEnum.DONE,
);

const pendingInRefinaria = {
  ...factor,
  dataRecs: [
    ...(factor.dataRecs ?? []),
    { recMedId: REC, workspaceId: REFINARIA, status: StatusEnum.PENDING },
  ],
} as IRiskData;

assert.equal(
  getRecommendationPlanTooltipStatus(pendingInRefinaria, REC, REFINARIA),
  StatusEnum.PENDING,
);
assert.equal(isRecommendationDeletionAllowed(factor, REC, REFINARIA), false);

console.log('characterization-action-plan-visual.spec: ok');
