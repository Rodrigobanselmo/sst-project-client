/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalAddGenerateSource } from '../ModalAddGenerateSource';
import { ModalAddRecMed } from '../ModalAddRecMed';
import { RiskEditorFields } from './components/RiskEditorFields/RiskEditorFields';
import { useAddRisk } from './hooks/useAddRisk';

export const ModalAddRisk = () => {
  const props = useAddRisk();

  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    riskData,
    setRiskData,
    handleSubmit,
  } = props;

  const buttons = [
    {},
    {
      text: riskData?.id ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setRiskData({ ...riskData, hasSubmit: true }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.RISK_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        center
        p={8}
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={riskData?.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Fator de risco'}
        />
        <RiskEditorFields {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
export const StackModalAddRisk = () => {
  return (
    <>
      <ModalAddRisk />
      <ModalAddGenerateSource />
      <ModalAddRecMed />
    </>
  );
};
