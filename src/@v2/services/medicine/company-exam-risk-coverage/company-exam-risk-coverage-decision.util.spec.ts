/**
 * npx tsx src/@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-decision.util.spec.ts
 */
import assert from 'node:assert/strict';

import { CompanyExamRiskCoverageStatusEnum } from './company-exam-risk-coverage.types';
import {
  ExamRiskCoverageDecisionGroupEnum,
  bucketCoverageItemsByDecision,
  resolveCoverageDecisionGroup,
} from './company-exam-risk-coverage-decision.util';

const base = {
  riskId: 'r1',
  riskName: 'Ruído',
  riskGroup: { name: 'Físicos', id: 'FIS' },
  riskSubgroup: { id: '1', name: 'Ruído' },
  adoptedExams: [],
  recommendedExams: [],
  missingRecommendedExams: [],
  localOnlyExams: [],
  adoptedCount: 0,
  recommendedCount: 0,
  missingCount: 0,
  localOnlyCount: 0,
  hasAnyAdoptedExam: false,
  hasAnyRecommendation: false,
  coverageStatus: CompanyExamRiskCoverageStatusEnum.COMPLETE,
};

assert.equal(
  resolveCoverageDecisionGroup({
    ...base,
    coverageStatus: CompanyExamRiskCoverageStatusEnum.MISSING_RECOMMENDED_EXAMS,
    hasAnyAdoptedExam: false,
    missingCount: 2,
    hasAnyRecommendation: true,
  }),
  ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE,
);

assert.equal(
  resolveCoverageDecisionGroup({
    ...base,
    coverageStatus: CompanyExamRiskCoverageStatusEnum.MISSING_RECOMMENDED_EXAMS,
    hasAnyAdoptedExam: true,
    missingCount: 1,
    hasAnyRecommendation: true,
  }),
  ExamRiskCoverageDecisionGroupEnum.PARTIALLY_ADOPTED,
);

assert.equal(
  resolveCoverageDecisionGroup({
    ...base,
    coverageStatus: CompanyExamRiskCoverageStatusEnum.NO_LIBRARY_RECOMMENDATION,
  }),
  ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION,
);

assert.equal(
  resolveCoverageDecisionGroup({
    ...base,
    coverageStatus: CompanyExamRiskCoverageStatusEnum.LOCAL_ONLY,
    hasAnyAdoptedExam: true,
  }),
  ExamRiskCoverageDecisionGroupEnum.LOCAL_ONLY,
);

assert.equal(
  resolveCoverageDecisionGroup({
    ...base,
    coverageStatus: CompanyExamRiskCoverageStatusEnum.COMPLETE,
    hasAnyAdoptedExam: true,
    hasAnyRecommendation: true,
  }),
  null,
);

const buckets = bucketCoverageItemsByDecision([
  {
    ...base,
    riskId: 'a',
    coverageStatus: CompanyExamRiskCoverageStatusEnum.MISSING_RECOMMENDED_EXAMS,
    hasAnyAdoptedExam: false,
    hasAnyRecommendation: true,
    missingCount: 2,
  },
  {
    ...base,
    riskId: 'b',
    coverageStatus: CompanyExamRiskCoverageStatusEnum.NO_LIBRARY_RECOMMENDATION,
  },
]);

assert.equal(
  buckets[ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE]
    .length,
  1,
);
assert.equal(
  buckets[ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION].length,
  1,
);

console.log('company-exam-risk-coverage-decision.util.spec.ts OK');
