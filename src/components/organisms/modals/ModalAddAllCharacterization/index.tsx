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

import { ModalCharacterizationContent } from './components/ModalCharacterizationContent';
import { useEditAllChar } from './hooks/useEditAllChar';

export const ModalAddAllCharacterization = () => {
  const props = useEditAllChar();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    data,
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
      text: data.id ? 'Salvar e Sair' : 'Criar',
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
              title={'Mão de Obra (Caracterização)'}
              secondIcon={data?.id ? SDeleteIcon : undefined}
              secondIconClick={onRemove}
            />

            <ModalCharacterizationContent {...(props as any)} />

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
