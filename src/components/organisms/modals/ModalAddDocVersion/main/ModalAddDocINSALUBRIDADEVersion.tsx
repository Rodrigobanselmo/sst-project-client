/* eslint-disable @typescript-eslint/no-explicit-any */

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';

import { documentDataSchema } from 'core/utils/schemas/docuementData.schema';

import { documentVersionWizardDefaultValues } from '../constants/wizard-defaults';
import { MainModalStep } from '../components/1-main';
import { useINSALUBRIDADEHandleModal } from '../hooks/useINSALUBRIDADEHandleActions';

export const ModalAddDocINSALUBRIDADEVersion = () => {
  const props = useINSALUBRIDADEHandleModal();

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
          title={`Documento Insalubridade - ${props?.data?.workspaceName}`}
        />
        <Wizard
          schemas={[documentDataSchema]}
          defaultValues={documentVersionWizardDefaultValues}
        >
          <MainModalStep {...props.props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
