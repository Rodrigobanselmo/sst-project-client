import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIsMutating, useMutation } from 'react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { examRiskRuleQueryKeys } from '@v2/services/medicine/exam-risk-rule/hooks/exam-risk-rule.query-keys';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { api } from 'core/services/apiClient';
import type { ICompanyExamRiskCoverageExamSummary as Exam } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import { ExamRiskInlineControls } from './ExamRiskInlineControls';
import type { IPcmsoComparableConfig as Config } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import {
  inlineParameterCopyDraft,
  inlineParameterDraft,
  inlineParameterLabels,
  type InlineParameterGroup,
  type InlineParameterDraft,
} from './exam-risk-inline-parameter.util';
import { buildLibraryParameterPatch } from './exam-risk-library-parameter.util';

import { savingItems } from './exam-risk-parameter-saving';
type Props = {
  exam: Exam;
  group: InlineParameterGroup;
  confirmedText: string;
  onSaved: () => Promise<void>;
  copyFrom?: Config | null;
  prefix?: (copy?: () => void, pending?: boolean) => ReactNode;
};
export function ExamRiskLibraryInlineParameter({
  exam,
  group,
  confirmedText,
  onSaved,
  copyFrom,
  prefix,
}: Props) {
  const { isMasterAdmin: isMaster } = useAuthShow();
  const cache = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<InlineParameterDraft>({});
  const [error, setError] = useState('');
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const source = exam.recommendationSource;
  const key = source?.ruleExamId ?? '';
  const mutationKey = ['library-inline-parameter', key];
  const pending = useIsMutating({ mutationKey }) > 0;
  // Resolve through the existing MASTER contract; one shared request per rule.
  const { data: ruleMetadata } = useQuery({
    queryKey: examRiskRuleQueryKeys.detail(source?.ruleId ?? ''),
    queryFn: async () =>
      (
        await api.get<{ quantitativeLimitApplicable?: boolean }>(
          `/v2/master/exam-risk-rules/${encodeURIComponent(source!.ruleId)}`,
        )
      ).data,
    enabled: isMaster && Boolean(source) && group === 'minRiskDegreeQuantity',
  });
  const quantitativeApplicable =
    ruleMetadata?.quantitativeLimitApplicable === true;
  const mutation = useMutation(
    async (copyDraft?: InlineParameterDraft) => {
      if (!isMaster || !source || !exam.config || savingItems.has(key))
        throw new Error('Edição indisponível.');
      if (group === 'minRiskDegreeQuantity' && !quantitativeApplicable)
        throw new Error('Critério quantitativo não aplicável.');
      savingItems.add(key);
      try {
        const patch = buildLibraryParameterPatch(
          group,
          copyDraft ?? draft,
          exam.config,
        );
        await api.patch(
          `/v2/master/exam-risk-rules/${encodeURIComponent(source.ruleId)}/exams/${encodeURIComponent(source.ruleExamId)}`,
          {
            group,
            expectedRuleUpdatedAt: source.ruleUpdatedAt,
            expectedItemUpdatedAt: source.itemUpdatedAt,
            patch,
          },
        );
      } finally {
        savingItems.delete(key);
      }
    },
    { mutationKey },
  );
  const save = async (copyDraft?: InlineParameterDraft) => {
    if (!active.current || pending || savingItems.has(key)) return;
    setError('');
    try {
      await mutation.mutateAsync(copyDraft);
    } catch (cause: any) {
      if (active.current)
        setError(
          cause?.response?.status === 409
            ? 'A recomendação foi alterada. Cancele e atualize os dados antes de editar novamente.'
            : cause?.response?.data?.message?.toString() ||
                cause?.message ||
                'Não foi possível salvar.',
        );
      return;
    }
    if (active.current) setEditing(false);
    try {
      await cache.invalidateQueries({ queryKey: examRiskRuleQueryKeys.all() });
      await onSaved();
    } catch {
      if (active.current)
        setError(
          'Alteração salva, mas não foi possível atualizar a comparação.',
        );
    }
  };
  if (
    !isMaster ||
    !source ||
    !exam.config ||
    (group === 'minRiskDegreeQuantity' && !quantitativeApplicable)
  )
    return (
      <>
        {prefix?.()}
        {confirmedText}
      </>
    );
  const copy = () => {
    if (!copyFrom || pending || editing) return;
    try {
      void save(inlineParameterCopyDraft(group, copyFrom, exam.config!, false));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível copiar o parâmetro.',
      );
    }
  };
  return (
    <>
      {prefix?.(copyFrom ? copy : undefined, pending || editing)}
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {editing ? (
          <ExamRiskInlineControls
            library
            group={group}
            draft={draft}
            setDraft={setDraft}
            pending={pending}
            link={{ id: source.ruleExamId, isPeriodic: exam.config.isPeriodic }}
            onCancel={() => {
              setEditing(false);
              setError('');
            }}
            onSave={() => {
              try {
                buildLibraryParameterPatch(group, draft, exam.config!);
              } catch (cause) {
                setError(
                  cause instanceof Error ? cause.message : 'Valor inválido.',
                );
                return;
              }
              void save();
            }}
          />
        ) : (
          <ButtonBase
            aria-label={`Editar ${inlineParameterLabels[group]} da Biblioteca`}
            disabled={pending}
            sx={{
              font: 'inherit',
              textAlign: 'left',
              borderRadius: 0.5,
              '&:hover': {
                bgcolor: 'action.hover',
                textDecoration: 'underline',
              },
              '&.Mui-focusVisible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
              },
            }}
            onClick={() => {
              setDraft(inlineParameterDraft(group, exam.config!));
              setError('');
              setEditing(true);
            }}
          >
            {confirmedText}
          </ButtonBase>
        )}
        {error && (
          <Typography
            component="span"
            role="alert"
            color="error"
            variant="caption"
          >
            {error}
          </Typography>
        )}
      </Box>
    </>
  );
}
