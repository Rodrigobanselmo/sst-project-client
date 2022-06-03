import { useFormContext } from 'react-hook-form';

import { useMutUpsertRiskDocs } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskDocs';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useSecondStep = ({ data, onClose, ...rest }: IUseAddCompany) => {
  const { trigger, getValues, control, reset } = useFormContext();

  const createDoc = useMutUpsertRiskDocs();

  const fields = ['version', 'doc_description', 'doc_name'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { version, doc_description, doc_name } = getValues();
      await createDoc.mutateAsync({
        version,
        description: doc_description,
        name: doc_name,
        companyId: data.companyId,
        riskGroupId: data.id,
        workspaceId: data.workspaceId,
        workspaceName: data.workspaceName,
      });
      onClose();
    }
  };

  return {
    onSubmit,
    loading: createDoc.isLoading,
    control,
    onCloseUnsaved,
  };
};
