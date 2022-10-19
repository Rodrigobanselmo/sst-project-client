/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';

import { pcmsoSchema } from 'core/utils/schemas/pcmso.schema';
import { validitySchema } from 'core/utils/schemas/validity.schema';
import { versionSchema } from 'core/utils/schemas/version.schema';

import { InitialModalStep } from './components/1-initial';
import { ProfessionalModalStep } from './components/2-professionals';
import { SecondModalStep } from './components/second';
import { useHandleModal } from './hooks/useHandleActions';

export const ModalAddDocPcmso = () => {
  const props = useHandleModal();

  return (
    <SModal
      {...props.registerModal(props.modalName)}
      keepMounted={false}
      onClose={props.onCloseUnsaved}
    >
      <SModalPaper p={8} center>
        <SModalHeader
          tag={'version'}
          onClose={props.onCloseUnsaved}
          title={`Documento PCMSO - ${props?.data?.workspaceName}`}
        />
        <Wizard schemas={[pcmsoSchema, versionSchema, validitySchema]}>
          <InitialModalStep {...props} />
          <ProfessionalModalStep {...props} />
          <SecondModalStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
