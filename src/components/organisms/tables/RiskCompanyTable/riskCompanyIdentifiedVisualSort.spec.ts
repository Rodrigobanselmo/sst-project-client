/**
 * Executar: npx tsx --tsconfig tsconfig.json src/components/organisms/tables/RiskCompanyTable/riskCompanyIdentifiedVisualSort.spec.ts
 */
import assert from 'node:assert/strict';

import { RiskEnum } from 'project/enum/risk.enums';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { sortRisksIdentifiedForVisualDisplay } from './riskCompanyIdentifiedVisualSort';

function risk(
  partial: Pick<IRiskFactors, 'id' | 'name' | 'type'> & {
    subtypeName?: string;
  },
): IRiskFactors {
  return {
    id: partial.id,
    name: partial.name,
    type: partial.type,
    subTypes: partial.subtypeName
      ? [{ sub_type: { name: partial.subtypeName } as any }]
      : [],
  } as IRiskFactors;
}

const sorted = sortRisksIdentifiedForVisualDisplay([
  risk({ id: 'q', name: 'Xileno', type: RiskEnum.QUI, subtypeName: 'Solventes orgânicos [SOLV]' }),
  risk({ id: 'o', name: 'Indicador', type: RiskEnum.OUTROS }),
  risk({ id: 'a', name: 'Queda', type: RiskEnum.ACI }),
  risk({ id: 'f', name: 'Ruído', type: RiskEnum.FIS }),
  risk({
    id: 'e1',
    name: 'Assédio de qualquer natureza no trabalho',
    type: RiskEnum.ERG,
    subtypeName: 'Psicossociais',
  }),
  risk({
    id: 'e2',
    name: 'Baixa clareza de papel/função',
    type: RiskEnum.ERG,
    subtypeName: 'Psicossociais',
  }),
  risk({
    id: 'e3',
    name: 'Compressão',
    type: RiskEnum.ERG,
    subtypeName: 'Biomecânicos',
  }),
  risk({ id: 'b', name: 'Vírus', type: RiskEnum.BIO }),
]);

assert.deepEqual(
  sorted.map((r) => r.type),
  [
    RiskEnum.ACI,
    RiskEnum.BIO,
    RiskEnum.ERG,
    RiskEnum.ERG,
    RiskEnum.ERG,
    RiskEnum.FIS,
    RiskEnum.QUI,
    RiskEnum.OUTROS,
  ],
);

assert.deepEqual(
  sorted.filter((r) => r.type === RiskEnum.ERG).map((r) => r.name),
  [
    'Assédio de qualquer natureza no trabalho',
    'Baixa clareza de papel/função',
    'Compressão',
  ],
);

const again = sortRisksIdentifiedForVisualDisplay(sorted);
assert.deepEqual(
  again.map((r) => r.id),
  sorted.map((r) => r.id),
);

console.log('riskCompanyIdentifiedVisualSort.spec.ts: OK');
