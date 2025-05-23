import { Modal } from '@mui/material';
import { useModal, useModalState } from '@v2/hooks/useModal';

export const SModal = () => {
  const { closeModal } = useModal();
  const modals = useModalState((state) => state.modals);

  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((modal) => {
        const { key, content } = modal;
        return (
          <Modal
            key={modal.key}
            open={true}
            onClose={() => closeModal(key)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div>{content}</div>
          </Modal>
        );
      })}
    </>
  );
};
