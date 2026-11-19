import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  ChangeEmailResult,
  useMutAdminChangeEmail,
} from 'core/services/hooks/mutations/user/useMutAdminChangeEmail';

type Props = {
  userId: number;
  companyId: string;
  currentEmail: string;
  onClose: () => void;
  onChanged: (email: string) => void;
};

export function ChangeUserEmailDialog({
  userId,
  companyId,
  currentEmail,
  onClose,
  onChanged,
}: Props) {
  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ChangeEmailResult>();
  const mutation = useMutAdminChangeEmail();
  const active = useRef(true);
  const submitting = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const close = () => {
    if (!submitting.current) onClose();
  };
  const submit = async () => {
    if (submitting.current || result) return;
    const nextEmail = email.trim().toLowerCase();
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail) ||
      nextEmail.length > 254
    ) {
      setError('Informe um novo e-mail válido.');
      return;
    }
    if (nextEmail === currentEmail.toLowerCase()) {
      setError('Informe um e-mail diferente do atual.');
      return;
    }
    if (nextEmail !== confirmation.trim().toLowerCase()) {
      setError('Os e-mails informados devem ser iguais.');
      return;
    }
    submitting.current = true;
    setError('');
    try {
      const data = await mutation.mutateAsync({
        companyId,
        id: userId,
        email: nextEmail,
        expectedEmail: currentEmail,
        notifyUser,
      });
      if (!active.current) return;
      setResult(data);
      onChanged(data.email);
    } catch (failure: unknown) {
      if (!active.current) return;
      const message = (
        failure as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(' ')
          : message ||
              'Não foi possível confirmar a troca. Confira o e-mail atual no cadastro antes de tentar novamente.',
      );
    } finally {
      submitting.current = false;
    }
  };
  return (
    <Dialog
      open
      onClose={close}
      fullWidth
      maxWidth="sm"
      aria-labelledby="change-user-email-title"
    >
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void submit();
        }}
      >
        <DialogTitle
          id="change-user-email-title"
          sx={{ color: 'text.primary' }}
        >
          Trocar e-mail
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            pt: '8px !important',
          }}
        >
          {result ? (
            <>
              <Alert severity="success">
                E-mail de acesso alterado para {result.email}. No próximo login
                com e-mail e senha, use o novo endereço e a senha atual.
              </Alert>
              {result.notification === 'sent' && (
                <Alert severity="info">
                  A notificação foi enviada ao novo e-mail.
                </Alert>
              )}
              {result.notification === 'failed' && (
                <Alert severity="warning">
                  O e-mail de acesso foi alterado, mas não foi possível enviar a
                  notificação. Avise a pessoa pelo novo endereço. Não é
                  necessário repetir a troca.
                </Alert>
              )}
              {result.notification === 'not_requested' && (
                <Typography color="text.secondary">
                  Nenhuma notificação foi solicitada. Avise a pessoa sobre a
                  mudança.
                </Typography>
              )}
            </>
          ) : (
            <>
              <Alert severity="info">
                Esta troca atualiza o acesso da mesma conta em todas as empresas
                vinculadas. Não cria outro usuário e preserva a senha, os
                vínculos e as permissões. A partir do próximo login com e-mail e
                senha, a pessoa deve usar o novo endereço. A alteração é
                aplicada ao confirmar aqui.
              </Alert>
              <Typography color="text.secondary">
                O vínculo com o Google, quando existente, permanece o mesmo.
              </Typography>
              <Typography
                color="text.primary"
                sx={{ overflowWrap: 'anywhere' }}
              >
                E-mail atual: <strong>{currentEmail}</strong>
              </Typography>
              <TextField
                autoFocus
                label="Novo e-mail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
                disabled={mutation.isLoading}
                inputProps={{ maxLength: 254 }}
                autoComplete="off"
              />
              <TextField
                label="Confirmar novo e-mail"
                type="email"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                required
                fullWidth
                disabled={mutation.isLoading}
                inputProps={{ maxLength: 254 }}
                autoComplete="off"
              />
              <FormControlLabel
                sx={{
                  color: 'text.primary',
                  '& .MuiFormControlLabel-label': { color: 'text.primary' },
                }}
                control={
                  <Checkbox
                    checked={notifyUser}
                    onChange={(event) => setNotifyUser(event.target.checked)}
                    disabled={mutation.isLoading}
                  />
                }
                label="Enviar notificação automática para o novo e-mail"
              />
              {error && <Alert severity="error">{error}</Alert>}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 8, gap: 4, flexWrap: 'wrap' }}>
          <Button onClick={close} disabled={mutation.isLoading}>
            {result ? 'Concluir' : 'Cancelar'}
          </Button>
          {!result && (
            <Button
              type="submit"
              variant="contained"
              disabled={
                mutation.isLoading || !email.trim() || !confirmation.trim()
              }
            >
              {mutation.isLoading ? 'Alterando…' : 'Confirmar troca de e-mail'}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
