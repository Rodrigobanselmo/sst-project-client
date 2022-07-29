import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalEngRiskStep } from './components/ModalEngRiskStep/ModalEngRiskStep';
import { useEditEngsRisk } from './hooks/useEditEngsRisk';

export const ModalEditEngRiskData = () => {
  const props = useEditEngsRisk();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    engData,
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
          tag={engData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Adicionar EPC / ENG'}
        />

        <ModalEngRiskStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
