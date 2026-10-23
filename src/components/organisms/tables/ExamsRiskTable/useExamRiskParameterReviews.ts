import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { companyExamRiskCoverageQueryKeys } from '@v2/services/medicine/company-exam-risk-coverage/hooks/company-exam-risk-coverage.query-keys';
import type { ICompanyExamRiskCoverageItem } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import {
  examRiskReviewQueryKeys,
  fetchExamRiskParameterReviews,
  updateExamRiskParameterReview,
} from '@v2/services/medicine/company-exam-risk-parameter-review/company-exam-risk-parameter-review.service';
import type {
  ExamRiskParameterReview,
  ExamRiskReviewIdentity,
  ExamRiskReviewScope,
} from '@v2/services/medicine/company-exam-risk-parameter-review/company-exam-risk-parameter-review.types';

export function useExamRiskParameterReviews(
  { companyId, riskId, workspaceId }: ExamRiskReviewScope,
  data: ICompanyExamRiskCoverageItem,
) {
  const scope = { companyId, riskId, workspaceId };
  const cache = useQueryClient();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const session = useMemo(
    () => ({ active: true, saving: false }),
    [scope.companyId, scope.workspaceId, scope.riskId],
  );
  useEffect(() => {
    session.active = true;
    setPending(false);
    setMessage('');
    return () => {
      session.active = false;
    };
  }, [session]);
  const riskKey = examRiskReviewQueryKeys.risk(scope);
  const query = useQuery({
    // A changed detail gets its own request; never carry another snapshot/scope forward.
    queryKey: [
      ...riskKey,
      scope.workspaceId ?? null,
      data.recommendedExams,
      data.adoptedExams,
    ],
    queryFn: () => fetchExamRiskParameterReviews(scope),
    enabled:
      Boolean(scope.companyId && scope.riskId) &&
      data.recommendedExams.some(
        (exam) => exam.recommendationSource && exam.matchedAdoptedLinks?.length,
      ),
    staleTime: 0,
    retry: false,
  });
  const refreshReviews = () =>
    cache.invalidateQueries({ queryKey: riskKey }, { throwOnError: true });
  const refreshComparison = () =>
    Promise.all([
      refreshReviews(),
      cache.invalidateQueries(
        {
          queryKey: companyExamRiskCoverageQueryKeys.detail({
            ...scope,
            onlyPcmso: true,
          }),
        },
        { throwOnError: true },
      ),
    ]);
  const save = async (
    identity: ExamRiskReviewIdentity,
    review: ExamRiskParameterReview,
    action: 'ACCEPT' | 'REOPEN',
  ) => {
    if (
      !session.active ||
      session.saving ||
      query.isFetching ||
      query.isError ||
      identity.companyId !== scope.companyId ||
      identity.riskId !== scope.riskId
    )
      return;
    if (
      action === 'ACCEPT'
        ? !review.canReview || review.state !== 'UNREVIEWED'
        : !review.canReopen || review.state !== 'ACCEPTED'
    )
      return;
    session.saving = true;
    setPending(true);
    setMessage('');
    try {
      await updateExamRiskParameterReview(scope, {
        action,
        linkId: identity.linkId,
        ruleId: identity.ruleId,
        ruleExamId: identity.ruleExamId,
        group: review.group,
        expectedFingerprint: review.fingerprint,
        expectedVersion: review.version,
      });
      try {
        await refreshComparison();
      } catch {
        if (session.active)
          setMessage(
            'Decisão salva, mas não foi possível atualizar a comparação. Tente atualizar novamente.',
          );
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        try {
          await refreshComparison();
          if (session.active)
            setMessage(
              'Os dados mudaram. A comparação foi atualizada; tente novamente.',
            );
        } catch {
          if (session.active)
            setMessage(
              'Os dados mudaram e não foi possível atualizar a comparação. Tente novamente.',
            );
        }
      } else if (session.active)
        setMessage('Não foi possível registrar a decisão. Tente novamente.');
    } finally {
      session.saving = false;
      if (session.active) setPending(false);
    }
  };
  return {
    data: query.isFetching || query.isError ? undefined : query.data,
    pending: pending || query.isFetching,
    message,
    loadError: query.isError,
    refreshReviews,
    save,
  };
}
