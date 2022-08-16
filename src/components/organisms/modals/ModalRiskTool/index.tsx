import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { RiskToolSlider } from 'components/organisms/main/Tree/OrgTree/components/RiskTool';

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
