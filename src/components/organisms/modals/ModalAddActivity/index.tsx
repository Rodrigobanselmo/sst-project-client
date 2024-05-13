/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ActivityForm } from './components/ActivityForm';
import { useModalAddActivity } from './hooks/useModalAddActivity';

export const ModalAddActivity = () => {
  const props = useModalAddActivity();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    loading,
    modalName,
    data,
  } = props;

  const buttons = [
    {},
    {
      text: 'Salvar',
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
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={'add'}
          onClose={onCloseUnsaved}
          title={'Adicionar atividade'}
        />

        <ActivityForm {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
