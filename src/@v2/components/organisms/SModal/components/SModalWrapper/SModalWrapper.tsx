import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SModalButtons } from '@v2/components/organisms/SModal/components/SModalButtons/SModalButtons';
import { SModalHeader } from '@v2/components/organisms/SModal/components/SModalHeader/SModalHeader';
import { SModalPaper } from '@v2/components/organisms/SModal/components/SModalPaper/SModalPaper';
import { useModal } from '@v2/hooks/useModal';
import { SModalWrapperProps } from './SModalWrapper.types';

export const SModalWrapper = ({
  onSubmit,
  children,
  minWidthDesk = 900,
  maxWidthDesk = 900,
  title,
  modalKey,
  loading,
  semiFullScreen,
  rounded = false,
  closeButtonOptions,
  dangerButtonOptions,
  submitButtonOptions,
}: SModalWrapperProps) => {
  const { closeModal } = useModal();

  const handleClose = () => {
    if (closeButtonOptions?.onClick) {
      closeButtonOptions.onClick();
      closeModal(modalKey);
    }

    closeModal(modalKey);
  };

  return (
    <SModalPaper
      minWidthDesk={minWidthDesk}
      maxWidthDesk={maxWidthDesk}
      center={false}
      semiFullScreen={semiFullScreen}
      sx={{
        flexDirection: 'column',
        display: 'flex',
        ...(rounded && {
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          '&& .MuiButton-root': {
            borderRadius: '999px',
            textTransform: 'none',
            boxShadow: 'none',
            minHeight: 40,
          },
          '&& .MuiIconButton-root': {
            borderRadius: '50%',
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'action.hover' },
          },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        }),
      }}
    >
      <SModalHeader
        title={title}
        loading={loading}
        onClose={() => closeModal(modalKey)}
      />
      {children}
      <SModalButtons>
        {dangerButtonOptions && (
          <SButton
            onClick={dangerButtonOptions.onClick}
            color="danger"
            loading={loading}
            variant="text"
            size="l"
            text={dangerButtonOptions.text || 'Deletar'}
            buttonProps={{ sx: { mr: 'auto' } }}
          />
        )}
        <SButton
          onClick={handleClose}
          minWidth={100}
          color={loading ? 'paper' : 'primary'}
          variant={'outlined'}
          size="l"
          text={closeButtonOptions?.text || 'Cancelar'}
        />
        {onSubmit && (
          <SButton
            onClick={onSubmit}
            minWidth={100}
            color="primary"
            loading={loading}
            variant="contained"
            size="l"
            text={submitButtonOptions?.text || 'Salvar'}
          />
        )}
      </SModalButtons>
    </SModalPaper>
  );
};
