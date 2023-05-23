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

import { IdsEnum } from 'core/enums/ids.enums';

import { ModalCharacterizationContent } from './components/ModalCharacterizationContent';
import { useEditCharacterization } from './hooks/useEditCharacterization';

export const ModalAddCharacterization = () => {
  const props = useEditCharacterization();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    data: characterizationData,
    loading,
    modalName,
    isEdit,
    onRemove,
    isRiskOpen,
    saveRef,
    isLoading,
  } = props;

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'outlined',
      id: IdsEnum.ADD_RISK_CHARACTERIZATION_ID,
      type: 'submit',
      style: { display: 'none' },
      onClick: () => (saveRef.current = 'risk'),
    },
    {
      text: 'Salvar',
      variant: 'outlined',
      id: IdsEnum.ADD_PROFILE_CHARACTERIZATION_ID,
      type: 'submit',
      style: { display: 'none' },
      onClick: () => null,
    },
    {
      text: 'Salvar',
      variant: 'outlined',
      type: 'submit',
      onClick: () => (saveRef.current = true),
    },
    {
      text: characterizationData.id ? 'Salvar e Sair' : 'Criar',
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
        <SModalPaper
          p={8}
          center
          loading={isLoading}
          component="form"
          onSubmit={(handleSubmit as any)(onSubmit)}
          sx={{
            width: 1000,
            maxWidth: '95vw',
            display: !isRiskOpen ? 'auto' : 'none',
            minHeight: '95%',
          }}
        >
          <SModalHeader
            tag={isEdit ? 'edit' : 'add'}
            onClose={onCloseUnsaved}
            title={'Caracterização do Ambiente'}
            secondIcon={characterizationData?.id ? SDeleteIcon : undefined}
            secondIconClick={onRemove}
          />

          <ModalCharacterizationContent {...props} />

          <SModalButtons
            loading={loading}
            onClose={onCloseUnsaved}
            buttons={buttons}
          />
        </SModalPaper>
        {isRiskOpen && <RiskToolSlider />}
      </>
    </SModal>
  );
};
