import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

// import { useMutUpsertRiskDocsPgr } from 'core/services/hooks/mutations/checklist/docs/useMutCreateDocsPgr';
import { useMutAddQueueDocsPCMSO } from 'core/services/hooks/mutations/checklist/docPCMSO/useMutAddQueueDocsPcmso/useMutAddQueueDocsPcmso';
import { useMutAddQueueDocsPgr } from 'core/services/hooks/mutations/checklist/docsPGR/useMutAddQueueDocsPgr';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useSecondStep = ({ data, onClose, ...rest }: IUseAddCompany) => {
  const { trigger, getValues, control, reset, setError, clearErrors } =
    useFormContext();
  const [isMajorVersion, setIsMajorVersion] = useState(false);

  const createDoc = useMutAddQueueDocsPCMSO();

  const fields = ['version', 'doc_description', 'doc_name'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { version, doc_description, doc_name } = getValues();
      if (isMajorVersion && !doc_name)
        return setError('doc_name', {
          type: 'manual',
          message: 'Nome do documento obrigatório',
        });

      await createDoc
        .mutateAsync({
          version: version.replace('+ ', ''),
          description: doc_description,
          name: doc_name,
          companyId: data.companyId,
          pcmsoId: data.id,
          workspaceId: data.workspaceId,
          workspaceName: data.workspaceName,
        })
        .catch(() => {});
      onClose();
    }
  };

  return {
    onSubmit,
    loading: createDoc.isLoading,
    control,
    onCloseUnsaved,
    setIsMajorVersion,
    isMajorVersion,
    clearErrors,
  };
};
