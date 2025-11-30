/* eslint-disable @typescript-eslint/no-explicit-any */

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { documentDataSchema } from 'core/utils/schemas/docuementData.schema';
import { versionSchema } from 'core/utils/schemas/version.schema';

import { MainModalStep } from '../components/1-main';
import { VersionModalStep } from '../components/last-version';
import { useLTCATHandleModal } from '../hooks/useLTCATHandleActions';

export const ModalAddDocLTCATVersion = () => {
  const props = useLTCATHandleModal();

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
          title={`Documento LTCAT - ${props?.data?.workspaceName}`}
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
