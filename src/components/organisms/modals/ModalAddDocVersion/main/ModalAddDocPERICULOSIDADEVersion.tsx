/* eslint-disable @typescript-eslint/no-explicit-any */

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { documentDataSchema } from 'core/utils/schemas/docuementData.schema';
import { validitySchema } from 'core/utils/schemas/validity.schema';
import { versionSchema } from 'core/utils/schemas/version.schema';

import { MainModalStep } from '../components/1-main';
import { VersionModalStep } from '../components/last-version';
import { usePERICULOSIDADEHandleModal } from '../hooks/usePERICULOSIDADEHandleActions';

export const ModalAddDocPERICULOSIDADEVersion = () => {
  const props = usePERICULOSIDADEHandleModal();

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
          title={`Documento PERICULOSIDADE - ${props?.data?.workspaceName}`}
        />
        <Wizard
          header={
            <WizardTabs
              options={[
                { label: 'Dados do Documento' },
                // { label: 'Avançado' },
              ]}
            />
          }
          schemas={[documentDataSchema, versionSchema]}
        >
          <MainModalStep {...props.props} />
          <VersionModalStep {...props.props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
