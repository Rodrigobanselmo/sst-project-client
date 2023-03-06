/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { pgrSchema } from 'core/utils/schemas/pgr.schema';
import { validitySchema } from 'core/utils/schemas/validity.schema';
import { versionSchema } from 'core/utils/schemas/version.schema';

import { MainModalStep } from '../components/1-main';
import { ComplementaryModalStep } from '../components/2-complementary';
import { VersionModalStep } from '../components/last-version';
import { usePGRHandleModal } from '../hooks/usePGRHandleActions';

export const ModalAddDocPGRVersion = () => {
  const props = usePGRHandleModal();

  return (
    <SModal
      {...props.registerModal(props.modalName)}
      keepMounted={false}
      onClose={props.onCloseUnsaved}
    >
      <SModalPaper width={['100%', '100%', '100%', 900]} p={8} center>
        <SModalHeader
          tag={'version'}
          onClose={props.onCloseUnsaved}
          title={`Documento PGR - ${props?.data?.workspaceName}`}
        />
        <Wizard
          header={
            <WizardTabs
              options={[
                { label: 'Dados do Documento' },
                { label: 'Informações Adcionais' },
                // { label: 'Avançado' },
              ]}
            />
          }
          schemas={[pgrSchema, versionSchema, validitySchema]}
        >
          <MainModalStep {...props} />
          <ComplementaryModalStep {...props} />
          <VersionModalStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
