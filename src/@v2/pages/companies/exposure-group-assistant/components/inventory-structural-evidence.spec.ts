import assert from 'node:assert/strict';

import {
  formatGseSuggestionLine,
  formatOrganogramFoundLine,
  formatOrganogramNoneLine,
  formatProposeCreateLine,
  promotedGseSuggestions,
} from './inventory-structural-evidence';
import type { InventoryStructuralParentEvidence } from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';

const evidence: InventoryStructuralParentEvidence = {
  source: 'GSE_SEMANTIC',
  context: 'WORK_UNIT_GSE',
  suggestedName: 'Manutenção Mecânica',
  organogramMatch: 'UNIQUE',
  structureAction: 'REUSE_EXISTING',
  proposedStructureKey: null,
  proposedType: 'SECTOR',
  suggestedParentHierarchyId: 'sec-1',
  suggestedParentName: 'Manutenção Mecânica',
  suggestedParentType: 'SECTOR',
  compatibleParents: [],
  gseEvidences: [
    {
      groupKey: 'g1',
      groupName: 'MANUTENÇÃO MECÂNICA',
      groupCode: '1013',
      groupLabel: 'GHE 1013',
      rawName: 'MANUTENÇÃO MECÂNICA',
      suggestedName: 'Manutenção Mecânica',
      promoted: true,
      context: 'WORK_UNIT_GSE',
      skipReason: null,
      evidence: { page: 4, excerpt: 'MANUTENÇÃO MECÂNICA', section: 'GHE 1013' },
    },
    {
      groupKey: 'g2',
      groupName: 'MAKER',
      groupCode: '1012',
      groupLabel: 'GHE 1012',
      rawName: 'MAKER',
      suggestedName: null,
      promoted: false,
      context: 'GENERIC_GSE',
      skipReason: 'EQUIPMENT_OR_PROCESS',
      evidence: null,
    },
  ],
};

const promoted = promotedGseSuggestions(evidence);
assert.equal(promoted.length, 1);
assert.equal(
  formatGseSuggestionLine(promoted[0]),
  'Sugestão a partir do GHE 1013: Manutenção Mecânica',
);
assert.equal(
  formatOrganogramFoundLine('SECTOR', 'Manutenção Mecânica'),
  'Encontrado no organograma: Setor > Manutenção Mecânica',
);
assert.equal(
  formatOrganogramNoneLine('Logística'),
  'Sugestão a partir do GHE: Logística — nenhuma correspondência única encontrada no organograma.',
);
assert.equal(
  formatProposeCreateLine('SECTOR', 'Mixer'),
  'Ação proposta: Criar Setor “Mixer”',
);

console.log('inventory-structural-evidence.spec.ts ok');
