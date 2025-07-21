import { Box, Typography } from '@mui/material';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { useModal } from '@v2/hooks/useModal';

interface ConfirmationModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal = ({
  title = 'Confirmar Ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmationModalProps) => {
  const { closeModal } = useModal();

  const handleConfirm = () => {
    onConfirm();
    closeModal(ModalKeyEnum.CONFIRMATION_MODAL);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeModal(ModalKeyEnum.CONFIRMATION_MODAL);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.CONFIRMATION_MODAL}
      title={title}
      minWidthDesk={500}
      maxWidthDesk={500}
      closeButtonOptions={{
        text: cancelText,
        onClick: handleCancel,
      }}
      submitButtonOptions={{
        text: confirmText,
      }}
      dangerButtonOptions={
        variant === 'danger'
          ? {
              text: confirmText,
              onClick: handleConfirm,
            }
          : undefined
      }
      onSubmit={variant !== 'danger' ? handleConfirm : undefined}
    >
      <Box>
        <Typography
          color="text.secondary"
          sx={{
            mb: 3,
            lineHeight: 1.6,
            fontSize: 16,
          }}
        >
          {message}
        </Typography>
      </Box>
    </SModalWrapper>
  );
};
