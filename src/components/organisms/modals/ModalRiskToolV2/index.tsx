import React from 'react';

import SModal from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { RiskToolV2 } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/RiskTool';
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
import { ModalAddComment } from 'components/organisms/modals/ModalRiskDataComment';
import { ModalSelectCompany } from 'components/organisms/modals/ModalSelectCompany';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectGho } from 'components/organisms/modals/ModalSelectGho';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';

import { ModalAddQuantity } from '../ModalAddQuantity';
import { useModalRiskToolV2 } from './hooks/useModalRiskToolV2';
import { ModalAddActivity } from '../ModalAddActivity';

export const ModalRiskToolV2 = () => {
  const { registerModal, onCloseUnsaved, modalName, data } =
    useModalRiskToolV2();

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
      <RiskToolV2 riskGroupId={data.riskGroupId} />
    </SModal>
  );
};

export const StackModalRiskToolV2 = () => {
  return (
    <>
      <ModalRiskToolV2 />
      <ModalSelectHierarchy />
      <ModalSelectGho />
      <ModalSelectDocPgr />
      <ModalSelectCompany />
      <ModalEditEpiData />
      <ModalEditEngRiskData />
      <ModalEditExamRiskData />
      <ModalAutomateSubOffice />
      <ModalAddComment />

      <ModalAddRisk />
      <ModalAddGho />
      <ModalAddGenerateSource />
      <ModalAddRecMed />
      <ModalAddEpi />
      <ModalAddProbability />
      <ModalAddQuantity />
      <ModalAddActivity />
    </>
  );
};
