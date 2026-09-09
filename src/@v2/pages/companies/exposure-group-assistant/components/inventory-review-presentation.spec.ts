import assert from 'node:assert/strict';

import type {
  InventoryReviewedGroup,
  InventoryReviewedLink,
  InventoryReviewedRole,
  InventoryReviewedStructure,
} from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';
import {
  groupHeadline,
  linkIgnoreReason,
  linkOperationalStatus,
  linkStatusLabel,
  roleBlockedReason,
  roleHeadline,
  roleResolvedByProposedStructure,
  stepToneLabel,
  stepVisitState,
  suggestedSplitNames,
  structureDecisionMode,
  structureHeadline,
} from './inventory-review-presentation';

const structure = (partial: Partial<InventoryReviewedStructure>): InventoryReviewedStructure =>
  ({
    key: 'st-adm',
    proposedName: 'Adm Industrial',
    proposedNormalizedName: 'ADM INDUSTRIAL',
    proposedType: 'SECTOR',
    action: 'PROPOSE_CREATE',
    context: 'WORK_UNIT_GSE',
    reusedParentHierarchyId: null,
    reusedParentName: null,
    reusedParentType: null,
    groupKeys: ['g1'],
    roleKeys: ['r1'],
    evidence: [],
    included: true,
    appliedName: 'Adm Industrial',
    appliedNormalizedName: 'ADM INDUSTRIAL',
    appliedType: 'SECTOR',
    nameCorrected: false,
    selectedReuseParentHierarchyId: null,
    planAction: 'create',
    ...partial,
  }) as InventoryReviewedStructure;

const role = (partial: Partial<InventoryReviewedRole>): InventoryReviewedRole =>
  ({
    key: 'r1',
    sourceName: 'TÉCNICO DE MANUTENÇÃO I',
    normalizedName: 'TECNICO DE MANUTENCAO I',
    parentHints: [],
    evidence: [],
    matchStatus: 'NEW',
    matchedHierarchyId: null,
    suggestedParentHierarchyId: null,
    suggestedParentName: null,
    structuralParent: {
      source: 'GSE_SEMANTIC',
      context: 'WORK_UNIT_GSE',
      suggestedName: 'Manutenção Mecânica',
      organogramMatch: 'NONE',
      structureAction: 'PROPOSE_CREATE',
      proposedStructureKey: 'st-mec',
      proposedType: 'SECTOR',
      suggestedParentHierarchyId: null,
      suggestedParentName: null,
      suggestedParentType: null,
      compatibleParents: [],
      gseEvidences: [],
    },
    candidates: [],
    included: true,
    appliedName: '',
    appliedNormalizedName: '',
    nameCorrected: false,
    selectedParentHierarchyId: null,
    selectedParentName: 'Manutenção Mecânica',
    selectedProposedStructureKey: 'st-mec',
    planAction: 'create',
    ...partial,
  }) as InventoryReviewedRole;

assert.equal(structureDecisionMode({ included: true }), 'create');
assert.equal(
  structureDecisionMode({ included: true, reuseParentHierarchyId: 'sec-1' }),
  'reuse',
);
assert.equal(structureDecisionMode({ included: false }), 'ignore');

assert.equal(
  structureHeadline(structure({ planAction: 'create' })),
  'Será criado: Setor “Adm Industrial”',
);
assert.equal(
  structureHeadline(
    structure({
      planAction: 'reuse',
      reusedParentName: 'Logística',
      appliedName: 'Logística',
    }),
  ),
  'Será usada a estrutura existente: Setor “Logística”',
);
assert.deepEqual(suggestedSplitNames('ADM/SESMT'), ['ADM', 'SESMT']);
assert.deepEqual(suggestedSplitNames('Conversão/Embalagem'), [
  'Conversão',
  'Embalagem',
]);
assert.equal(stepVisitState({
  isActive: true,
  visited: true,
  pendingCount: 0,
  hasReview: true,
}), 'current');
assert.equal(stepVisitState({
  isActive: false,
  visited: false,
  pendingCount: 0,
  hasReview: true,
}), 'unvisited');
assert.equal(stepVisitState({
  isActive: false,
  visited: true,
  pendingCount: 2,
  hasReview: true,
}), 'pending');

const proposed = structure({
  key: 'st-mec',
  proposedName: 'Manutenção Mecânica',
  appliedName: 'Manutenção Mecânica',
  planAction: 'create',
  included: true,
});
assert.equal(
  roleHeadline(role({}), [proposed]),
  'Será criado em: Setor > Manutenção Mecânica',
);
assert.equal(roleResolvedByProposedStructure(role({}), [proposed]), true);

const ignored = structure({
  key: 'st-adm',
  proposedName: 'Adm Industrial',
  appliedName: 'Adm Industrial',
  included: false,
  planAction: 'skip',
});
assert.equal(
  roleBlockedReason(
    role({
      planAction: 'blocked',
      matchStatus: 'PARENT_REQUIRED',
      selectedProposedStructureKey: 'st-adm',
      selectedParentName: null,
      structuralParent: {
        ...role({}).structuralParent,
        proposedStructureKey: 'st-adm',
      },
    }),
    [ignored],
  ),
  'Você ignorou o Setor “Adm Industrial”. Escolha outro pai ou ignore este cargo.',
);

const group = {
  sourceName: 'MANUTENÇÃO MECÂNICA',
  appliedName: '',
  persistedName: 'GSE 1013 — Manutenção Mecânica',
  included: true,
  planAction: 'create',
  candidates: [],
} as unknown as InventoryReviewedGroup;
assert.equal(
  groupHeadline(group),
  'Será criado GSE: GSE 1013 — Manutenção Mecânica',
);
assert.equal(
  groupHeadline({ ...group, planAction: 'link-workspace' }),
  'Será vinculado a este estabelecimento',
);

const skippedLink = {
  included: false,
  planAction: 'skip',
  excludedBecause: 'role-skipped',
  matchStatus: 'BLOCKED_BY_ROLE',
} as InventoryReviewedLink;
assert.equal(
  linkOperationalStatus({
    reviewed: skippedLink,
    fallbackStatus: 'NEW',
  }),
  'ignored',
);
assert.equal(
  linkIgnoreReason(skippedLink),
  'Ignorado porque o cargo ficou fora do plano',
);
assert.equal(linkStatusLabel('ready'), 'Pronto para criar');
assert.equal(linkStatusLabel('blocked-role'), 'Bloqueado — resolver cargo');
assert.equal(stepToneLabel('informative'), 'Somente informativa');
assert.equal(stepToneLabel('pending', 2), 'Requer decisão (2)');

console.log('inventory-review-presentation.spec.ts ok');
