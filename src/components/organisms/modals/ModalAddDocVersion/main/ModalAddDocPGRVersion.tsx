/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { documentDataSchema } from 'core/utils/schemas/docuementData.schema';
import { pgrComplementarySchema } from 'core/utils/schemas/pgrComplementary.schema';

import { documentVersionWizardDefaultValues } from '../constants/wizard-defaults';
import { initialPgrDocState } from '../hooks/usePGRHandleActions';

import { MainModalStep } from '../components/1-main';
import { ComplementaryModalStep } from '../components/2-pgr';
import { usePGRHandleModal } from '../hooks/usePGRHandleActions';

const pgrWizardDefaultValues = {
  ...documentVersionWizardDefaultValues,
  source: initialPgrDocState.json.source,
  visitDate: '',
  months_period_level_2: initialPgrDocState.json.months_period_level_2,
  months_period_level_3: initialPgrDocState.json.months_period_level_3,
  months_period_level_4: initialPgrDocState.json.months_period_level_4,
  months_period_level_5: initialPgrDocState.json.months_period_level_5,
};

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
              ]}
            />
          }
          schemas={[documentDataSchema, pgrComplementarySchema]}
          defaultValues={pgrWizardDefaultValues}
        >
          <MainModalStep {...props.props} />
          <ComplementaryModalStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
