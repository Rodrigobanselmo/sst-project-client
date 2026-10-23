import { useEffect, useRef, useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import { IExamToRisk } from 'core/interfaces/api/IExam';
import { useMutDeleteExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutDeleteExamRisk/useMutDeleteExamRisk';
import {
  InlineRiskScope,
  loadInlineRiskLinks,
} from './exam-risk-inline-parameter.util';

export function ExamRiskDeleteLink({
  scope,
  link,
  examId,
  examName,
}: {
  scope: InlineRiskScope;
  link?: IExamToRisk;
  examId: number;
  examName: string;
}) {
  const { isAuthSuccess } = useAuthShow();
  const allowed = isAuthSuccess({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'd',
  });
  const mutation = useMutDeleteExamRisk();
  const busy = useRef(false);
  const generation = useRef(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      generation.current++;
      busy.current = false;
    },
    [scope.companyId, scope.workspaceId, scope.riskId, link?.id],
  );
  if (
    !allowed ||
    !link?.id ||
    link.companyId !== scope.companyId ||
    link.riskId !== scope.riskId ||
    link.examId !== examId
  )
    return null;
  const remove = async () => {
    if (busy.current) return;
    if (
      !window.confirm(
        `O exame ${examName} será desvinculado do fator de risco ${scope.riskName} nesta empresa. O catálogo e a Biblioteca serão preservados. Deseja continuar?`,
      )
    )
      return;
    if (
      !window.confirm(
        `Confirmar definitivamente a remoção do vínculo ${link.id} — ${examName}?`,
      )
    )
      return;
    busy.current = true;
    const request = generation.current;
    setPending(true);
    setError('');
    try {
      const fresh = await loadInlineRiskLinks(scope);
      if (request !== generation.current) return;
      if (
        !fresh.some(
          (row) =>
            row.id === link.id &&
            row.examId === examId &&
            row.riskId === scope.riskId &&
            row.companyId === scope.companyId,
        )
      )
        throw new Error(
          'Vínculo indisponível para exclusão. Atualize os dados.',
        );
      await mutation.mutateAsync({ id: link.id, companyId: scope.companyId });
    } catch (cause) {
      if (request === generation.current)
        setError(
          (cause as any)?.response?.data?.message ||
            (cause as Error)?.message ||
            'Não foi possível remover o vínculo.',
        );
    } finally {
      if (request === generation.current) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  return (
    <>
      <Tooltip title="Desvincular exame da empresa">
        <span>
          <IconButton
            size="small"
            aria-label={`Excluir ${examName}, vínculo ${link.id}`}
            disabled={pending || mutation.isLoading}
            onClick={(event) => {
              event.stopPropagation();
              void remove();
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
          </IconButton>
        </span>
      </Tooltip>
      {error && (
        <Typography
          role="alert"
          variant="caption"
          color="error"
          display="block"
        >
          {error}
        </Typography>
      )}
    </>
  );
}
