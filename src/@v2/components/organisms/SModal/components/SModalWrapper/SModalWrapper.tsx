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
  title,
  modalKey,
  loading,
}: SModalWrapperProps) => {
  const { closeModal } = useModal();

  return (
    <SModalPaper minWidthDesk={minWidthDesk} center={false}>
      <SModalHeader
        title={title}
        loading={loading}
        onClose={() => closeModal(modalKey)}
      />
      {children}
      <SModalButtons>
        <SButton
          onClick={() => closeModal(modalKey)}
          minWidth={100}
          color={loading ? 'paper' : 'primary'}
          variant={'outlined'}
          size="l"
          text="Cancelar"
        />
        <SButton
          onClick={onSubmit}
          minWidth={100}
          color="primary"
          loading={loading}
          variant="contained"
          size="l"
          text="Salvar"
        />
      </SModalButtons>
    </SModalPaper>
  );
};
