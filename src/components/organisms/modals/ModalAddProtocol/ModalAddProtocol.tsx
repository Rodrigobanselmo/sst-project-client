import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalProtocolStep } from './components/ModalProtocolStep';
import { useEditProtocols } from './hooks/useEditProtocols';

export const ModalAddProtocol = () => {
  const props = useEditProtocols();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    protocolData,
    loading,
    modalName,
  } = props;

  const buttons = [
    {},
    {
      text: protocolData.id ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        sx={{ overflow: 'auto' }}
        center
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={protocolData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Protocolo'}
        />

        <ModalProtocolStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
