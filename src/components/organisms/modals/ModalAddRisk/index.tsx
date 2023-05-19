/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import { SSwitch } from 'components/atoms/SSwitch';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { RiskEnum } from 'project/enum/risk.enums';
import { SeverityEnum } from 'project/enum/severity.enums';

import { ModalEnum } from 'core/enums/modal.enums';
import { enumToArray } from 'core/utils/helpers/convertEnum';

import { ModalAddGenerateSource } from '../ModalAddGenerateSource';
import { ModalAddRecMed } from '../ModalAddRecMed';
import { EditRiskSelects } from './components/EditRiskSelects';
import { RiskQuiContent } from './components/RiskQuiContent/RiskQuiContent';
import { RiskSharedContent } from './components/RiskSharedContent/RiskSharedContent';
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
    type,
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
        <RiskSharedContent {...props} />
        {type == 'QUI' && <RiskQuiContent {...props} />}
        <EditRiskSelects riskData={riskData} setRiskData={setRiskData} />

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
