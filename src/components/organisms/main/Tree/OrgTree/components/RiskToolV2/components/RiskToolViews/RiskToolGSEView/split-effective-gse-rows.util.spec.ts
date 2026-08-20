/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/split-effective-gse-rows.util.spec.ts
 */
import assert from 'node:assert/strict';

import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import {
  formatGseEffectiveOriginLabel,
  groupInheritedRowsByOrigin,
  inheritedOriginGroupKey,
  isDirectGseRiskOccurrence,
  splitEffectiveGseRows,
} from './split-effective-gse-rows.util';

function row(
  riskData: Partial<IRiskData>,
): [IRiskData, IRiskFactors] {
  return [
    {
      companyId: 'c1',
      created_at: new Date(),
      updated_at: new Date(),
      riskFactorGroupDataId: 'rg1',
      id: 'rfd-1',
      riskId: 'risk-1',
      ...riskData,
    } as IRiskData,
    { id: riskData.riskId || 'risk-1', name: 'Ruído' } as IRiskFactors,
  ];
}

const gseId = 'gse-1';

assert.equal(
  isDirectGseRiskOccurrence(
    row({ id: '', homogeneousGroupId: gseId })[0],
    gseId,
  ),
  true,
);

assert.equal(
  isDirectGseRiskOccurrence(
    row({
      id: 'rfd-direct',
      homogeneousGroupId: gseId,
      isDirect: true,
    })[0],
    gseId,
  ),
  true,
);

assert.equal(
  isDirectGseRiskOccurrence(
    row({
      id: 'rfd-inherited',
      homogeneousGroupId: 'el-1',
      isDirect: false,
    })[0],
    gseId,
  ),
  false,
);

const split = splitEffectiveGseRows({
  gseId,
  rows: [
    row({
      id: 'rfd-gse',
      riskId: 'risk-noise',
      homogeneousGroupId: gseId,
      isDirect: true,
    }),
    row({
      id: 'rfd-el',
      riskId: 'risk-noise',
      homogeneousGroupId: 'el-1',
      isDirect: false,
    }),
  ],
});

assert.equal(split.direct.length, 1);
assert.equal(split.inherited.length, 1);
assert.equal(split.direct[0][0].id, 'rfd-gse');
assert.equal(split.inherited[0][0].id, 'rfd-el');
assert.equal(split.direct[0][0].riskId, split.inherited[0][0].riskId);

assert.equal(
  formatGseEffectiveOriginLabel({
    originTypeLabel: 'Elemento Caracterizado',
    originName:
      'ÁREAS OPERACIONAIS DA DETEN (LOCAL DE ATUAÇÃO DA ALTUS)',
  } as IRiskData),
  'Origem: Elemento Caracterizado — ÁREAS OPERACIONAIS DA DETEN (LOCAL DE ATUAÇÃO DA ALTUS)',
);

assert.equal(
  formatGseEffectiveOriginLabel({
    originTypeLabel: 'GSE',
    originName: 'GSE Deten 03 — Manutenção Mecânica',
  } as IRiskData),
  'Origem: GSE — GSE Deten 03 — Manutenção Mecânica',
);

assert.equal(
  inheritedOriginGroupKey({
    originKind: 'CHARACTERIZATION',
    originId: 'el-op',
    originName: 'ÁREAS OPERACIONAIS DA DETEN (LOCAL DE ATUAÇÃO DA ALTUS)',
  } as IRiskData),
  'CHARACTERIZATION::el-op',
);

assert.notEqual(
  inheritedOriginGroupKey({
    originKind: 'HIERARCHY',
    originId: 'hg-setor',
    originName: 'MANUTENÇÃO MECÂNICA',
  } as IRiskData),
  inheritedOriginGroupKey({
    originKind: 'CHARACTERIZATION',
    originId: 'el-op',
    originName: 'MANUTENÇÃO MECÂNICA',
  } as IRiskData),
);

const grouped = groupInheritedRowsByOrigin([
  row({
    id: 'rfd-noise',
    riskId: 'risk-noise',
    originKind: 'CHARACTERIZATION',
    originId: 'el-op',
    originTypeLabel: 'Elemento Caracterizado',
    originName: 'ÁREAS OPERACIONAIS DA DETEN (LOCAL DE ATUAÇÃO DA ALTUS)',
    homogeneousGroupId: 'el-op',
    isDirect: false,
  }),
  row({
    id: 'rfd-psic',
    riskId: 'risk-psic',
    originKind: 'HIERARCHY',
    originId: 'hg-setor',
    originTypeLabel: 'Setor',
    originName: 'MANUTENÇÃO MECÂNICA',
    homogeneousGroupId: 'hg-setor',
    isDirect: false,
  }),
  row({
    id: 'rfd-benzene',
    riskId: 'risk-benzene',
    originKind: 'CHARACTERIZATION',
    originId: 'el-op',
    originTypeLabel: 'Elemento Caracterizado',
    originName: 'ÁREAS OPERACIONAIS DA DETEN (LOCAL DE ATUAÇÃO DA ALTUS)',
    homogeneousGroupId: 'el-op',
    isDirect: false,
  }),
]);

assert.equal(grouped.length, 2);
assert.equal(grouped[0].originId, 'el-op');
assert.equal(grouped[0].rows.length, 2);
assert.equal(grouped[0].rows[0][0].id, 'rfd-noise');
assert.equal(grouped[0].rows[1][0].id, 'rfd-benzene');
assert.equal(grouped[1].originKind, 'HIERARCHY');
assert.equal(grouped[1].rows.length, 1);
assert.equal(grouped[1].rows[0][0].riskId, 'risk-psic');

const sameNameDifferentId = groupInheritedRowsByOrigin([
  row({
    id: 'rfd-a',
    originKind: 'HIERARCHY',
    originId: 'setor-a',
    originName: 'MANUTENÇÃO',
    homogeneousGroupId: 'setor-a',
  }),
  row({
    id: 'rfd-b',
    originKind: 'HIERARCHY',
    originId: 'setor-b',
    originName: 'MANUTENÇÃO',
    homogeneousGroupId: 'setor-b',
  }),
]);
assert.equal(sameNameDifferentId.length, 2);

console.log('split-effective-gse-rows.util.spec.ts ok');
