import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalEPCStep } from './components/ModalEPCStep/ModalEPCStep';
import { useEditEPCs } from './hooks/useEditEPCs';

export const ModalEditEPCData = () => {
  const props = useEditEPCs();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    epcData,
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
      {...registerModal(ModalEnum.EPC_RISK_DATA)}
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
          tag={epcData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Adicionar EPC'}
        />

        <ModalEPCStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
