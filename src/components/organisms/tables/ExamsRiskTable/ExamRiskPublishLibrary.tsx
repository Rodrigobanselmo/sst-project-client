import { useEffect, useRef, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { publishPersistedExamRisk } from '@v2/services/medicine/company-exam-risk-coverage/publish-persisted-exam-risk.service';
export function ExamRiskPublishLibrary({
  companyId,
  workspaceId,
  linkId,
  onSaved,
}: {
  companyId: string;
  workspaceId?: string;
  linkId?: number;
  onSaved: () => Promise<void>;
}) {
  const { isMasterAdmin } = useAuthShow();
  const busy = useRef(false);
  const generation = useRef(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(
    () => () => {
      generation.current++;
      busy.current = false;
    },
    [companyId, workspaceId, linkId],
  );
  if (!isMasterAdmin || !workspaceId || !linkId) return null;
  const publish = async () => {
    if (busy.current) return;
    if (
      !window.confirm(
        'Publicar os parâmetros persistidos deste vínculo como recomendação sistêmica na Biblioteca? O vínculo empresarial não será alterado. A recomendação poderá ser utilizada por outras empresas.',
      )
    )
      return;
    busy.current = true;
    const request = generation.current;
    setPending(true);
    setMessage('');
    try {
      const result = await publishPersistedExamRisk({
        companyId,
        workspaceId,
        linkId,
      });
      if (request !== generation.current) return;
      const text =
        result.action === 'created'
          ? 'Recomendação publicada com sucesso.'
          : result.action === 'alreadyExists'
            ? 'Publicação já existente, sem duplicação.'
            : `Publicação não realizada: ${result.reason}`;
      setMessage(text);
      try {
        await onSaved();
      } catch {
        if (request === generation.current)
          setMessage(
            `${text} Não foi possível atualizar a comparação. Atualize a tela.`,
          );
      }
    } catch (error) {
      if (request === generation.current)
        setMessage(
          (error as any)?.response?.data?.message ||
            'Não foi possível publicar a recomendação. Tente novamente.',
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
      <Button
        size="small"
        variant="text"
        disabled={pending}
        onClick={() => void publish()}
      >
        {pending ? 'Publicando…' : '+ Publicar na Biblioteca'}
      </Button>
      {message && (
        <Typography role="status" variant="caption" display="block">
          {message}
        </Typography>
      )}
    </>
  );
}
