import assert from 'node:assert/strict';
import { resolveDisplayedOccupationalRisk, resolveDisplayedResidualOccupationalRisk } from 'core/utils/helpers/matriz';
import { calculateSuggestedResidualProbability, resolveResidualProbabilityAfterRecChange, decideResidualAutoApply } from './calculateSuggestedResidualProbability.util';
import { recommendationGuidance } from './recommendationGuidance.util';

for (let probability = 1; probability <= 5; probability++) {
  assert.equal(calculateSuggestedResidualProbability(probability, []), probability);
  assert.equal(calculateSuggestedResidualProbability(probability, [{ origin: 'EXISTING_CONTROL', recType: 'ENG' }]), probability);
  assert.equal(calculateSuggestedResidualProbability(probability, [{ status: 'INACTIVE', recType: 'ENG' }]), probability);
  for (let severity = 1; severity <= 5; severity++) {
    const currentRisk = resolveDisplayedOccupationalRisk({ probability, severity });
    assert.deepEqual(resolveDisplayedResidualOccupationalRisk({ currentRisk, hasRecommendations: false, probabilityAfter: 1, severity }), currentRisk);
    assert.deepEqual(resolveDisplayedResidualOccupationalRisk({ currentRisk, hasRecommendations: true, severity }), currentRisk);
  }
}
assert.equal(resolveDisplayedResidualOccupationalRisk({ currentRisk: null, hasRecommendations: false, severity: 3 }), null);
const custom = resolveDisplayedOccupationalRisk({ matrixSource:'CUSTOM', matrixVersionId:'pin', matrixEvaluatedAt:'2026-11-20', resolvedLabel:'Classe própria', resolvedColor:'#112233', resolvedLegacyBand:4 });
assert.deepEqual(resolveDisplayedResidualOccupationalRisk({ currentRisk: custom, hasRecommendations: false, probabilityAfter: 1 }), custom);
const quantitative = resolveDisplayedOccupationalRisk({ isQuantity:true, level:5 });
assert.deepEqual(resolveDisplayedResidualOccupationalRisk({ currentRisk: quantitative, hasRecommendations: false }), quantitative);
assert.equal(calculateSuggestedResidualProbability(5, [{recType:'ENG'}, {recType:'ADM'}, {recType:'EPI'}]), 3);
assert.equal(resolveResidualProbabilityAfterRecChange({realProbability:5,currentResidual:3,previousRecommendations:[{recType:'ENG'}],nextRecommendations:[]}), 5);
assert.equal(resolveResidualProbabilityAfterRecChange({realProbability:5,currentResidual:1,previousRecommendations:[{recType:'EPI'}],nextRecommendations:[{recType:'ENG'}]}), undefined);
assert.equal(decideResidualAutoApply({previous:{contextKey:'a|workspace1',signature:'rec',realProbability:5,suggested:4},contextKey:'a|workspace2',signature:'rec2',realProbability:5,currentResidual:4,suggested:3}).apply, undefined);
assert.equal(recommendationGuidance(0), null);
assert.match(recommendationGuidance(1)!, /Não é necessário/);
assert.match(recommendationGuidance(2)!, /Não é necessário/);
assert.match(recommendationGuidance(3)!, /Não é obrigatório/);
assert.match(recommendationGuidance(4)!, /exige recomendação/);
assert.match(recommendationGuidance(5)!, /exige recomendação/);
assert.match(recommendationGuidance(6)!, /Interrompa/);
console.log('residual baseline: all 25 cells, custom/quantitative, controls, workspace isolation and guidance passed');
