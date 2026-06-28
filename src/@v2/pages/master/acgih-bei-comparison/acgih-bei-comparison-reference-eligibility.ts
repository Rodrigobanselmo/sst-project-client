import {
  AcgihBeiComparisonDecisionEnum,
  AcgihBeiComparisonStatusEnum,
  AcgihBeiOperationalStatusEnum,
  AcgihBeiSuggestedActionEnum,
  IAcgihBeiComparisonRow,
} from '@v2/services/medicine/acgih-bei-comparison/service/acgih-bei-comparison.types';
import { AcgihBeiIndicatorStatusEnum } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';

/** Decisões que impedem fonte complementar (espelha API 4O.3). */
const REFERENCE_BLOCKING_DECISIONS: AcgihBeiComparisonDecisionEnum[] = [
  AcgihBeiComparisonDecisionEnum.REAL_DIVERGENCE,
  AcgihBeiComparisonDecisionEnum.SOURCE_ACGIH_ERROR,
  AcgihBeiComparisonDecisionEnum.SOURCE_NR7_ERROR,
  AcgihBeiComparisonDecisionEnum.NEEDS_FURTHER_REVIEW,
  AcgihBeiComparisonDecisionEnum.IGNORE_MONITOR,
];

const isActiveStatus = (value?: string | null): boolean =>
  String(value ?? '').toUpperCase() === AcgihBeiIndicatorStatusEnum.ACTIVE;

const isEquivalenceResolved = (row: IAcgihBeiComparisonRow): boolean =>
  row.operationalStatus ===
    AcgihBeiOperationalStatusEnum.RESOLVED_EQUIVALENCE ||
  row.review?.decision ===
    AcgihBeiComparisonDecisionEnum.FALSE_DIVERGENCE_EQUIVALENT;

/**
 * 4O.3 — bloqueios de elegibilidade para fonte complementar (espelha API).
 * Retorna array vazio quando elegível.
 */
export const getReferenceEligibilityBlockers = (
  row: IAcgihBeiComparisonRow,
): string[] => {
  if (!row.examRiskRuleId) {
    return [
      'Sem regra da Biblioteca Risco × Exame vinculada (examRiskRuleId).',
    ];
  }

  const currentPath =
    row.comparisonStatus === AcgihBeiComparisonStatusEnum.ALREADY_COVERED &&
    row.suggestedAction === AcgihBeiSuggestedActionEnum.ADD_REFERENCE_ONLY;
  if (currentPath) return [];

  const blockers: string[] = [];

  if (!row.review) {
    return [
      'Sem decisão técnica registrada. Registre equivalência técnica / falso divergente para habilitar.',
    ];
  }

  if (REFERENCE_BLOCKING_DECISIONS.includes(row.review.decision)) {
    return [
      'A decisão técnica registrada não permite adicionar fonte complementar.',
    ];
  }

  if (!isEquivalenceResolved(row)) {
    return [
      'Item não está coberto nem resolvido por equivalência técnica (operationalStatus / decisão).',
    ];
  }

  if (row.review.isStale) {
    blockers.push(
      'Decisão técnica desatualizada (classificação recalculada); revise antes de aplicar.',
    );
  }

  if (!isActiveStatus(row.acgihBeiStatus)) {
    blockers.push(
      row.acgihBeiStatus === AcgihBeiIndicatorStatusEnum.DRAFT
        ? 'ACGIH/BEI em rascunho.'
        : 'ACGIH/BEI não está ativo.',
    );
  }
  if (row.acgihBeiIsCurated !== true) {
    blockers.push('ACGIH/BEI não está marcado como curado.');
  }
  if (!row.nr7IndicatorId) {
    blockers.push('Sem indicador NR-7 vinculado.');
  } else if (!isActiveStatus(row.nr7Status)) {
    blockers.push(
      row.nr7Status === 'DRAFT'
        ? 'Indicador NR-7 em rascunho.'
        : 'Indicador NR-7 não está ativo.',
    );
  }
  if (!isActiveStatus(row.examRiskRuleStatus)) {
    blockers.push('Regra da Biblioteca não está ativa.');
  }
  if (row.examRiskRuleIsCurated !== true) {
    blockers.push('Regra da Biblioteca não está marcada como curada.');
  }

  return blockers;
};

/** Espelha `isReferenceEligible` da API (gating visual; backend revalida). */
export const isEligibleForReference = (row: IAcgihBeiComparisonRow): boolean =>
  getReferenceEligibilityBlockers(row).length === 0;
