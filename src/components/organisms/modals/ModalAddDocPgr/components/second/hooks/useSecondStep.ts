import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useMutUpsertRiskDocsPgr } from 'core/services/hooks/mutations/checklist/docs/useMutCreateDocsPgr';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useSecondStep = ({ data, onClose, ...rest }: IUseAddCompany) => {
  const { trigger, getValues, control, reset, setError, clearErrors } =
    useFormContext();
  const [isMajorVersion, setIsMajorVersion] = useState(false);

  const createDoc = useMutUpsertRiskDocsPgr();

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
          version,
          description: doc_description,
          name: doc_name,
          companyId: data.companyId,
          riskGroupId: data.id,
          workspaceId: data.workspaceId,
          workspaceName: data.workspaceName,
          id: data.id,
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
