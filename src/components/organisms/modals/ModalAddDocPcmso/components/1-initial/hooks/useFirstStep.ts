import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import deepEqual from 'deep-equal';

import {
  IUpsertDocumentPCMSO,
  useMutUpsertDocumentPCMSO,
} from 'core/services/hooks/mutations/checklist/docPCMSO/useMutUpsertDocPCMSO';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useFirstStep = ({
  data,
  setData,
  pcmsoDoc,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset } = useFormContext();
  const { nextStep } = useWizard();

  const updateMutation = useMutUpsertDocumentPCMSO();

  const fields = ['name', 'approvedBy', 'elaboratedBy', 'revisionBy'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { name, approvedBy, elaboratedBy, revisionBy } = getValues();

      const submitData: IUpsertDocumentPCMSO = {
        name,
        approvedBy,
        elaboratedBy,
        revisionBy,
        id: pcmsoDoc?.id,
      };

      if (!deepEqual({ ...data, ...submitData }, data)) {
        await updateMutation.mutateAsync(submitData).catch(() => {});
        setData((data) => ({ ...data, ...submitData } as any));
      }
      nextStep();
    }
  };

  return {
    onSubmit,
    loading: updateMutation.isLoading,
    control,
    onCloseUnsaved,
  };
};
