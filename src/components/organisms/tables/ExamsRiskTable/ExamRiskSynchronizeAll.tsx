import { useEffect, useRef, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { useIsMutating, useMutation } from 'react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import { api } from 'core/services/apiClient';
import { updateExam } from 'core/services/hooks/mutations/checklist/exams/useMutUpdateExamRisk/useMutUpdateExamRisk';
import { examRiskRuleQueryKeys } from '@v2/services/medicine/exam-risk-rule/hooks/exam-risk-rule.query-keys';
import type { ICompanyExamRiskCoverageExamSummary as Exam } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import type { IExamToRisk } from 'core/interfaces/api/IExam';
import {
  canEditInlineParameter,
  loadInlineRiskLinks,
  type InlineParameterGroup,
  type InlineRiskScope,
} from './exam-risk-inline-parameter.util';
import { savingItems, savingLinks } from './exam-risk-parameter-saving';
import {
  buildSynchronizationPlan,
  runSynchronization,
} from './exam-risk-sync.util';

type Rule = {
  updated_at: string;
  quantitativeLimitApplicable?: boolean;
  exams: Array<{ id: string; updated_at: string }>;
};
export function ExamRiskSynchronizeAll({
  destination,
  quantitativeLimitApplicable,
  recommended,
  adopted,
  link,
  groups,
  scope,
  onSaved,
}: {
  destination: 'library' | 'company';
  quantitativeLimitApplicable?: boolean;
  recommended?: Exam;
  adopted?: Exam;
  link?: IExamToRisk;
  groups: InlineParameterGroup[];
  scope: InlineRiskScope;
  onSaved: () => Promise<void>;
}) {
  const { isMasterAdmin, isAuthSuccess } = useAuthShow();
  const canUpdate = isAuthSuccess({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'u',
  });
  const cache = useQueryClient();
  const library = destination === 'library';
  const provenance = recommended?.recommendationSource;
  const key = library
    ? (provenance?.ruleExamId ?? '')
    : `${scope.companyId}:${adopted?.linkId}`;
  const mutationKey = [
    library ? 'library-inline-parameter' : 'exam-risk-inline-parameter',
    key,
  ];
  const pending = useIsMutating({ mutationKey }) > 0;
  const locks = library ? savingItems : savingLinks;
  const active = useRef(true);
  const generation = useRef(0);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      generation.current++;
    };
  }, [
    scope.companyId,
    scope.workspaceId,
    scope.riskId,
    adopted?.linkId,
    provenance?.ruleExamId,
  ]);
  const [message, setMessage] = useState('');
  const { data: metadata } = useQuery({
    queryKey: examRiskRuleQueryKeys.detail(provenance?.ruleId ?? ''),
    queryFn: async () =>
      (
        await api.get<Rule>(
          `/v2/master/exam-risk-rules/${encodeURIComponent(provenance!.ruleId)}`,
        )
      ).data,
    enabled:
      library &&
      isMasterAdmin &&
      Boolean(provenance) &&
      groups.includes('minRiskDegreeQuantity'),
  });
  const eligible = groups.filter(
    (group) =>
      (group !== 'minRiskDegreeQuantity' ||
        quantitativeLimitApplicable === true) &&
      (library
        ? group !== 'minRiskDegreeQuantity' ||
          metadata?.quantitativeLimitApplicable === true
        : Boolean(link && canEditInlineParameter(group, link))),
  );
  const permitted = Boolean(
    provenance &&
      recommended?.config &&
      adopted?.config &&
      adopted.linkId != null &&
      (library
        ? isMasterAdmin
        : canUpdate &&
          link &&
          link.companyId === scope.companyId &&
          link.riskId === scope.riskId &&
          link.id === adopted.linkId &&
          link.examId === adopted.examId),
  );
  const mutation = useMutation(
    async () => {
      if (!permitted || !eligible.length || locks.has(key)) return;
      locks.add(key);
      const started = generation.current;
      const current = () => active.current && generation.current === started;
      setMessage('');
      let completed = 0;
      let failure: unknown;
      try {
        const source = library ? adopted!.config! : recommended!.config!;
        if (library) {
          const plans = await buildSynchronizationPlan(
            eligible,
            source,
            recommended!.config!,
          );
          let itemStamp = provenance!.itemUpdatedAt;
          let ruleStamp = provenance!.ruleUpdatedAt;
          const result = await runSynchronization(plans, async (plan) => {
            if (!current()) throw new Error('Comparação encerrada.');
            const path = `/v2/master/exam-risk-rules/${encodeURIComponent(provenance!.ruleId)}`;
            // Never retry a failed CAS. Between our writes, verify the exact item version returned by the previous write.
            const rule = (await api.get<Rule>(path)).data;
            const item = rule.exams.find(
              (entry) => entry.id === provenance!.ruleExamId,
            );
            if (
              !item ||
              item.updated_at !== itemStamp ||
              (completed === 0 && rule.updated_at !== ruleStamp)
            )
              throw new Error('A recomendação mudou. Atualize a comparação.');
            if (
              plan.group === 'minRiskDegreeQuantity' &&
              rule.quantitativeLimitApplicable !== true
            )
              throw new Error('Critério quantitativo não aplicável.');
            if (!current()) throw new Error('Comparação encerrada.');
            const saved = (
              await api.patch<{ id: string; updated_at: string }>(
                `${path}/exams/${encodeURIComponent(provenance!.ruleExamId)}`,
                {
                  group: plan.group,
                  patch: plan.patch,
                  expectedRuleUpdatedAt: rule.updated_at,
                  expectedItemUpdatedAt: itemStamp,
                },
              )
            ).data;
            completed++;
            if (saved.id !== provenance!.ruleExamId || !saved.updated_at)
              throw new Error('Não foi possível confirmar a versão salva.');
            itemStamp = saved.updated_at;
            ruleStamp = rule.updated_at;
          });
          failure = result.error;
        } else {
          const fresh = (await loadInlineRiskLinks(scope)).find(
            (entry) =>
              entry.id === link!.id &&
              entry.examId === link!.examId &&
              entry.riskId === scope.riskId &&
              entry.companyId === scope.companyId,
          );
          if (!fresh || !current())
            throw new Error('Vínculo indisponível. Atualize a comparação.');
          const plans = await buildSynchronizationPlan(
            eligible,
            source,
            fresh,
            scope,
            fresh,
          );
          const patch = Object.assign({}, ...plans.map((plan) => plan.patch));
          if (!current()) throw new Error('Comparação encerrada.');
          const saved = await updateExam(patch, scope.companyId);
          if (
            !saved ||
            saved.id !== fresh.id ||
            saved.examId !== fresh.examId ||
            saved.riskId !== scope.riskId
          )
            throw new Error('Não foi possível confirmar a gravação.');
          completed = plans.length;
        }
      } catch (error) {
        failure = error;
      } finally {
        try {
          if (library)
            await cache.invalidateQueries({
              queryKey: examRiskRuleQueryKeys.all(),
            });
          await onSaved();
        } catch {
          failure = new Error(
            'Não foi possível atualizar a comparação. Recarregue os dados.',
          );
        }
        locks.delete(key);
      }
      if (current())
        setMessage(
          failure
            ? `${completed} de ${eligible.length} grupos sincronizados. ${String((failure as any)?.response?.data?.message || (failure as Error)?.message || 'Falha na gravação.')}`
            : `${completed} grupo(s) sincronizado(s).`,
        );
    },
    { mutationKey },
  );
  if (!permitted || !eligible.length)
    return message ? (
      <Typography component="span" variant="caption" role="status">
        {message}
      </Typography>
    ) : null;
  return (
    <>
      <Button
        size="small"
        disabled={pending}
        sx={{ ml: 1, py: 0, minWidth: 0, fontSize: '0.7rem' }}
        aria-label={`Sincronizar tudo para ${library ? 'a Biblioteca' : `a empresa, vínculo ${adopted?.linkId}`}`}
        onClick={(event) => {
          event.stopPropagation();
          if (!pending && !locks.has(key)) mutation.mutate();
        }}
      >
        {pending ? 'Sincronizando…' : 'Sincronizar tudo'}
      </Button>
      {message && (
        <Typography
          component="span"
          variant="caption"
          role="status"
          sx={{ ml: 1 }}
        >
          {message}
        </Typography>
      )}
    </>
  );
}
