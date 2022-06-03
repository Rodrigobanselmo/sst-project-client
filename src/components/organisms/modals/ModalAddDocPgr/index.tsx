/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';

import { pgrSchema } from 'core/utils/schemas/pgr.schema';
import { versionSchema } from 'core/utils/schemas/version.schema';

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
        <Wizard schemas={[pgrSchema, versionSchema]}>
          <FirstModalStep {...props} />
          <SecondModalStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
