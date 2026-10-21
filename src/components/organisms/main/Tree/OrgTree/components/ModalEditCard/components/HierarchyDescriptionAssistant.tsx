import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useAudioRecorder } from '@v2/features/ai-chat/hooks/use-audio-recorder';
import { useSnackbar } from 'notistack';
import MicNoneIcon from '@mui/icons-material/MicNone';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import {
  DescriptionSuggestionInput,
  suggestHierarchyDescription,
} from '@v2/services/enterprise/hierarchy/suggest-description/suggest-description.service';

export const HIERARCHY_DESCRIPTION_RH_NOTICE =
  'Importante: esta descrição foi elaborada com auxílio de inteligência artificial. Solicite ao RH ou ao responsável da empresa a validação das informações antes de utilizá-las em documentos oficiais.';

type Props = {
  companyId: string;
  input?: DescriptionSuggestionInput;
  description: string;
  onApply: (description: string) => void;
};

export function HierarchyDescriptionAssistant({
  companyId,
  input,
  description,
  onApply,
}: Props) {
  const recorder = useAudioRecorder();
  const { enqueueSnackbar } = useSnackbar();
  const [guidance, setGuidance] = useState('');
  const audioBusy = recorder.state !== 'idle';
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState('');
  const [replacementFor, setReplacementFor] = useState<string | null>(null);
  const sequence = useRef(0);
  const signature = JSON.stringify([companyId, input]);
  useEffect(() => {
    recorder.cancelRecording();
    setGuidance('');
    setOpen(false);
    setBusy(false);
    setSuggestion('');
    setError('');
    setReplacementFor(null);
    sequence.current++;
    return () => {
      sequence.current++;
    };
  }, [signature]);
  const close = () => {
    sequence.current++;
    recorder.cancelRecording();
    setGuidance('');
    setOpen(false);
    setBusy(false);
    setSuggestion('');
    setError('');
    setReplacementFor(null);
  };
  const generate = async () => {
    if (!input || !companyId || busy || audioBusy || guidance.length > 2000)
      return;
    const request = ++sequence.current;
    setOpen(true);
    setBusy(true);
    setSuggestion('');
    setError('');
    setReplacementFor(null);
    try {
      const result = await suggestHierarchyDescription(companyId, {
        ...input,
        ...(guidance.trim() ? { additionalGuidance: guidance.trim() } : {}),
      });
      if (request !== sequence.current) return;
      if (!result.description?.trim()) throw Error('empty');
      setSuggestion(result.description);
    } catch (e: unknown) {
      if (request !== sequence.current) return;
      const status = (e as { response?: { status?: number } })?.response
        ?.status;
      setError(
        status === 403
          ? 'Você não tem autorização para editar este elemento.'
          : status === 400 || status === 404
            ? 'Salve o elemento e confira o estabelecimento e os vínculos antes de gerar a descrição.'
            : 'Não foi possível gerar a descrição. O texto atual foi preservado.',
      );
    } finally {
      if (request === sequence.current) setBusy(false);
    }
  };
  const transcribe = async () => {
    const current = sequence.current;
    const text = await recorder.stopRecording();
    if (current !== sequence.current || !text?.trim()) return;
    setGuidance((previous) =>
      [previous.trim(), text.trim()].filter(Boolean).join(' '),
    );
  };
  const apply = () => {
    if (!suggestion || busy) return;
    if (description.trim() && replacementFor !== description) {
      setReplacementFor(description);
      return;
    }
    onApply(suggestion);
    enqueueSnackbar(HIERARCHY_DESCRIPTION_RH_NOTICE, {
      variant: 'info',
      autoHideDuration: 15000,
    });
    close();
  };
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        mb: 2,
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      {!input && (
        <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
          Informe o nome e salve os vínculos superiores para usar a IA.
        </Box>
      )}
      <Button
        size="small"
        startIcon={<AutoAwesomeOutlinedIcon />}
        disabled={!companyId || !input || busy}
        onClick={() => setOpen(true)}
      >
        Gerar descrição com IA
      </Button>
      <Dialog open={open} onClose={close} fullWidth maxWidth="md">
        <DialogTitle>Sugestão de descrição</DialogTitle>
        <DialogContent>
          <TextField
            label="Orientações para a descrição"
            placeholder="Ex.: esse soldador trabalha principalmente com solda estanho em componentes eletrônicos."
            value={guidance}
            onChange={(event) => setGuidance(event.target.value)}
            inputProps={{ maxLength: 2000 }}
            disabled={busy || audioBusy}
            multiline
            minRows={2}
            fullWidth
            margin="normal"
            error={guidance.length > 2000}
            helperText={
              guidance.length > 2000
                ? 'Reduza as orientações para até 2000 caracteres antes de gerar.'
                : 'Opcional. Referência para a proposta; não é uma entrevista formal.'
            }
          />
          {recorder.error && <Alert severity="error">{recorder.error}</Alert>}
          {recorder.state === 'idle' && (
            <Button
              size="small"
              startIcon={<MicNoneIcon />}
              disabled={busy}
              onClick={() => void recorder.startRecording()}
            >
              Gravar orientação por voz
            </Button>
          )}
          {recorder.state === 'recording' && (
            <>
              <Button onClick={() => void transcribe()}>
                Parar e transcrever
              </Button>
              <Button onClick={recorder.cancelRecording}>
                Cancelar gravação
              </Button>
            </>
          )}
          {recorder.state === 'transcribing' && (
            <Alert severity="info" role="status">
              Transcrevendo orientação…
            </Alert>
          )}

          {busy && (
            <Alert severity="info" role="status">
              Gerando proposta de descrição…
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {!!suggestion && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Revise a proposta. Aplicar preenche apenas Descrição; o
                salvamento continua sendo feito no formulário.
              </Alert>
              <TextField
                label="Descrição sugerida"
                value={suggestion}
                multiline
                fullWidth
                minRows={4}
                InputProps={{ readOnly: true }}
              />
            </>
          )}
          {replacementFor !== null && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Já existe uma descrição. Confirme a substituição. A descrição de
              entrevista será preservada.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancelar</Button>
          <Button
            onClick={() => void generate()}
            disabled={
              busy ||
              audioBusy ||
              guidance.length > 2000 ||
              !input ||
              !companyId
            }
          >
            {error
              ? 'Tentar novamente'
              : suggestion
                ? 'Gerar nova proposta'
                : 'Gerar proposta'}
          </Button>
          <Button
            variant="contained"
            disabled={busy || audioBusy || !suggestion}
            onClick={apply}
          >
            {replacementFor !== null
              ? 'Confirmar substituição'
              : 'Aplicar descrição'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
