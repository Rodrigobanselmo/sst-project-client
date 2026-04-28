import { Box, CircularProgress, LinearProgress, Modal, Paper, Typography } from '@mui/material';

interface SPdfLoadingModalProps {
  open: boolean;
  message?: string;
}

export const SPdfLoadingModal = ({ open, message }: SPdfLoadingModalProps) => {
  return (
    <Modal
      open={open}
      aria-labelledby="pdf-loading-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          p: 4,
          minWidth: 400,
          maxWidth: 500,
          textAlign: 'center',
          outline: 'none',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Gerando PDF
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {message || 'Processando dados...'}
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Este processo pode demorar alguns segundos.
          <br />
          Por favor, não feche esta janela.
        </Typography>
      </Paper>
    </Modal>
  );
};
