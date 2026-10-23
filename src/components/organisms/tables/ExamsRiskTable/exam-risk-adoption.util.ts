import { isNotAdoptedByDecision } from '@v2/services/medicine/company-exam-risk-recommendation-decision/company-exam-risk-recommendation-decision.util';
import type {
  ICompanyExamRiskCoverageItem as Item,
  ICompanyExamRiskCoverageExamSummary as Exam,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';

export const canAdoptCoverageExam = (exam?: Exam) =>
  Boolean(
    exam &&
      Number.isSafeInteger(exam.examId) &&
      exam.examId > 0 &&
      (exam.isMissing || isNotAdoptedByDecision(exam)) &&
      !exam.isAdopted &&
      !exam.matchedAdoptedLinks?.length,
  );

export function resolvePendingCoverageExam(
  item: Item,
  riskId: string,
  examId: number,
): Exam {
  const candidates = item.recommendedExams.filter(
    (exam) => exam.examId === examId,
  );
  if (
    item.riskId !== riskId ||
    candidates.length !== 1 ||
    !canAdoptCoverageExam(candidates[0]) ||
    (!isNotAdoptedByDecision(candidates[0]) &&
      item.missingRecommendedExams.filter((exam) => exam.examId === examId).length !== 1) ||
    item.adoptedExams.some((exam) => exam.examId === examId)
  ) {
    throw new Error(
      'A recomendação não está mais pendente ou não pôde ser identificada com segurança. Atualize a comparação.',
    );
  }
  return candidates[0];
}

// Seed the traditional creation form only; no mutation or global exam changes.
export function buildCoverageExamAdoptionSeed(
  item: Item,
  exam: Exam,
  onSaved: () => void = () => {},
) {
  if (!canAdoptCoverageExam(exam) || !exam.config)
    throw new Error(
      'Não foi possível carregar os parâmetros desta recomendação.',
    );
  const config = exam.config;
  const booleans = [
    'isAdmission',
    'isPeriodic',
    'isChange',
    'isReturn',
    'isDismissal',
    'isMale',
    'isFemale',
  ] as const;
  if (booleans.some((key) => typeof config[key] !== 'boolean'))
    throw new Error(
      'A recomendação contém opções incompletas. Atualize a comparação.',
    );
  const numberOrNull = (value: unknown) =>
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
      ? value
      : null;
  const degreeOrNull = (value: unknown) =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
      ? value
      : null;
  return {
    id: 0,
    isAll: false,
    riskId: item.riskId,
    risk: {
      id: item.riskId,
      name: item.riskName,
      type: item.riskGroup.id,
      quantitativeLimitApplicable: item.quantitativeLimitApplicable,
    },
    examId: exam.examId,
    exam: { id: exam.examId, name: exam.examName },
    isAdmission: config.isAdmission,
    isPeriodic: config.isPeriodic,
    isChange: config.isChange,
    isReturn: config.isReturn,
    isDismissal: config.isDismissal,
    isMale: config.isMale,
    isFemale: config.isFemale,
    fromAge: numberOrNull(config.fromAge),
    toAge: numberOrNull(config.toAge),
    validityInMonths: numberOrNull(config.validityInMonths),
    lowValidityInMonths: null,
    considerBetweenDays: numberOrNull(config.considerBetweenDays),
    minRiskDegree: degreeOrNull(config.minRiskDegree),
    minRiskDegreeQuantity:
      item.quantitativeLimitApplicable === true
        ? degreeOrNull(config.minRiskDegreeQuantity)
        : null,
    publishAsSystemRule: false,
    callback: onSaved,
  };
}
