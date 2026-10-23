import { api } from 'core/services/apiClient';
import {
  fetchExamRiskParameterReviews,
  updateExamRiskParameterReview,
} from './company-exam-risk-parameter-review.service';
import { findDisplayedParameterReview } from './company-exam-risk-parameter-review.util';
import type {
  ExamRiskReviewGroup,
  ExamRiskReviewIdentity,
  ExamRiskReviewResponse,
} from './company-exam-risk-parameter-review.types';

jest.mock('core/services/apiClient', () => ({
  api: { get: jest.fn(), patch: jest.fn() },
}));
const identity: ExamRiskReviewIdentity = {
  companyId: 'company',
  riskId: 'risk',
  linkId: 283,
  adoptedExamId: 12,
  recommendedExamId: 69,
  ruleId: 'rule',
  ruleExamId: 'item',
};
const recommended = {
  isAdmission: true,
  isPeriodic: true,
  isChange: true,
  isReturn: false,
  isDismissal: true,
  isMale: true,
  isFemale: true,
  fromAge: null,
  toAge: null,
  validityInMonths: 12,
  considerBetweenDays: 0,
  minRiskDegree: 3,
  minRiskDegreeQuantity: 4,
};
const adopted = {
  ...recommended,
  isReturn: true,
  isFemale: false,
  fromAge: 18,
  toAge: 65,
  validityInMonths: 24,
  considerBetweenDays: 90,
  minRiskDegree: 4,
  minRiskDegreeQuantity: 5,
};
const fields = {
  events: ['isAdmission', 'isPeriodic', 'isChange', 'isReturn', 'isDismissal'],
  validityInMonths: ['validityInMonths'],
  sex: ['isMale', 'isFemale'],
  age: ['fromAge', 'toAge'],
  considerBetweenDays: ['considerBetweenDays'],
  minRiskDegree: ['minRiskDegree'],
  minRiskDegreeQuantity: ['minRiskDegreeQuantity'],
};
function fixture(group: ExamRiskReviewGroup = 'minRiskDegree') {
  return {
    companyId: 'company',
    riskId: 'risk',
    comparisons: [
      {
        ...identity,
        groups: [
          {
            group,
            state: 'ACCEPTED',
            fingerprint: 'fingerprint',
            version: 'version',
            actorUserId: 7,
            decidedAt: 'date',
            canReview: true,
            canReopen: true,
            hasAcceptance: true,
            snapshot: {
              recommended: fields[group].map((key) => recommended[key]),
              adopted: fields[group].map((key) => adopted[key]),
            },
          },
        ],
      },
    ],
  } as ExamRiskReviewResponse;
}
const find = (
  response: ExamRiskReviewResponse | undefined,
  group: ExamRiskReviewGroup = 'minRiskDegree',
  id = identity,
  right = adopted,
) =>
  findDisplayedParameterReview(
    response,
    id,
    group,
    fields[group] as any,
    recommended,
    right,
  );

describe('parameter review contract and displayed snapshot', () => {
  beforeEach(() => jest.clearAllMocks());
  it('fetches once per risk scope, including workspace', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: fixture() });
    expect(
      await fetchExamRiskParameterReviews({
        companyId: 'company',
        riskId: 'risk',
        workspaceId: 'workspace',
      }),
    ).toEqual(fixture());
    expect(api.get).toHaveBeenCalledWith(
      '/v2/companies/company/exam-risk-parameter-reviews/risk',
      { params: { workspaceId: 'workspace' } },
    );
  });
  it.each(['ACCEPT', 'REOPEN'] as const)(
    'sends only decision/context/version for %s',
    async (action) => {
      const patch = {
        action,
        linkId: 283,
        ruleId: 'rule',
        ruleExamId: 'item',
        group: 'age' as const,
        expectedFingerprint: 'fingerprint',
        expectedVersion: null,
      };
      await updateExamRiskParameterReview(
        { companyId: 'company', riskId: 'risk', workspaceId: 'workspace' },
        patch,
      );
      expect(api.patch).toHaveBeenCalledWith(
        '/v2/companies/company/exam-risk-parameter-reviews/risk',
        { ...patch, workspaceId: 'workspace' },
      );
    },
  );
  it.each(Object.keys(fields))(
    'associates the exact snapshot for %s (including null/false/zero)',
    (group) => {
      const response = fixture(group as ExamRiskReviewGroup);
      expect(find(response, group as ExamRiskReviewGroup)?.state).toBe(
        'ACCEPTED',
      );
      expect(
        find(response, group as ExamRiskReviewGroup, identity, {
          ...adopted,
          [fields[group][0]]: undefined,
        }),
      ).toBeUndefined();
    },
  );
  it('rejects different companies, risks, links, exams and recommendation sources', () => {
    for (const change of [
      { companyId: 'other' },
      { riskId: 'other' },
      { linkId: 284 },
      { adoptedExamId: 13 },
      { recommendedExamId: 70 },
      { ruleId: 'other' },
      { ruleExamId: 'other' },
    ])
      expect(
        find(fixture(), 'minRiskDegree', { ...identity, ...change }),
      ).toBeUndefined();
    expect(find(undefined)).toBeUndefined();
  });
  it('rejects ambiguous pairs/groups instead of choosing one', () => {
    const response = fixture();
    response.comparisons.push({ ...response.comparisons[0] });
    expect(find(response)).toBeUndefined();
    response.comparisons.pop();
    response.comparisons[0].groups.push({
      ...response.comparisons[0].groups[0],
    });
    expect(find(response)).toBeUndefined();
  });
  it('acceptance applies again at A -> B -> A, without altering any values', () => {
    const response = fixture();
    const before = JSON.stringify({ response, recommended, adopted });
    expect(find(response)?.state).toBe('ACCEPTED');
    expect(
      find(response, 'minRiskDegree', identity, {
        ...adopted,
        minRiskDegree: 5,
      }),
    ).toBeUndefined();
    expect(find(response)?.state).toBe('ACCEPTED');
    expect(JSON.stringify({ response, recommended, adopted })).toBe(before);
  });
  it('propagates API errors without reporting a successful decision', async () => {
    const error = { response: { status: 409 } };
    (api.patch as jest.Mock).mockRejectedValueOnce(error);
    await expect(
      updateExamRiskParameterReview(
        { companyId: 'company', riskId: 'risk' },
        {
          action: 'ACCEPT',
          linkId: 283,
          ruleId: 'rule',
          ruleExamId: 'item',
          group: 'age',
          expectedFingerprint: 'hash',
          expectedVersion: null,
        },
      ),
    ).rejects.toBe(error);
  });
});
