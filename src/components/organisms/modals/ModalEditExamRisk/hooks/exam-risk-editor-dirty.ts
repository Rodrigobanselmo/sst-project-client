import deepEqual from 'deep-equal';

import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

type ExamRiskForm = {
  validityInMonths?: unknown;
  lowValidityInMonths?: unknown;
  considerBetweenDays?: unknown;
  fromAge?: unknown;
  toAge?: unknown;
  minRiskDegree?: unknown;
  minRiskDegreeQuantity?: unknown;
  isPeriodic?: unknown;
};

const pick = (form: ExamRiskForm, data: Record<string, unknown>, key: keyof ExamRiskForm) =>
  form[key] !== undefined ? form[key] : data[key];

export function getExamRiskEditorSnapshot(
  examData: Record<string, unknown>,
  form: ExamRiskForm = {},
) {
  return cleanObjectValues({
    id: examData.id,
    examId: examData.examId,
    riskId: examData.riskId,
    isAll: examData.isAll,
    isMale: examData.isMale,
    isFemale: examData.isFemale,
    isPeriodic: pick(form, examData, 'isPeriodic') ?? examData.isPeriodic,
    isChange: examData.isChange,
    isAdmission: examData.isAdmission,
    isReturn: examData.isReturn,
    isDismissal: examData.isDismissal,
    validityInMonths: pick(form, examData, 'validityInMonths'),
    lowValidityInMonths: pick(form, examData, 'lowValidityInMonths'),
    considerBetweenDays: pick(form, examData, 'considerBetweenDays'),
    fromAge: pick(form, examData, 'fromAge'),
    toAge: pick(form, examData, 'toAge'),
    minRiskDegree: pick(form, examData, 'minRiskDegree'),
    minRiskDegreeQuantity: pick(form, examData, 'minRiskDegreeQuantity'),
    publishAsSystemRule: examData.publishAsSystemRule,
    selectedCanonicalRiskId:
      (examData.selectedCanonicalRisk as { id?: string } | null)?.id || null,
  });
}

export function isExamRiskEditorDirty(
  examData: Record<string, unknown>,
  form: ExamRiskForm,
  baseline: unknown,
): boolean {
  return !deepEqual(
    getExamRiskEditorSnapshot(examData, form),
    cleanObjectValues((baseline || {}) as object),
  );
}
