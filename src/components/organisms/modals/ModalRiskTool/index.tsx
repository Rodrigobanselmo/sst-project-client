import React from 'react';

import SModal from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { RiskToolSlider } from 'components/organisms/main/Tree/OrgTree/components/RiskTool';
import { ModalAddEpi } from 'components/organisms/modals/ModalAddEpi';
import { ModalAddGenerateSource } from 'components/organisms/modals/ModalAddGenerateSource';
import { ModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalAddRecMed } from 'components/organisms/modals/ModalAddRecMed';
import { ModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { ModalAutomateSubOffice } from 'components/organisms/modals/ModalAutomateSubOffice';
import { ModalEditEpiData } from 'components/organisms/modals/ModalEditEpiRiskData';
import { ModalEditExamRiskData } from 'components/organisms/modals/ModalEditExamRiskData/ModalEditExamRiskData';
import { ModalEditEngRiskData } from 'components/organisms/modals/ModalEditMedRiskData';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectGho } from 'components/organisms/modals/ModalSelectGho';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';

import { ModalAddQuantity } from '../ModalAddQuantity';
import { useModalRiskTool } from './hooks/useModalRiskTool';

export const ModalRiskTool = () => {
  const { registerModal, onCloseUnsaved, modalName, data } = useModalRiskTool();

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'outlined',
      type: 'submit',
      onClick: () => null,
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <RiskToolSlider riskGroupId={data.riskGroupId} />
    </SModal>
  );
};

export const StackModalRiskTool = () => {
  return (
    <>
      <ModalRiskTool />
      <ModalSelectHierarchy />
      <ModalSelectGho />
      <ModalSelectDocPgr />
      <ModalEditEpiData />
      <ModalEditEngRiskData />
      <ModalEditExamRiskData />
      <ModalAutomateSubOffice />

      <ModalAddRisk />
      <ModalAddGho />
      <ModalAddGenerateSource />
      <ModalAddRecMed />
      <ModalAddEpi />
      <ModalAddProbability />
      <ModalAddQuantity />
    </>
  );
};
