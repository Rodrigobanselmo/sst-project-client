import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalScheduleBlockStep } from './components/ModalScheduleBlockStep/ModalScheduleBlockStep';
import { useAddScheduleBlock } from './hooks/useAddScheduleBlock';

export const ModalAddScheduleBlock = () => {
  const props = useAddScheduleBlock();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    scheduleblockData,
    loading,
    modalName,
    handleDelete,
  } = props;

  const buttons = [
    {},
    {
      text: scheduleblockData.id ? 'Salvar' : 'Criar',
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
          tag={scheduleblockData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Exame'}
          secondIcon={scheduleblockData?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />

        <ModalScheduleBlockStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
