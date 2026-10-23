import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IconButton, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAuthShow } from 'components/molecules/SAuthShow';
import type { ICompanyExamRiskCoverageExamSummary } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import {
  deleteContextualLibraryRecommendation,
  fetchLibraryDeletionEligibility,
  ContextualLibraryDeleteParams,
} from '@v2/services/medicine/company-exam-risk-coverage/contextual-library-delete.service';
import { examRiskRuleQueryKeys } from '@v2/services/medicine/exam-risk-rule/hooks/exam-risk-rule.query-keys';
import { InlineRiskScope } from './exam-risk-inline-parameter.util';
export function ExamRiskDeleteLibrary({
  scope,
  exam,
  onSaved,
}: {
  scope: InlineRiskScope;
  exam?: ICompanyExamRiskCoverageExamSummary;
  onSaved: () => Promise<void>;
}) {
  const { isMasterAdmin } = useAuthShow();
  const source = exam?.recommendationSource;
  const params: ContextualLibraryDeleteParams | undefined =
    source && scope.workspaceId
      ? {
          companyId: scope.companyId,
          workspaceId: scope.workspaceId,
          riskId: scope.riskId,
          ruleId: source.ruleId,
          ruleExamId: source.ruleExamId,
          examId: exam!.examId,
          expectedRuleUpdatedAt: source.ruleUpdatedAt,
          expectedItemUpdatedAt: source.itemUpdatedAt,
        }
      : undefined;
  const cache = useQueryClient();
  const eligibility = useQuery({
    queryKey: ['library-deletion-eligibility', params],
    queryFn: () => fetchLibraryDeletionEligibility(params!),
    enabled: Boolean(isMasterAdmin && params),
    retry: false,
    staleTime: 0,
  });
  const busy = useRef(false);
  const generation = useRef(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(
    () => () => {
      generation.current++;
      busy.current = false;
    },
    [
      scope.companyId,
      scope.workspaceId,
      scope.riskId,
      source?.ruleId,
      source?.ruleExamId,
      source?.ruleUpdatedAt,
      source?.itemUpdatedAt,
    ],
  );
  if (!isMasterAdmin || !params || !exam) return null;
  const remove = async () => {
    if (busy.current || !eligibility.data?.eligible) return;
    if (
      !window.confirm(
        `A recomendação de ${exam.examName} para ${scope.riskName} será removida da Biblioteca global e deixará de ser sugerida. O catálogo e os vínculos empresariais serão preservados. Continuar?`,
      )
    )
      return;
    if (
      !window.confirm(
        `Confirmar definitivamente a exclusão da recomendação ${exam.examName} × ${scope.riskName} (regra ${params.ruleId}, item ${params.ruleExamId})?`,
      )
    )
      return;
    const request = generation.current;
    busy.current = true;
    setPending(true);
    setMessage('');
    try {
      const result = await deleteContextualLibraryRecommendation(params);
      if (!result.deleted) throw new Error('A API não confirmou a exclusão.');
      if (request !== generation.current) return;
      setMessage('Recomendação removida da Biblioteca.');
      try {
        await Promise.all([
          onSaved(),
          cache.invalidateQueries({ queryKey: examRiskRuleQueryKeys.all() }),
          cache.invalidateQueries({
            queryKey: ['library-deletion-eligibility'],
          }),
        ]);
      } catch {
        if (request === generation.current)
          setMessage(
            'Recomendação removida, mas a atualização falhou. Atualize a tela.',
          );
      }
    } catch (error) {
      if (request === generation.current) {
        setMessage(
          (error as any)?.response?.data?.message ||
            (error as Error)?.message ||
            'Não foi possível remover a recomendação.',
        );
        if ((error as any)?.response?.status === 409) {
          try {
            await Promise.all([onSaved(), eligibility.refetch()]);
          } catch {
            /* Keep the original conflict message. */
          }
        }
      }
    } finally {
      if (request === generation.current) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  return (
    <>
      {eligibility.data?.eligible && (
        <Tooltip title="Remover recomendação da Biblioteca">
          <span>
            <IconButton
              size="small"
              aria-label={`Excluir recomendação da Biblioteca: ${exam.examName}`}
              disabled={pending}
              onClick={(event) => {
                event.stopPropagation();
                void remove();
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {message && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          role="status"
        >
          {message}
        </Typography>
      )}
    </>
  );
}
