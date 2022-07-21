import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalCommentStep } from './components/ModalCommentStep';
import { useEditComments } from './hooks/useEditComments';

export const ModalAddComment = () => {
  const props = useEditComments();
  const { onSubmit, registerModal, handleSubmit, onCloseUnsaved, loading } =
    props;

  const buttons = [
    {},
    {
      text: 'Confirmar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.RISK_DATA_COMMENTS_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        center
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={'edit'}
          onClose={onCloseUnsaved}
          title={'Justificar Alteração'}
        />

        <ModalCommentStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
