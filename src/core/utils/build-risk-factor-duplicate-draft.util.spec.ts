/**
 * Executar: npx tsx src/core/utils/build-risk-factor-duplicate-draft.util.spec.ts
 */
import assert from 'node:assert/strict';

import { StatusEnum } from 'project/enum/status.enum';
import { RiskEnum } from 'project/enum/risk.enums';

import {
  buildRiskFactorDuplicateDraft,
  buildSuggestedDuplicateRiskName,
  sanitizeRiskCreatePayloadForLocalCopy,
} from './build-risk-factor-duplicate-draft.util';

assert.equal(buildSuggestedDuplicateRiskName('Benzeno'), 'Cópia de Benzeno');
assert.equal(
  buildSuggestedDuplicateRiskName(''),
  'Cópia de fator de risco',
);

const source = {
  id: 'origin-id',
  name: 'Benzeno',
  type: RiskEnum.QUI,
  severity: 5,
  system: true,
  representAll: true,
  companyId: 'global-company',
  status: StatusEnum.ACTIVE,
  synonymous: ['Benzol'],
  cas: '71-43-2',
  risk: 'Leucemia',
  symptoms: 'Cefaleia',
  method: 'CG',
  unit: 'ppm',
  twa: '0,5',
  isAso: true,
  isPGR: true,
  isPCMSO: true,
  isPPP: true,
  isEmergency: false,
  appendix: 'NR-15',
  activities: [
    {
      description: 'Manipulação',
      subActivities: [{ description: 'Envase' }],
    },
  ],
  recMed: [{ id: 'rm-1', recName: 'Não copiar', medName: 'x' }],
  generateSource: [{ id: 'gs-1', name: 'Não copiar' }],
  examToRisk: [{ id: 1 }],
  riskFactorData: [{ id: 'rfd-1' }],
  subTypes: [{ sub_type: { id: '12', name: 'Químico' } }],
  esocialCode: '02.01.001',
  created_at: '2020-01-01',
} as any;

const draft = buildRiskFactorDuplicateDraft({
  source,
  companyId: 'tenant-a',
});

assert.equal(draft.id, '');
assert.equal(draft.companyId, 'tenant-a');
assert.equal(draft.asLocalCompanyCopy, true);
assert.equal(draft.isDuplicateDraft, true);
assert.deepEqual(draft.recMed, []);
assert.deepEqual(draft.generateSource, []);
assert.equal(draft.name, 'Cópia de Benzeno');
assert.equal(draft.subType, '12');
assert.equal(draft.cas, '71-43-2');
assert.equal(draft.risk, 'Leucemia');
assert.deepEqual(draft.activities, [
  {
    description: 'Manipulação',
    subActivities: [{ description: 'Envase' }],
  },
]);
assert.equal((draft as any).system, undefined);
assert.equal((draft as any).representAll, undefined);
assert.equal((draft as any).examToRisk, undefined);
assert.equal((draft as any).riskFactorData, undefined);

const sanitized = sanitizeRiskCreatePayloadForLocalCopy(
  {
    id: 'should-go',
    name: 'Cópia de Ruído',
    type: RiskEnum.FIS,
    companyId: 'wrong',
    system: true,
    representAll: true,
    recMed: [{ recName: 'a', medName: 'b' }],
    generateSource: [{ name: 'gs' }],
    examToRisk: [{ id: 1 }],
    search: 'noise',
    esocial: { id: 'x' },
  },
  { companyId: 'tenant-a' },
);

assert.equal(sanitized.id, undefined);
assert.equal(sanitized.system, undefined);
assert.equal(sanitized.representAll, undefined);
assert.equal(sanitized.search, undefined);
assert.equal(sanitized.examToRisk, undefined);
assert.equal(sanitized.esocial, undefined);
assert.equal(sanitized.companyId, 'tenant-a');
assert.equal(sanitized.asLocalCompanyCopy, true);
assert.deepEqual(sanitized.recMed, []);
assert.deepEqual(sanitized.generateSource, []);
assert.equal(sanitized.name, 'Cópia de Ruído');

console.log('build-risk-factor-duplicate-draft.util.spec.ts: OK');
