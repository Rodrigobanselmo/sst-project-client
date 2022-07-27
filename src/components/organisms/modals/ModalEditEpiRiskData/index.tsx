import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalEpiStep } from './components/ModalEpiStep/ModalEpiStep';
import { useEditEpis } from './hooks/useEditEpis';

export const ModalEditEpiData = () => {
  const props = useEditEpis();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    epiData,
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
      {...registerModal(ModalEnum.EPI_EPI_DATA)}
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
          tag={epiData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Adicionar EPI'}
        />

        <ModalEpiStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
