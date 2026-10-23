import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateExamRiskParameterReview,
  fetchExamRiskParameterReviews,
} from '@v2/services/medicine/company-exam-risk-parameter-review/company-exam-risk-parameter-review.service';
import { useExamRiskParameterReviews } from './useExamRiskParameterReviews';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useMemo: (fn) => fn(),
  useEffect: jest.fn((fn) => fn()),
  useState: jest.fn((value) => [value, jest.fn()]),
}));
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));
jest.mock(
  '@v2/services/medicine/company-exam-risk-parameter-review/company-exam-risk-parameter-review.service',
  () => ({
    fetchExamRiskParameterReviews: jest.fn(),
    updateExamRiskParameterReview: jest.fn(),
    examRiskReviewQueryKeys: {
      risk: ({ companyId, riskId }) => [
        'exam-risk-parameter-reviews',
        companyId,
        riskId,
      ],
    },
  }),
);
const scope = {
  companyId: 'company',
  riskId: 'risk',
  workspaceId: 'workspace',
};
const identity = {
  companyId: 'company',
  riskId: 'risk',
  linkId: 283,
  adoptedExamId: 12,
  recommendedExamId: 69,
  ruleId: 'rule',
  ruleExamId: 'item',
};
const review = {
  group: 'age',
  state: 'UNREVIEWED',
  canReview: true,
  canReopen: false,
  fingerprint: 'hash',
  version: null,
} as any;
const data = {
  recommendedExams: [
    {
      recommendationSource: { ruleId: 'rule' },
      matchedAdoptedLinks: [{ linkId: 283, examId: 12 }],
    },
  ],
  adoptedExams: [{ linkId: 283, examId: 12 }],
} as any;
let cache: any;
const messageSetter = () =>
  (useState as jest.Mock).mock.results[1].value[1] as jest.Mock;
const pendingSetter = () =>
  (useState as jest.Mock).mock.results[0].value[1] as jest.Mock;

describe('shared review loading/save/refetch flow (mocked hook dependencies)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache = {
      invalidateQueries: jest.fn().mockResolvedValue(undefined),
      setQueryData: jest.fn(),
    };
    (useQueryClient as jest.Mock).mockReturnValue(cache);
    (useQuery as jest.Mock).mockReturnValue({
      data: { companyId: 'company' },
      isFetching: false,
      isError: false,
    });
    (updateExamRiskParameterReview as jest.Mock)
      .mockReset()
      .mockResolvedValue(undefined);
  });
  it('loads per expanded risk with scope and snapshot-isolated cache keys', async () => {
    useExamRiskParameterReviews(scope, data);
    const options = (useQuery as jest.Mock).mock.calls[0][0];
    expect(options.enabled).toBe(true);
    expect(options.queryKey).toEqual([
      'exam-risk-parameter-reviews',
      'company',
      'risk',
      'workspace',
      data.recommendedExams,
      data.adoptedExams,
    ]);
    await options.queryFn();
    expect(fetchExamRiskParameterReviews).toHaveBeenCalledWith(scope);
    useExamRiskParameterReviews(
      { ...scope, companyId: 'other', workspaceId: 'other-workspace' },
      data,
    );
    expect(
      (useQuery as jest.Mock).mock.calls[1][0].queryKey.slice(0, 4),
    ).toEqual([
      'exam-risk-parameter-reviews',
      'other',
      'risk',
      'other-workspace',
    ]);
  });
  it('does not request unavailable/indirect provenance', () => {
    useExamRiskParameterReviews(scope, {
      ...data,
      recommendedExams: [{ matchedAdoptedLinks: [] }],
    });
    expect((useQuery as jest.Mock).mock.calls[0][0].enabled).toBe(false);
  });
  it.each(['ACCEPT', 'REOPEN'] as const)(
    'saves %s and invalidates only reviews and the expanded detail, without optimistic updates',
    async (action) => {
      const hook = useExamRiskParameterReviews(scope, data);
      const current =
        action === 'REOPEN'
          ? {
              ...review,
              state: 'ACCEPTED',
              canReopen: true,
              version: 'uuid-version',
            }
          : review;
      await hook.save(identity, current, action);
      expect(updateExamRiskParameterReview).toHaveBeenCalledWith(scope, {
        action,
        linkId: 283,
        ruleId: 'rule',
        ruleExamId: 'item',
        group: 'age',
        expectedFingerprint: 'hash',
        expectedVersion: current.version,
      });
      expect(cache.invalidateQueries).toHaveBeenCalledTimes(2);
      expect(cache.invalidateQueries.mock.calls[0][0].queryKey).toEqual([
        'exam-risk-parameter-reviews',
        'company',
        'risk',
      ]);
      expect(cache.invalidateQueries.mock.calls[1][0].queryKey).toEqual([
        'company-exam-risk-coverage',
        'detail',
        { ...scope, onlyPcmso: true },
      ]);
      expect(cache.setQueryData).not.toHaveBeenCalled();
      expect(pendingSetter()).toHaveBeenCalledWith(true);
      expect(pendingSetter()).toHaveBeenLastCalledWith(false);
    },
  );
  it('prevents duplicate same-tick saves and keeps the action blocked through refresh', async () => {
    let finish!: () => void;
    (updateExamRiskParameterReview as jest.Mock).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const hook = useExamRiskParameterReviews(scope, data);
    const first = hook.save(identity, review, 'ACCEPT');
    await hook.save(identity, review, 'ACCEPT');
    expect(updateExamRiskParameterReview).toHaveBeenCalledTimes(1);
    finish();
    await first;
  });
  it('refreshes on HTTP 409 and reports changed data without pretending it saved', async () => {
    (updateExamRiskParameterReview as jest.Mock).mockRejectedValueOnce({
      response: { status: 409 },
    });
    await useExamRiskParameterReviews(scope, data).save(
      identity,
      review,
      'ACCEPT',
    );
    expect(cache.invalidateQueries).toHaveBeenCalledTimes(2);
    expect(messageSetter()).toHaveBeenLastCalledWith(
      'Os dados mudaram. A comparação foi atualizada; tente novamente.',
    );
    expect(cache.setQueryData).not.toHaveBeenCalled();
  });
  it('preserves confirmed data on failures and distinguishes refresh failures after success', async () => {
    (updateExamRiskParameterReview as jest.Mock).mockRejectedValueOnce(
      new Error('API unavailable'),
    );
    await useExamRiskParameterReviews(scope, data).save(
      identity,
      review,
      'ACCEPT',
    );
    expect(cache.invalidateQueries).not.toHaveBeenCalled();
    expect(messageSetter()).toHaveBeenLastCalledWith(
      'Não foi possível registrar a decisão. Tente novamente.',
    );
  });
  it('reports a successful save with failed refresh distinctly', async () => {
    cache.invalidateQueries.mockRejectedValue(new Error('refresh unavailable'));
    await useExamRiskParameterReviews(scope, data).save(
      identity,
      review,
      'ACCEPT',
    );
    expect(messageSetter()).toHaveBeenLastCalledWith(
      'Decisão salva, mas não foi possível atualizar a comparação. Tente atualizar novamente.',
    );
  });
  it('does not act on unavailable permissions, another scope or an unmounted comparison', async () => {
    const hook = useExamRiskParameterReviews(scope, data);
    await hook.save(identity, { ...review, canReview: false }, 'ACCEPT');
    await hook.save({ ...identity, companyId: 'other' }, review, 'ACCEPT');
    (useEffect as jest.Mock).mock.results[0].value();
    await hook.save(identity, review, 'ACCEPT');
    expect(updateExamRiskParameterReview).not.toHaveBeenCalled();
  });
  it('does not expose stale acceptance data during fetch/error', () => {
    for (const state of [
      { isFetching: true, isError: false },
      { isFetching: false, isError: true },
    ]) {
      (useQuery as jest.Mock).mockReturnValue({
        ...state,
        data: { companyId: 'company' },
      });
      expect(useExamRiskParameterReviews(scope, data).data).toBeUndefined();
    }
  });
});
