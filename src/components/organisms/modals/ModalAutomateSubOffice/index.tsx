/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';

import { subOfficeAutomateSchema } from 'core/utils/schemas/sub-office-automate.schema';

import { HierarchyModalStep } from './components/1-hierarchy';
import { SetSubOfficeNameStep } from './components/2-name';
import { useHandleModal } from './hooks/useHandleActions';

export const ModalAutomateSubOffice = () => {
  const props = useHandleModal();

  return (
    <SModal
      {...props.registerModal(props.modalName)}
      keepMounted={false}
      onClose={props.onCloseUnsaved}
    >
      <SModalPaper width={['100%', 600]} p={8} center>
        <SModalHeader
          tag={'add'}
          onClose={props.onCloseUnsaved}
          title={'Adicionar risco ao empregado'}
        />
        <Wizard schemas={[subOfficeAutomateSchema]}>
          <HierarchyModalStep {...props} />
          <SetSubOfficeNameStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
