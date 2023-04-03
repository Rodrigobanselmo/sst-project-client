import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalProtocolStep } from './components/ModalProtocolStep/ModalProtocolStep';
import { useEditProtocols } from './hooks/useEditProtocols';

export const ModalEditProtocolRisk = () => {
  const props = useEditProtocols();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    protocolData,
    loading,
    isEdit,
  } = props;

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Adicionar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.PROTOCOL_RISK)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        center
        width={['100%', 500]}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={protocolData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Adicionar Protocolo'}
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
