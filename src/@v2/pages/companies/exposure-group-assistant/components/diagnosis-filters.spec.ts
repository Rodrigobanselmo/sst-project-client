/**
 * Filter helpers for the consultative recommendation list.
 * Executar: npx tsx src/@v2/pages/companies/exposure-group-assistant/components/diagnosis-filters.spec.ts
 */
import assert from 'node:assert/strict';

import type {
  InterpretedRecommendation,
  NarrativeStance,
  StructureAttentionLevel,
  StructureFindingCategory,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';
import {
  FINDING_CATEGORY_LABEL_PT,
  FINDING_CATEGORY_ORDER,
} from './diagnosis-labels';

function recommendation(
  partial: Partial<InterpretedRecommendation> &
    Pick<
      InterpretedRecommendation,
      'id' | 'kind' | 'category' | 'attentionLevel' | 'stance' | 'title'
    >,
): InterpretedRecommendation {
  return {
    findingId: partial.id,
    listSummary: partial.listSummary || partial.title,
    situation: 'Situação encontrada.',
    whyAttention: 'Merece atenção técnica.',
    whenExpected: 'Pode ser esperado em alguns contextos.',
    howToReview: 'Revise na tela correspondente.',
    affectedEntities: partial.affectedEntities || [],
    totalAffectedCount: partial.totalAffectedCount ?? 1,
    affectedTruncated: false,
    ...partial,
  };
}

const sample: InterpretedRecommendation[] = [
  recommendation({
    id: '1',
    kind: 'ROLE_WITHOUT_CHARACTERIZATION_COVERAGE',
    category: 'COVERAGE',
    attentionLevel: 'PRIORITY',
    stance: 'REVIEW_RECOMMENDED',
    title: 'Cargos com empregados sem cobertura estrutural',
    affectedEntities: [{ entityType: 'HIERARCHY', entityId: 'r1' }],
  }),
  recommendation({
    id: '2',
    kind: 'ELEMENT_WITHOUT_DIRECT_RISKS_REQUIRES_CONTEXT_REVIEW',
    category: 'COMPLETENESS',
    attentionLevel: 'INFORMATIONAL',
    stance: 'EXPECTED_SITUATION',
    title: 'Elementos sem riscos diretos cadastrados',
    listSummary: 'Confirme se a finalidade é de exposição ou descritiva.',
  }),
  recommendation({
    id: '3',
    kind: 'GSE_WITH_COVERAGE_BUT_WITHOUT_DIRECT_RISKS',
    category: 'EXISTING_GSE_REVIEW',
    attentionLevel: 'INFORMATIONAL',
    stance: 'EXPECTED_SITUATION',
    title: 'Agrupamentos sem riscos diretos',
  }),
  recommendation({
    id: '4',
    kind: 'MANY_ELEMENTS_FOR_SAME_ROLE',
    category: 'FRAGMENTATION',
    attentionLevel: 'ATTENTION',
    stance: 'OPPORTUNITY',
    title: 'Muitos elementos para o mesmo cargo ou função',
  }),
];

function filterRecommendations(
  items: InterpretedRecommendation[],
  opts: {
    category?: StructureFindingCategory | 'ALL';
    attentionLevel?: StructureAttentionLevel | 'ALL';
    stance?: NarrativeStance | 'ALL';
    existingGseOnly?: boolean;
    query?: string;
  },
) {
  return items.filter((r) => {
    if (opts.category && opts.category !== 'ALL' && r.category !== opts.category)
      return false;
    if (
      opts.attentionLevel &&
      opts.attentionLevel !== 'ALL' &&
      r.attentionLevel !== opts.attentionLevel
    ) {
      return false;
    }
    if (opts.stance && opts.stance !== 'ALL' && r.stance !== opts.stance) {
      return false;
    }
    if (opts.existingGseOnly && r.category !== 'EXISTING_GSE_REVIEW') return false;
    if (opts.query) {
      const q = opts.query.toLowerCase();
      if (
        !r.title.toLowerCase().includes(q) &&
        !r.listSummary.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });
}

assert.equal(FINDING_CATEGORY_ORDER.length, 6);
assert.equal(
  FINDING_CATEGORY_LABEL_PT.EXISTING_GSE_REVIEW,
  'Agrupamentos existentes',
);

assert.equal(filterRecommendations(sample, { category: 'COMPLETENESS' }).length, 1);
assert.equal(
  filterRecommendations(sample, { attentionLevel: 'INFORMATIONAL' }).length,
  2,
);
assert.equal(filterRecommendations(sample, { existingGseOnly: true }).length, 1);
assert.equal(filterRecommendations(sample, { query: 'finalidade' }).length, 1);
assert.equal(filterRecommendations(sample, { stance: 'OPPORTUNITY' }).length, 1);
assert.equal(
  filterRecommendations(sample, { category: 'ALL', attentionLevel: 'ALL' }).length,
  4,
);

for (const r of sample) {
  assert.doesNotMatch(r.title, /_/);
  assert.doesNotMatch(r.title, /EMPLOYEE_WITHOUT|ROLE_DESCRIPTION|GSE_WITH_/);
}

const json = JSON.stringify(sample);
assert.doesNotMatch(json, /"severity"/);
assert.doesNotMatch(json, /Severidade/i);
assert.doesNotMatch(json, /\berro\b|\bfalha\b|\bproblema\b/i);

console.log('diagnosis-filters.spec.ts OK');
