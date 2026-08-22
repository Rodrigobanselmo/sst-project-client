/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import {
  DocumentEditorV2SessionProvider,
  useDocumentEditorV2Session,
} from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2Session';
import { shouldIgnoreModalEscapeClose } from 'components/organisms/documentModel/editor-v2/integration/document-editor-v2-session';

import { DataStep } from './components/1-data/DataStep';
import { ViewDocumentModelStep } from './components/2-viewDocumentModelStep/ViewDocumentModelStep';
import { useEditDocumentModel } from './hooks/useEditDocumentModel';
import { VariablesDocTable } from 'components/organisms/tables/VariablesDocTable/VariablesDocTable';
import { VariablesStep } from './components/3-variables/VariablesStep';
import { ImagesStep } from './components/4-images/ImagesStep';

export const ModalEditDocumentModelData = () => (
  <DocumentEditorV2SessionProvider>
    <ModalEditDocumentModelInner />
  </DocumentEditorV2SessionProvider>
);

const ModalEditDocumentModelInner = () => {
  const props = useEditDocumentModel();
  const v2Session = useDocumentEditorV2Session();

  const { registerModal, onClose, modalName, data, isEdit } = props;
  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      disableEscapeKeyDown={v2Session.v2LocalDirty}
      onClose={(_event, reason) => {
        if (
          shouldIgnoreModalEscapeClose({
            v2LocalDirty: v2Session.v2LocalDirty,
            reason,
          })
        ) {
          return;
        }
        onClose();
      }}
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
        <SModalHeader
          tag={'info'}
          onClose={onClose}
          title={data.title + (data.name ? ` - ${data.name}` : '')}
        />
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
                      { label: 'Imagens', sx: { fontSize: 12 } },
                    ]
                  : []),
              ]}
            />
          }
        >
          <DataStep {...props} />
          {isEdit ? <ViewDocumentModelStep {...props} /> : <div />}
          {isEdit ? <VariablesStep {...props} /> : <div />}
          {isEdit ? <ImagesStep {...props} /> : <div />}
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
