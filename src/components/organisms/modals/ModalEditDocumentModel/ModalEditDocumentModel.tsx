/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { DataStep } from './components/1-data/DataStep';
import { ViewDocumentModelStep } from './components/2-viewDocumentModelStep/ViewDocumentModelStep';
import { useEditDocumentModel } from './hooks/useEditDocumentModel';

export const ModalEditDocumentModelData = () => {
  const props = useEditDocumentModel();

  const { registerModal, onClose, modalName, data, isEdit } = props;
  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={() => onClose()}
    >
      <SModalPaper
        display={'flex'}
        maxHeight={'100%'}
        flexDirection="column"
        width={['100%', '100%', 600]}
        {...(isEdit && {
          semiFullScreen: true,
        })}
        center
        p={8}
      >
        <SModalHeader tag={'info'} onClose={onClose} title={data.title} />
        <Wizard
          schemas={[]}
          header={
            <WizardTabs
              height={45}
              options={[
                { label: 'Dados', sx: { fontSize: 12 } },
                ...(isEdit
                  ? [
                      { label: 'Documento', sx: { fontSize: 12 } },
                      { label: 'Variaveis', sx: { fontSize: 12 } },
                    ]
                  : []),
              ]}
            />
          }
        >
          <DataStep {...props} />
          {isEdit && <ViewDocumentModelStep {...props} />}
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};