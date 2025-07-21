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
