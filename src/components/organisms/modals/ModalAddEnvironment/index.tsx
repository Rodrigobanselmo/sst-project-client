/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { RiskToolSlider } from 'components/organisms/main/Tree/OrgTree/components/RiskTool';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnvironmentContent } from './components/ModalEnvironmentContent';
import { useEditEnvironment } from './hooks/useEditEnvironment';

export const ModalAddEnvironment = () => {
  const props = useEditEnvironment();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    data: environmentData,
    loading,
    modalName,
    isEdit,
    onRemove,
    isRiskOpen,
    saveRef,
  } = props;

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'outlined',
      type: 'submit',
      onClick: () => (saveRef.current = true),
    },
    {
      text: environmentData.id ? 'Salvar e sair' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => (saveRef.current = false),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <>
        {!isRiskOpen && (
          <SModalPaper
            p={8}
            center
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: 1000, maxWidth: '95vw' }}
          >
            <SModalHeader
              tag={isEdit ? 'edit' : 'add'}
              onClose={onCloseUnsaved}
              title={'Ambiente de trabalho'}
              secondIcon={environmentData?.id ? SDeleteIcon : undefined}
              secondIconClick={onRemove}
            />

            <ModalEnvironmentContent {...props} />

            <SModalButtons
              loading={loading}
              onClose={onCloseUnsaved}
              buttons={buttons}
            />
          </SModalPaper>
        )}
        {isRiskOpen && <RiskToolSlider />}
      </>
    </SModal>
  );
};
