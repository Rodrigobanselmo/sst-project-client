/**
 * Testes pontuais do pré-vínculo de fator na edição de produto químico.
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-product-edit-risk-link.util.spec.ts
 */
import { RiskEnum } from 'project/enum/risk.enums';

import { emptyIngredient } from './chemical-composition-draft.util';
import {
  buildEditIngredientCreateRiskPrefill,
  canKeepWithoutRiskLink,
  clearIngredientRiskLink,
  confirmPendingRiskLink,
  countPendingRiskFactors,
  pendingToRiskOption,
  removePendingRiskFactorByKey,
  setPendingRiskFactorByKey,
  toPendingRiskFactor,
} from './chemical-product-edit-risk-link.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const baseIngredient = {
  ...emptyIngredient(),
  key: 'ing-1',
  chemicalName: 'Ácido sulfâmico',
  cas: '5329-14-6',
  concentrationKind: 'EXACT' as const,
  exactPercent: 12.5,
  riskFactorId: 'risk-old',
  riskOption: {
    id: 'risk-old',
    name: 'Fator antigo',
    cas: '111-11-1',
    system: true,
    companyId: null,
    type: 'QUI',
  },
};

const pending = toPendingRiskFactor({
  id: 'risk-new',
  name: 'Fator novo',
  cas: '5329-14-6',
  system: false,
  companyId: 'company-1',
  type: 'QUI',
});

assert(pending.riskFactorId === 'risk-new', 'toPendingRiskFactor id');
assert(
  pendingToRiskOption(pending).id === 'risk-new',
  'pendingToRiskOption id',
);

const confirmed = confirmPendingRiskLink({
  ingredient: baseIngredient,
  pending,
});
assert(confirmed.riskFactorId === 'risk-new', 'confirm sets riskFactorId');
assert(confirmed.riskOption?.id === 'risk-new', 'confirm sets riskOption');
assert(
  confirmed.chemicalName === 'Ácido sulfâmico',
  'confirm keeps chemicalName',
);
assert(confirmed.cas === '5329-14-6', 'confirm keeps cas');
assert(confirmed.exactPercent === 12.5, 'confirm keeps concentration');
assert(
  confirmed.concentrationKind === 'EXACT',
  'confirm keeps concentrationKind',
);

const cleared = clearIngredientRiskLink(baseIngredient);
assert(cleared.riskFactorId === null, 'clear removes riskFactorId');
assert(cleared.riskOption === null, 'clear removes riskOption');
assert(cleared.chemicalName === baseIngredient.chemicalName, 'clear keeps name');
assert(cleared.cas === baseIngredient.cas, 'clear keeps cas');
assert(cleared.exactPercent === 12.5, 'clear keeps concentration');

assert(
  canKeepWithoutRiskLink({ ingredient: baseIngredient, pending: null }) ===
    true,
  'can keep without when linked',
);
assert(
  canKeepWithoutRiskLink({
    ingredient: clearIngredientRiskLink(baseIngredient),
    pending: null,
  }) === false,
  'cannot keep without when already empty',
);
assert(
  canKeepWithoutRiskLink({
    ingredient: clearIngredientRiskLink(baseIngredient),
    pending,
  }) === true,
  'can keep without when pending',
);

let map = setPendingRiskFactorByKey({}, 'ing-1', pending);
assert(countPendingRiskFactors(map) === 1, 'set pending count');
map = setPendingRiskFactorByKey(map, 'ing-2', pending);
assert(countPendingRiskFactors(map) === 2, 'second pending');
map = removePendingRiskFactorByKey(map, 'ing-1');
assert(!map['ing-1'], 'remove pending key');
assert(map['ing-2']?.riskFactorId === 'risk-new', 'other pending intact');

const prefill = buildEditIngredientCreateRiskPrefill({
  companyId: 'company-1',
  chemicalName: ' Ácido sulfâmico ',
  cas: '5329-14-6',
});
assert(prefill.companyId === 'company-1', 'prefill company');
assert(prefill.type === RiskEnum.QUI, 'prefill QUI');
assert(prefill.name === 'Ácido sulfâmico', 'prefill trims name');
assert(prefill.cas === '5329-14-6', 'prefill valid cas');
assert(prefill.synonymous.length === 0, 'prefill no synonyms');

const invalidCasPrefill = buildEditIngredientCreateRiskPrefill({
  companyId: 'company-1',
  chemicalName: 'X',
  cas: '123',
});
assert(invalidCasPrefill.cas === undefined, 'invalid cas omitted');

console.log('chemical-product-edit-risk-link.util.spec.ts: OK');
