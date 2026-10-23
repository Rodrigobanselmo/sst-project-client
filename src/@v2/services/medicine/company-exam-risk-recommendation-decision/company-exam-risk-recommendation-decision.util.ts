import type {
  ICompanyExamRiskCoverageItem as Item,
  ICompanyExamRiskCoverageExamSummary as Exam,
} from '../company-exam-risk-coverage/company-exam-risk-coverage.types';
import type {
  RecommendationDecisionScope,
  RecommendationDecisionPatch,
} from './company-exam-risk-recommendation-decision.types';
export const isNotAdoptedByDecision = (exam?: Exam) =>
  Boolean(
    exam &&
    !exam.isAdopted &&
    exam.adoptionState === 'NOT_ADOPTED' &&
    exam.nonAdoptionDecision?.valid,
  );
export const canDecideRecommendation = (exam?: Exam) =>
  Boolean(
    exam &&
    exam.examId > 0 &&
    !exam.isAdopted &&
    !exam.matchedAdoptedLinks?.length &&
    exam.config &&
    exam.recommendationSource?.ruleId &&
    exam.recommendationSource.ruleExamId &&
    /^[a-f0-9]{64}$/.test(exam.nonAdoptionDecision?.fingerprint ?? '') &&
    exam.nonAdoptionDecision?.version !== undefined &&
    (exam.isMissing || isNotAdoptedByDecision(exam)),
  );
export function recommendationDecisionPatch(
  scope: RecommendationDecisionScope,
  exam: Exam,
  action: RecommendationDecisionPatch['action'],
  reason?: string,
): RecommendationDecisionPatch {
  if (
    !canDecideRecommendation(exam) ||
    !scope.workspaceId ||
    (action === 'RECONSIDER' && !isNotAdoptedByDecision(exam))
  )
    throw new Error('A recomendação não está disponível para esta decisão.');
  if ((reason?.length ?? 0) > 2000)
    throw new Error('O motivo deve ter no máximo 2000 caracteres.');
  return {
    workspaceId: scope.workspaceId,
    action,
    ruleId: exam.recommendationSource!.ruleId,
    ruleExamId: exam.recommendationSource!.ruleExamId,
    recommendedExamId: exam.examId,
    expectedFingerprint: exam.nonAdoptionDecision!.fingerprint,
    expectedVersion: exam.nonAdoptionDecision!.version,
    reason: reason?.trim() || null,
  };
}
export function resolveCurrentDecisionExam(
  detail: Item,
  riskId: string,
  displayed: Exam,
): Exam {
  const matches = detail.recommendedExams.filter(
    (exam) => exam.examId === displayed.examId,
  );
  const current = matches.length === 1 ? matches[0] : undefined;
  if (
    detail.riskId !== riskId ||
    !canDecideRecommendation(current) ||
    current?.recommendationSource?.ruleId !==
      displayed.recommendationSource?.ruleId ||
    current?.recommendationSource?.ruleExamId !==
      displayed.recommendationSource?.ruleExamId ||
    current?.nonAdoptionDecision?.fingerprint !==
      displayed.nonAdoptionDecision?.fingerprint ||
    current?.nonAdoptionDecision?.version !==
      displayed.nonAdoptionDecision?.version
  ) {
    throw Object.assign(
      new Error(
        'A recomendação ou decisão foi alterada. Atualize os dados e tente novamente.',
      ),
      { response: { status: 409 } },
    );
  }
  return current!;
}
