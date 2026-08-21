import { Box, TextField, Typography } from '@mui/material';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { useMutateGrantFormReminderLimit } from '@v2/services/forms/form-participants/grant-form-reminder-limit';
import { useMemo, useState } from 'react';

const MAX_GRANT_QUANTITY = 20;

interface GrantFormReminderLimitModalProps {
  companyId: string;
  applicationId: string;
  reminderCount: number;
  reminderLimit: number;
  onClose: () => void;
}

export const GrantFormReminderLimitModal = ({
  companyId,
  applicationId,
  reminderCount,
  reminderLimit,
  onClose,
}: GrantFormReminderLimitModalProps) => {
  const { showSnackBar } = useSystemSnackbar();
  const grantMutation = useMutateGrantFormReminderLimit();
  const [quantityInput, setQuantityInput] = useState('1');
  const [reason, setReason] = useState('');

  const quantity = Number(quantityInput);
  const isValidQuantity =
    Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_GRANT_QUANTITY;
  const nextLimit = isValidQuantity ? reminderLimit + quantity : null;

  const preview = useMemo(
    () => ({
      used: reminderCount,
      currentLimit: reminderLimit,
      nextLimit,
    }),
    [nextLimit, reminderCount, reminderLimit],
  );

  const handleSubmit = () => {
    if (!isValidQuantity || grantMutation.isPending) return;

    void grantMutation.mutateAsync(
      {
        companyId,
        applicationId,
        quantity,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          showSnackBar(
            `Liberados +${data.quantityAdded} reforços. Novo limite: ${data.reminderCount}/${data.reminderLimit}.`,
            { type: 'success' },
          );
          onClose();
        },
      },
    );
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.FORM_APPLICATION_GRANT_REMINDER_LIMIT}
      title="Liberar reforços adicionais"
      minWidthDesk={520}
      maxWidthDesk={560}
      loading={grantMutation.isPending}
      onSubmit={handleSubmit}
      closeButtonOptions={{
        text: 'Cancelar',
        onClick: onClose,
      }}
      submitButtonOptions={{
        text: 'Liberar reforços',
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Esta ação é incremental: adiciona reforços ao limite atual da
          campanha. Ela não envia e-mails.
        </Typography>
        <Typography variant="body2">
          Reforços utilizados: <strong>{preview.used}</strong>
        </Typography>
        <Typography variant="body2">
          Limite atual: <strong>{preview.currentLimit}</strong>
        </Typography>
        <TextField
          label="Quantidade adicional"
          type="number"
          value={quantityInput}
          onChange={(event) => setQuantityInput(event.target.value)}
          inputProps={{ min: 1, max: MAX_GRANT_QUANTITY, step: 1 }}
          error={quantityInput !== '' && !isValidQuantity}
          helperText={
            quantityInput !== '' && !isValidQuantity
              ? `Informe um inteiro entre 1 e ${MAX_GRANT_QUANTITY}`
              : 'Quantos reforços extras serão somados ao limite atual'
          }
          fullWidth
        />
        <Typography variant="body2">
          Novo limite:{' '}
          <strong>{preview.nextLimit ?? '—'}</strong>
        </Typography>
        <TextField
          label="Motivo / observação"
          placeholder="Contratação adicional, cortesia comercial..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          inputProps={{ maxLength: 2000 }}
          multiline
          minRows={2}
          fullWidth
        />
      </Box>
    </SModalWrapper>
  );
};
