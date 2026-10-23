import {
  buildCoverageExamAdoptionSeed,
  canAdoptCoverageExam,
  resolvePendingCoverageExam,
} from './exam-risk-adoption.util';
import { examRiskSchema } from 'core/utils/schemas/exam.schema';
const config = {
  isAdmission: false,
  isPeriodic: true,
  isChange: true,
  isReturn: false,
  isDismissal: true,
  isMale: false,
  isFemale: true,
  fromAge: 0,
  toAge: null,
  validityInMonths: 6,
  considerBetweenDays: 0,
  minRiskDegree: 3,
  minRiskDegreeQuantity: 4,
};
const exam = {
  examId: 69,
  examName: 'Nome somente para exibição',
  config,
  isMissing: true,
  isAdopted: false,
  matchedAdoptedLinks: [],
} as any;
const item = {
  riskId: 'risk',
  riskName: 'Tolueno',
  riskGroup: { id: 'QUI' },
  quantitativeLimitApplicable: true,
  recommendedExams: [exam],
  missingRecommendedExams: [exam],
  adoptedExams: [],
} as any;
it('seeds all seven groups by explicit IDs, preserving null, false and zero, without publishing', () => {
  const before = JSON.stringify(item);
  const seed = buildCoverageExamAdoptionSeed(item, exam);
  expect(seed).toMatchObject({
    ...config,
    id: 0,
    riskId: 'risk',
    examId: 69,
    exam: { id: 69 },
    isAll: false,
    publishAsSystemRule: false,
  });
  expect(seed.risk.quantitativeLimitApplicable).toBe(true);
  expect(JSON.stringify(item)).toBe(before);
});
it.each([false, undefined])(
  'does not seed quantitative values when eligibility is %s',
  (eligibility) => {
    const seed = buildCoverageExamAdoptionSeed(
      { ...item, quantitativeLimitApplicable: eligibility },
      exam,
    );
    expect(seed.minRiskDegreeQuantity).toBeNull();
    expect(seed.risk.quantitativeLimitApplicable).toBe(eligibility);
    expect(exam.config.minRiskDegreeQuantity).toBe(4);
  },
);
it('uses current configuration after revalidation and never matches by name', () => {
  const changed = {
    ...exam,
    config: { ...config, validityInMonths: 24 },
    examName: 'Alterado',
  };
  const fresh = {
    ...item,
    recommendedExams: [changed],
    missingRecommendedExams: [changed],
  };
  expect(
    buildCoverageExamAdoptionSeed(
      fresh,
      resolvePendingCoverageExam(fresh, 'risk', 69),
    ).validityInMonths,
  ).toBe(24);
  expect(() => resolvePendingCoverageExam(fresh, 'risk', 12)).toThrow();
});
it('blocks an adopted recommendation, canonical match, duplicate recommendation and wrong risk', () => {
  expect(
    canAdoptCoverageExam({ ...exam, isMissing: false, isAdopted: true }),
  ).toBe(false);
  expect(() =>
    resolvePendingCoverageExam(
      {
        ...item,
        recommendedExams: [
          { ...exam, matchedAdoptedLinks: [{ examId: 12, linkId: 283 }] },
        ],
      },
      'risk',
      69,
    ),
  ).toThrow();
  expect(() =>
    resolvePendingCoverageExam(
      { ...item, recommendedExams: [exam, exam] },
      'risk',
      69,
    ),
  ).toThrow();
  expect(() => resolvePendingCoverageExam(item, 'other-risk', 69)).toThrow();
  expect(() =>
    resolvePendingCoverageExam(
      { ...item, missingRecommendedExams: [] },
      'risk',
      69,
    ),
  ).toThrow();
});
it('keeps absent periodicity blank and lets the existing validator require a positive interval', async () => {
  const seed = buildCoverageExamAdoptionSeed(item, {
    ...exam,
    config: { ...config, validityInMonths: null },
  });
  expect(seed.validityInMonths).toBeNull();
  await expect(
    examRiskSchema.validate({
      isPeriodic: seed.isPeriodic,
      validityInMonths: '',
    }),
  ).rejects.toThrow('periodicidade');
  await expect(
    examRiskSchema.validate({
      isPeriodic: seed.isPeriodic,
      validityInMonths: '0',
    }),
  ).rejects.toThrow();
  await expect(
    examRiskSchema.validate({
      isPeriodic: seed.isPeriodic,
      validityInMonths: '6',
    }),
  ).resolves.toBeDefined();
});
it('rejects missing configuration and leaves invalid matrix levels unselected', () => {
  expect(() =>
    buildCoverageExamAdoptionSeed(item, { ...exam, config: null }),
  ).toThrow();
  expect(
    buildCoverageExamAdoptionSeed(item, {
      ...exam,
      config: { ...config, minRiskDegree: 9 },
    }).minRiskDegree,
  ).toBeNull();
});

it('refreshes through the existing callback only after the modal reports a save', () => {
  const refresh = jest.fn();
  const seed = buildCoverageExamAdoptionSeed(item, exam, refresh);
  expect(refresh).not.toHaveBeenCalled();
  seed.callback();
  expect(refresh).toHaveBeenCalledTimes(1);
});

it('allows individual adoption of a valid non-adoption without reconsidering, excluding it from pending list', () => {
  const declined = { ...exam, isMissing: false, adoptionState: 'NOT_ADOPTED', nonAdoptionDecision: { valid: true } } as any;
  const updated = { ...item, recommendedExams: [declined], missingRecommendedExams: [] };
  expect(canAdoptCoverageExam(declined)).toBe(true);
  expect(resolvePendingCoverageExam(updated, 'risk', 69)).toBe(declined);
  expect(buildCoverageExamAdoptionSeed(updated, declined)).toMatchObject({ id: 0, examId: 69, publishAsSystemRule: false });
  expect(canAdoptCoverageExam({ ...declined, isAdopted: true })).toBe(false);
  expect(canAdoptCoverageExam({ ...declined, nonAdoptionDecision: { valid: false } })).toBe(false);
});
