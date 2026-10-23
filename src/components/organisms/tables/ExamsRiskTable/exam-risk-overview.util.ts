import { ergonomicSubgroup } from './exam-risk-pfro.util';
import {
  ExamRiskCoverageDecisionGroupEnum as Group,
  resolveCoverageDecisionGroup,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-decision.util';
import type {
  ICompanyExamRiskCoverageItem,
  ICompanyExamRiskCoverageExamSummary as Exam,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';

export type OverviewSortField =
  | 'riskName'
  | 'coverage'
  | 'adoptedCount'
  | 'missingCount';
export type OverviewSort = {
  field: OverviewSortField;
  direction: 'asc' | 'desc';
};

export const overviewCoverageRank = (
  item: ICompanyExamRiskCoverageItem,
): number => {
  switch (resolveCoverageDecisionGroup(item)) {
    case Group.PARTIALLY_ADOPTED:
      return 0;
    case Group.LIBRARY_RECOMMENDATION_AVAILABLE:
      return 1;
    case Group.NO_LIBRARY_RECOMMENDATION:
      return 2;
    case Group.LOCAL_ONLY:
      return 3;
    default:
      return item.coverageStatus === 'MIXED' ? 4 : 5;
  }
};

const collator = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
});
export const sortOverviewRisks = (
  items: ICompanyExamRiskCoverageItem[],
  sort: OverviewSort,
) =>
  [...items].sort((a, b) => {
    const primary =
      sort.field === 'coverage'
        ? overviewCoverageRank(a) - overviewCoverageRank(b)
        : sort.field === 'riskName'
          ? collator.compare(a.riskGroup.name, b.riskGroup.name) ||
            collator.compare(ergonomicSubgroup(a)?.name ?? '', ergonomicSubgroup(b)?.name ?? '') ||
            collator.compare(a.riskName, b.riskName)
          : a[sort.field] - b[sort.field];
    return (
      primary * (sort.direction === 'asc' ? 1 : -1) ||
      collator.compare(a.riskName, b.riskName) ||
      a.riskId.localeCompare(b.riskId)
    );
  });

export type ExamComparison = {
  key: string;
  name: string;
  recommended?: Exam;
  adopted: Exam[];
};
/** Prefer authoritative detail matches; retain exact-ID fallback for older APIs. */
export const buildExamComparisons = (
  recommended: Exam[],
  adopted: Exam[],
): ExamComparison[] => {
  const used = new Set<Exam>();
  const rows: ExamComparison[] = recommended.map((exam, index) => {
    const unambiguous =
      recommended.filter((r) => r.examId === exam.examId).length === 1;
    const matches =
      unambiguous && exam.isAdopted && !exam.isMissing
        ? adopted.filter(
            (a) =>
              (exam.matchedAdoptedLinks !== undefined
                ? exam.matchedAdoptedLinks.some(
                    (match) =>
                      match.examId === a.examId && match.linkId === a.linkId,
                  )
                : a.examId === exam.examId) &&
              a.isRecommendedByLibrary &&
              !a.isLocalOnly,
          )
        : [];
    matches.forEach((a) => used.add(a));
    return {
      key: `recommended-${index}-${exam.examId}`,
      name: exam.examName,
      recommended: exam,
      adopted: matches,
    };
  });
  adopted.forEach((exam, index) => {
    if (!used.has(exam))
      rows.push({
        key: `adopted-${exam.linkId ?? index}-${index}`,
        name: exam.examName,
        adopted: [exam],
      });
  });
  return rows;
};


/** Presentation only: retain the original notes in the API data for traceability. */
export function recommendationInformationTooltip(notes?: string[]): string {
  const useful = (notes ?? []).map(note => note.trim()).filter(note => note &&
    !/^regra\s+active\b/i.test(note) &&
    !/biological-indirect|sem regra ACTIVE|indicador biológico confirmado com exame confirmado|curadoria administrativa|não curada|referências protegidas/i.test(note) &&
    !/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\bc[a-z0-9]{24,}\b|\b(ruleId|ruleExamId|sourceIndicatorId)\b/i.test(note) &&
    !/^(eventos|periodicidade|sexo|faixa etária|intervalo em dias|critério qualitativo|critério quantitativo)\s*:/i.test(note));
  return ['Recomendação da Biblioteca SimpleSST para este fator de risco.', ...new Set(useful)].join(' ');
}
