import { ExamRiskInlineControls } from './ExamRiskInlineControls';
import type { IPcmsoComparableConfig as Config } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIsMutating, useMutation } from 'react-query';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import type { IExamToRisk } from 'core/interfaces/api/IExam';
import { updateExam } from 'core/services/hooks/mutations/checklist/exams/useMutUpdateExamRisk/useMutUpdateExamRisk';
import {
  buildInlineParameterPatch,
  inlineParameterCopyDraft,
  inlineParameterDraft,
  inlineParameterLabels,
  canEditInlineParameter,
  type InlineParameterGroup,
  type InlineParameterDraft,
  loadInlineRiskLinks,
  type InlineRiskScope,
} from './exam-risk-inline-parameter.util';

// Shared by repeated representations of the same link, including same-tick clicks.
import { savingLinks } from './exam-risk-parameter-saving';
type SaveDraft =
  | InlineParameterDraft
  | ((fresh: IExamToRisk) => InlineParameterDraft);

type Props = {
  scope: InlineRiskScope;
  link: IExamToRisk;
  group: InlineParameterGroup;
  confirmedText: string;
  onSaved: () => Promise<void>;
  copyFrom?: Config | null;
  prefix?: (copy?: () => void, pending?: boolean) => ReactNode;
};

export function ExamRiskInlineParameter({
  scope,
  link,
  group,
  confirmedText,
  onSaved,
  copyFrom,
  prefix,
}: Props) {
  const { isAuthSuccess } = useAuthShow();
  const canUpdate = isAuthSuccess({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'u',
  });
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
  const key = `${scope.companyId}:${link.id}`;
  const mutationKey = ['exam-risk-inline-parameter', key];
  const pending = useIsMutating({ mutationKey }) > 0;
  const mutation = useMutation(
    async (copyDraft?: SaveDraft) => {
      if (
        !canUpdate ||
        link.companyId !== scope.companyId ||
        savingLinks.has(key)
      )
        throw new Error('Edição indisponível para este vínculo.');
      savingLinks.add(key);
      try {
        const fresh = (await loadInlineRiskLinks(scope)).find(
          (row) =>
            row.id === link.id &&
            row.examId === link.examId &&
            row.riskId === scope.riskId,
        );
        if (!fresh)
          throw new Error(
            'O vínculo não está mais disponível. Atualize os dados.',
          );
        if (!active.current) throw new Error('A edição foi encerrada.');
        const patch = await buildInlineParameterPatch(
          scope,
          fresh,
          { linkId: link.id, examId: link.examId },
          group,
          typeof copyDraft === 'function'
            ? copyDraft(fresh)
            : (copyDraft ?? draft),
        );
        if (!active.current) throw new Error('A edição foi encerrada.');
        const saved = await updateExam(patch, scope.companyId);
        if (
          !saved ||
          saved.id !== link.id ||
          saved.examId !== link.examId ||
          saved.riskId !== scope.riskId
        )
          throw new Error(
            'Não foi possível confirmar a gravação deste vínculo. Atualize os dados antes de tentar novamente.',
          );
      } finally {
        savingLinks.delete(key);
      }
    },
    { mutationKey },
  );

  const save = async (copyDraft?: SaveDraft) => {
    if (pending || savingLinks.has(key)) return;
    setError('');
    try {
      await mutation.mutateAsync(copyDraft);
    } catch (cause) {
      if (active.current)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível salvar. Corrija o valor ou tente novamente.',
        );
      return;
    }
    if (active.current) setEditing(false);
    try {
      await onSaved();
    } catch {
      if (active.current)
        setError(
          'Parâmetro salvo, mas não foi possível atualizar a comparação.',
        );
    }
  };

  if (
    !canUpdate ||
    link.companyId !== scope.companyId ||
    !canEditInlineParameter(group, link)
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
      void save((fresh) =>
        inlineParameterCopyDraft(group, copyFrom, fresh, true),
      );
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
            group={group}
            draft={draft}
            setDraft={setDraft}
            pending={pending}
            link={link}
            onSave={() => void save()}
            onCancel={() => {
              setEditing(false);
              setError('');
            }}
          />
        ) : (
          <ButtonBase
            disabled={pending}
            aria-label={`Editar ${inlineParameterLabels[group]}, vínculo ${link.id}`}
            sx={{
              font: 'inherit',
              borderRadius: 0.5,
              textAlign: 'left',
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
              setDraft(inlineParameterDraft(group, link));
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
            variant="caption"
            color="error"
          >
            {error}
          </Typography>
        )}
      </Box>
    </>
  );
}
