import { api } from 'core/services/apiClient';
import {
  fetchExamRiskRecommendationDecisions,
  updateExamRiskRecommendationDecision,
} from './company-exam-risk-recommendation-decision.service';
import {
  canDecideRecommendation,
  isNotAdoptedByDecision,
  recommendationDecisionPatch,
  resolveCurrentDecisionExam,
} from './company-exam-risk-recommendation-decision.util';
jest.mock('core/services/apiClient', () => ({
  api: { get: jest.fn(), patch: jest.fn() },
}));
const scope = {
  companyId: 'company',
  workspaceId: 'workspace',
  riskId: 'risk',
};
const exam = {
  examId: 69,
  examName: 'nome exibido',
  config: {},
  isAdopted: false,
  isMissing: true,
  adoptionState: 'PENDING',
  recommendationSource: { ruleId: 'rule', ruleExamId: 'item' },
  nonAdoptionDecision: {
    fingerprint: 'a'.repeat(64),
    version: null,
    active: false,
    valid: false,
  },
} as any;
const detail = { riskId: 'risk', recommendedExams: [exam] } as any;
beforeEach(() => jest.clearAllMocks());
it('uses GET and PATCH with workspace and exact source/version, without copying parameters', async () => {
  (api.get as jest.Mock).mockResolvedValue({ data: detail });
  (api.patch as jest.Mock).mockResolvedValue({ data: detail });
  expect(await fetchExamRiskRecommendationDecisions(scope)).toBe(detail);
  expect(api.get).toHaveBeenCalledWith(
    '/v2/companies/company/exam-risk-recommendation-decisions/risk',
    { params: { workspaceId: 'workspace' } },
  );
  const patch = recommendationDecisionPatch(scope, exam, 'DECLINE');
  expect(patch).toEqual({
    workspaceId: 'workspace',
    action: 'DECLINE',
    ruleId: 'rule',
    ruleExamId: 'item',
    recommendedExamId: 69,
    expectedFingerprint: 'a'.repeat(64),
    expectedVersion: null,
    reason: null,
  });
  await updateExamRiskRecommendationDecision(scope, patch);
  expect(api.patch).toHaveBeenCalledWith(
    '/v2/companies/company/exam-risk-recommendation-decisions/risk',
    patch,
  );
  expect(patch).not.toHaveProperty('config');
});
it.each([
  undefined,
  '',
  '   ',
  'Exame redundante — finalidade já contemplada por outro exame.',
  'Motivo próprio',
])('accepts optional and free reasons %s', (reason) => {
  expect(
    recommendationDecisionPatch(scope, exam, 'DECLINE', reason).reason,
  ).toBe(reason?.trim() || null);
});
it('reconsiders only a valid non-adoption', () => {
  expect(() =>
    recommendationDecisionPatch(scope, exam, 'RECONSIDER'),
  ).toThrow();
  const declined = {
    ...exam,
    isMissing: false,
    adoptionState: 'NOT_ADOPTED',
    nonAdoptionDecision: {
      ...exam.nonAdoptionDecision,
      version: 'version',
      active: true,
      valid: true,
    },
  };
  expect(isNotAdoptedByDecision(declined)).toBe(true);
  expect(
    recommendationDecisionPatch(scope, declined, 'RECONSIDER').expectedVersion,
  ).toBe('version');
  expect(isNotAdoptedByDecision({ ...declined, isAdopted: true })).toBe(false);
});
it('blocks missing provenance, unavailable versions and adopted matches', () => {
  for (const override of [
    { recommendationSource: null },
    { nonAdoptionDecision: null },
    { nonAdoptionDecision: { fingerprint: 'a'.repeat(64) } },
    { isAdopted: true },
    { matchedAdoptedLinks: [{ linkId: 1, examId: 69 }] },
  ])
    expect(canDecideRecommendation({ ...exam, ...override })).toBe(false);
  expect(() =>
    recommendationDecisionPatch({ ...scope, workspaceId: '' }, exam, 'DECLINE'),
  ).toThrow();
  expect(() =>
    recommendationDecisionPatch(scope, exam, 'DECLINE', 'x'.repeat(2001)),
  ).toThrow();
});
it('revalidates exact identity and snapshot, never the display name', () => {
  expect(
    resolveCurrentDecisionExam(detail, 'risk', {
      ...exam,
      examName: 'outro texto',
    }),
  ).toBe(exam);
  for (const current of [
    { ...exam, examId: 70 },
    { ...exam, recommendationSource: { ruleId: 'other', ruleExamId: 'item' } },
    {
      ...exam,
      nonAdoptionDecision: { ...exam.nonAdoptionDecision, version: 'new' },
    },
    {
      ...exam,
      nonAdoptionDecision: {
        ...exam.nonAdoptionDecision,
        fingerprint: 'b'.repeat(64),
      },
    },
    { ...exam, isAdopted: true },
  ]) {
    try {
      resolveCurrentDecisionExam(
        { ...detail, recommendedExams: [current] },
        'risk',
        exam,
      );
      throw Error('expected conflict');
    } catch (error: any) {
      expect(error.response?.status).toBe(409);
    }
  }
  expect(() =>
    resolveCurrentDecisionExam(
      { ...detail, recommendedExams: [exam, exam] },
      'risk',
      exam,
    ),
  ).toThrow();
});
it('does not call API without workspace and propagates HTTP failures', async () => {
  await expect(
    fetchExamRiskRecommendationDecisions({ ...scope, workspaceId: '' }),
  ).rejects.toThrow();
  expect(api.get).not.toHaveBeenCalled();
  const conflict = { response: { status: 409 } };
  (api.patch as jest.Mock).mockRejectedValue(conflict);
  await expect(
    updateExamRiskRecommendationDecision(
      scope,
      recommendationDecisionPatch(scope, exam, 'DECLINE'),
    ),
  ).rejects.toBe(conflict);
});
