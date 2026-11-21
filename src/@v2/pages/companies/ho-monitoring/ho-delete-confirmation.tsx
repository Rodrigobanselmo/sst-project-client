import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

export function HoDeleteConfirmation({
  name,
  kind,
  busy = false,
  error,
  onCancel,
  onConfirm,
}: {
  name: string | null;
  kind: 'campaign' | 'draft';
  busy?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={name !== null}
      onClose={() => {
        if (!busy) onCancel();
      }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="ho-delete-title"
    >
      <DialogTitle id="ho-delete-title">
        {kind === 'campaign' ? 'Excluir campanha?' : 'Excluir rascunho?'}
      </DialogTitle>
      <DialogContent dividers>
        <Typography fontWeight={600} sx={{ mb: 6 }}>
          {name}
        </Typography>
        <Typography>
          {kind === 'campaign'
            ? 'A campanha, sua seleção e as justificativas salvas serão excluídas do sistema. O inventário de riscos e os cadastros de métodos e laboratórios serão preservados.'
            : 'Este rascunho será excluído somente deste navegador. Campanhas já salvas no sistema serão preservadas.'}
        </Typography>
        <Typography sx={{ mt: 6 }}>
          Esta ação não pode ser desfeita pela tela.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 6 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 8, gap: 4, flexWrap: 'wrap' }}>
        <Button disabled={busy} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          disabled={busy}
          color="error"
          variant="contained"
          onClick={onConfirm}
        >
          {busy
            ? 'Excluindo…'
            : kind === 'campaign'
              ? 'Excluir campanha'
              : 'Excluir rascunho'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
