import { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useMutateAiRiskInventorySummary } from '@v2/services/security/characterization/characterization/ai-risk-inventory-summary/hooks/useMutateAiRiskInventorySummary';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  currentSummary: string;
  onApply: (summary: string) => Promise<void> | void;
  applying?: boolean;
};

/**
 * Fluxo compacto do Resumo IA — reutiliza a mutation existente, sem abrir o editor.
 */
export function CharacterizationTechnicalContentSummaryAiDialog({
  open,
  onClose,
  companyId,
  workspaceId,
  characterizationId,
  currentSummary,
  onApply,
  applying = false,
}: Props) {
  const mutation = useMutateAiRiskInventorySummary();
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const startedForOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      startedForOpenRef.current = false;
      setSuggestion('');
      setError(null);
      return;
    }
    if (startedForOpenRef.current) return;
    startedForOpenRef.current = true;

    const run = async () => {
      const requestId = ++requestIdRef.current;
      setError(null);
      setSuggestion('');
      try {
        const result = await mutation.mutateAsync({
          companyId,
          workspaceId,
          characterizationId,
        });
        if (requestId !== requestIdRef.current) return;
        const next = String(result.riskInventorySummary || '').trim();
        if (!next) {
          setError('A IA não retornou um resumo utilizável.');
          return;
        }
        setSuggestion(next);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError('Não foi possível gerar o resumo. Tente novamente.');
      }
    };

    void run();
    // Intentionally once per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, companyId, workspaceId, characterizationId]);

  const busy = mutation.isPending || applying;
  const canApply = !!suggestion.trim() && !busy;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Resumo do Inventário (IA)</DialogTitle>
      <DialogContent dividers>
        {mutation.isPending && !suggestion && !error ? (
          <Alert severity="info" icon={<CircularProgress size={18} />}>
            Gerando resumo com IA…
          </Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        {suggestion ? (
          <>
            {currentSummary.trim() ? (
              <Alert severity="warning" sx={{ mb: 1.5 }}>
                Já existe um resumo. Aplicar substituirá o conteúdo atual.
              </Alert>
            ) : null}
            <TextField
              fullWidth
              multiline
              minRows={5}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              disabled={busy}
              helperText={`${suggestion.length}/1000`}
              inputProps={{ maxLength: 1000 }}
            />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Revise o texto antes de aplicar. Nada é salvo até você confirmar.
            </Typography>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!canApply}
          onClick={() => void onApply(suggestion.trim())}
        >
          {applying ? 'Aplicando…' : 'Aplicar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
