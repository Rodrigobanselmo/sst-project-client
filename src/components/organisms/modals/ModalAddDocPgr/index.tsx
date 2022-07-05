/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';

import { pgrSchema } from 'core/utils/schemas/pgr.schema';
import { validitySchema } from 'core/utils/schemas/validity.schema';
import { versionSchema } from 'core/utils/schemas/version.schema';

import { ComplementaryModalStep } from './components/2-complementary';
import { ProfessionalModalStep } from './components/3-professionals';
import { FirstModalStep } from './components/first';
import { SecondModalStep } from './components/second';
import { useHandleModal } from './hooks/useHandleActions';

export const ModalAddDocPgr = () => {
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
          title={`Documento PGR - ${props?.data?.workspaceName}`}
        />
        <Wizard schemas={[pgrSchema, versionSchema, validitySchema]}>
          <FirstModalStep {...props} />
          <ComplementaryModalStep {...props} />
          <ProfessionalModalStep {...props} />
          <SecondModalStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
