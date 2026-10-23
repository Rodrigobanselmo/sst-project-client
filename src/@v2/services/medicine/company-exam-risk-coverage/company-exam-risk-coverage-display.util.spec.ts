import { resolveCoverageStatusLabel } from './company-exam-risk-coverage-display.util';
import { CompanyExamRiskCoverageStatusEnum as Status } from './company-exam-risk-coverage.types';

describe('resolveCoverageStatusLabel', () => {
  it.each([
    [false, 'Sem nenhum exame adotado'],
    [true, 'Cobertura incompleta'],
  ])('identifica pendências com adoção=%s', (hasAnyAdoptedExam, label) => {
    expect(resolveCoverageStatusLabel({
      coverageStatus: Status.MISSING_RECOMMENDED_EXAMS,
      hasAnyAdoptedExam,
      missingCount: 2,
    })).toBe(label);
  });

  it.each([
    [Status.COMPLETE, 'Cobertura completa'],
    [Status.MIXED, 'Cobertura mista'],
    [Status.NO_LIBRARY_RECOMMENDATION, 'Sem recomendação'],
    [Status.LOCAL_ONLY, 'Vínculo exclusivamente local'],
  ])('preserva o texto de %s', (coverageStatus, label) => {
    expect(resolveCoverageStatusLabel({
      coverageStatus,
      hasAnyAdoptedExam: true,
      missingCount: 2,
    })).toBe(label);
  });
});
