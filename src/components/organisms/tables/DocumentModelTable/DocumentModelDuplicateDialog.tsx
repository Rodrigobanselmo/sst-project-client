import { FC, useEffect, useState } from 'react';

import SText from 'components/atoms/SText';
import { SInput } from 'components/atoms/SInput';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import { useMutCreateDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutCreateDocumentModel/useMutCreateDocumentModel';

import {
  buildDocumentModelDuplicateName,
  buildDocumentModelDuplicatePayload,
  canSubmitDocumentModelDuplicate,
  DOCUMENT_MODEL_DUPLICATE_SUCCESS_MESSAGE,
} from './document-model-duplicate.util';

type Props = {
  source: IDocumentModel | null;
  onClose: () => void;
};

export const DocumentModelDuplicateDialog: FC<Props> = ({
  source,
  onClose,
}) => {
  const [name, setName] = useState('');
  const createMutation = useMutCreateDocumentModel({
    successMessage: DOCUMENT_MODEL_DUPLICATE_SUCCESS_MESSAGE,
  });

  useEffect(() => {
    setName(source ? buildDocumentModelDuplicateName(source.name) : '');
  }, [source]);

  const handleCancel = () => {
    if (createMutation.isLoading) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!source || !canSubmitDocumentModelDuplicate(name)) return;

    try {
      const payload = buildDocumentModelDuplicatePayload({
        source,
        name,
      });
      const created = await createMutation.mutateAsync(payload);
      if (created) onClose();
    } catch {
      // Error snackbar comes from useMutCreateDocumentModel.onError.
    }
  };

  const buttons = [
    {
      text: 'Cancelar',
      variant: 'outlined',
      disabled: createMutation.isLoading,
      onClick: handleCancel,
    },
    {
      text: 'Duplicar',
      variant: 'contained',
      disabled:
        createMutation.isLoading || !canSubmitDocumentModelDuplicate(name),
      onClick: () => {
        void handleConfirm();
      },
    },
  ] as IModalButton[];

  return (
    <SModal open={Boolean(source)} onClose={handleCancel}>
      <SModalPaper
        center
        p={8}
        width="fit-content"
        loading={createMutation.isLoading}
      >
        <SModalHeader onClose={handleCancel} title="Duplicar modelo" />
        <SText color="text.light" mb={4} maxWidth={520}>
          Modelo atual: {source?.name || '—'}
        </SText>
        <SInput
          autoFocus
          label="Novo nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          sx={{ minWidth: ['100%', 520], mb: 2 }}
          size="small"
        />
        <SModalButtons
          onClose={handleCancel}
          loading={createMutation.isLoading}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
