/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ProbabilityForm } from './components/ProbabilityForm';
import { useProbability } from './hooks/useProbability';

export const ModalAddProbability = () => {
  const props = useProbability();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    probabilityData,
    loading,
    modalName,
  } = props;

  const buttons = [
    {},
    {
      text: probabilityData.id ? 'Editar' : 'Criar',
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
        center
        component="form"
        sx={{
          maxWidth: ['95%', '95%', 1300],
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={probabilityData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Estimar Probabilidade'}
        />

        <ProbabilityForm {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
