/**
 * Testes pontuais do fluxo "Cadastrar fator químico" na curadoria.
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-curation-create-risk.util.spec.ts
 */
import type {
  AiCurationSuggestion,
  ChemicalAiCurationPendingItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  buildChemicalCurationCreateRiskPrefill,
  buildManualFactorDecision,
  canCreateChemicalRiskPermission,
  filterRisksWithSameCas,
  isValidCasRn,
  shouldShowCreateChemicalRiskButton,
  softNormalizeCas,
} from './chemical-curation-create-risk.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const pending: ChemicalAiCurationPendingItem = {
  sourceRowId: 'Sheet|10|ACIDO',
  sourceRow: 10,
  sourceSheet: 'Sheet',
  tradeName: 'Produto',
  manufacturer: null,
  componentOriginal: 'ACIDO SULFAMICO',
  componentNormalized: 'acido sulfamico',
  chemicalQueryText: null,
  textClassification: null,
  casReceived: null,
  matchStatus: 'NO_MATCH',
  concentrationKindLabel: 'NÃO INFORMADA',
  exactPercent: null,
  minPercent: null,
  maxPercent: null,
  observation: null,
  deterministicCandidates: [],
};

const identitySuggestion: AiCurationSuggestion = {
  sourceRowId: pending.sourceRowId,
  originalText: pending.componentOriginal,
  type: 'CHEMICAL_IDENTITY',
  candidates: [
    {
      officialName: 'Sulfamic Acid',
      cas: '5329-14-6',
      riskFactorId: null,
      synonyms: ['Ácido sulfâmico'],
      evidences: [
        {
          sourceType: 'EXTERNAL_SOURCE',
          sourceName: 'PUBCHEM',
          field: 'cas',
          value: '5329-14-6',
          excerpt: '5329-14-6',
          sourceReference: null,
        },
      ],
      confidence: 'HIGH',
      rationale: 'ok',
      warnings: [],
    },
  ],
  splitCandidates: [],
  confidence: 'HIGH',
  identityConfidence: 'HIGH',
  identityStatus: 'confirmed',
  catalogLinkConfidence: 'LOW',
  catalogLinkStatus: 'NO_INTERNAL_FACTOR',
  rationale: 'Identidade confirmada sem fator',
  requiresHumanConfirmation: true,
  identityCacheHit: false,
};

assert(isValidCasRn('5329-14-6') === true, 'CAS válido');
assert(isValidCasRn('001-00-5') === false, 'CAS inválido');
assert(softNormalizeCas(' 5329 - 14 - 6 ').value === '5329-14-6', 'normalize CAS');

assert(
  canCreateChemicalRiskPermission({
    isAuthSuccess: ({ permissions, cruds }) =>
      Boolean(permissions?.length && cruds === 'c'),
  }) === true,
  '1. usuário com RISK create',
);
assert(
  canCreateChemicalRiskPermission({
    isAuthSuccess: () => false,
  }) === false,
  '2. usuário sem RISK create',
);

assert(
  shouldShowCreateChemicalRiskButton({
    canCreateRisk: true,
    pending,
    suggestion: identitySuggestion,
    hasAppliedDecision: false,
    hasPendingManualFactor: true,
  }) === false,
  'esconde cadastro quando já há fator pré-vinculado',
);

assert(
  shouldShowCreateChemicalRiskButton({
    canCreateRisk: true,
    pending,
    suggestion: identitySuggestion,
    hasAppliedDecision: false,
  }) === true,
  '3. NO_MATCH/identity com contexto mostra botão',
);

assert(
  shouldShowCreateChemicalRiskButton({
    canCreateRisk: false,
    pending,
    suggestion: identitySuggestion,
    hasAppliedDecision: false,
  }) === false,
  '2b. sem permissão não mostra botão',
);

const withCasPrefill = buildChemicalCurationCreateRiskPrefill({
  companyId: 'company-a',
  pending,
  suggestion: identitySuggestion,
});
assert(withCasPrefill.type === 'QUI', 'type QUI');
assert(withCasPrefill.cas === '5329-14-6', '3. pré-preenche CAS válido');
assert(
  withCasPrefill.name === 'Ácido sulfâmico',
  '4. prioriza nome em português disponível',
);
assert(
  withCasPrefill.synonymous.includes('Sulfamic Acid'),
  'inglês fica como sinônimo',
);
assert(
  (withCasPrefill as { coments?: string }).coments == null,
  '3. não preenche comentários respirador/filtro',
);

const withoutCasPrefill = buildChemicalCurationCreateRiskPrefill({
  companyId: 'company-a',
  pending,
  suggestion: {
    ...identitySuggestion,
    candidates: [
      {
        ...identitySuggestion.candidates[0]!,
        cas: null,
      },
    ],
  },
});
assert(
  withoutCasPrefill.cas === undefined,
  '4. sem CAS não inventa CAS',
);

const sameCas = filterRisksWithSameCas(
  [
    {
      id: 'a',
      name: 'Sulfamic Acid',
      cas: '5329-14-6',
      system: true,
      companyId: 'x',
      type: 'QUI',
    },
    {
      id: 'b',
      name: 'Other',
      cas: '67-64-1',
      system: false,
      companyId: 'x',
      type: 'QUI',
    },
  ],
  '5329-14-6',
);
assert(sameCas.length === 1 && sameCas[0]?.id === 'a', '12. aviso CAS duplicado');

assert(
  isValidCasRn('5329-14-7') === false,
  '5. CAS com dígito verificador inválido impede (util)',
);

const decision = buildManualFactorDecision({
  sourceRowId: pending.sourceRowId,
  createdRisk: { id: 'rf-new', name: 'Sulfamic Acid', cas: '5329-14-6' },
  suggestionType: 'CHEMICAL_IDENTITY',
  confidence: 'HIGH',
});
assert(decision.action === 'MANUAL_FACTOR', '7. MANUAL_FACTOR');
assert(decision.riskFactorId === 'rf-new', 'vínculo no mesmo sourceRowId');
assert(decision.sourceRowId === pending.sourceRowId, 'mesmo sourceRowId');
assert(decision.cas === '5329-14-6', 'CAS no MANUAL_FACTOR');

const decisionsBag = [
  {
    sourceRowId: 'other',
    action: 'KEEP_UNLINKED' as const,
  },
  decision,
];
assert(
  decisionsBag.find((d) => d.sourceRowId === 'other')?.action ===
    'KEEP_UNLINKED',
  '8. demais decisões intactas',
);
assert(
  decisionsBag.find((d) => d.sourceRowId === pending.sourceRowId)?.action ===
    'MANUAL_FACTOR',
  '7b. decisão só no sourceRowId alvo',
);

assert(
  shouldShowCreateChemicalRiskButton({
    canCreateRisk: true,
    pending,
    suggestion: identitySuggestion,
    hasAppliedDecision: true,
  }) === false,
  '6. após decisão (ex. cancel não aplica; com decisão some o botão)',
);

assert(
  shouldShowCreateChemicalRiskButton({
    canCreateRisk: true,
    pending,
    suggestion: {
      ...identitySuggestion,
      type: 'EXISTING_RISK_MATCH',
      candidates: [
        {
          ...identitySuggestion.candidates[0]!,
          riskFactorId: 'existing-rf',
        },
      ],
    },
    hasAppliedDecision: false,
  }) === false,
  'não mostra cadastro quando já há fator correspondente',
);

const prefillInvalidCasIgnored = buildChemicalCurationCreateRiskPrefill({
  companyId: 'company-a',
  pending: { ...pending, casReceived: '001-00-5' },
  suggestion: {
    ...identitySuggestion,
    candidates: [
      {
        ...identitySuggestion.candidates[0]!,
        cas: '001-00-5',
      },
    ],
  },
});
assert(
  prefillInvalidCasIgnored.cas === undefined,
  'CAS inválido não pré-preenche (exige correção humana)',
);

console.log('chemical-curation-create-risk.util.spec.ts OK');
