/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { ICreateDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutCreateDocumentModel/useMutCreateDocumentModel';

import { IUseDocumentModel } from '../../../hooks/useEditDocumentModel';

export const useDataStep = (props: IUseDocumentModel) => {
  const { onClose, updateMutation, createMutation, data, setData } = props;

  const { getValues, control, setError, reset, setValue, clearErrors } =
    useFormContext();
  const { stepCount, goToStep, nextStep, previousStep } = useWizard();

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    clearErrors();

    const { name, description } = getValues();

    let error = false;
    if (!name) {
      setError('name', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!data.type) {
      setError('type', { message: 'Campo obrigatório' });
      error = true;
    }

    if (error) return;
    if (!data.type) return;

    const submitData: ICreateDocumentModel & { id: number } = {
      name,
      description,
      companyId: data.companyId,
      id: data.id,
      copyFromId: data.copyFromId,
      type: data.type,
    };

    try {
      if (!submitData.id) {
        const createdData = await createMutation.mutateAsync(submitData);
        if (createdData) {
          setData((d) => ({ ...d, id: createdData?.id }));
          nextStep();
        }
      } else {
        await updateMutation.mutateAsync(submitData);
      }
    } catch (error) {}
  };

  return {
    ...props,
    onSubmit,
    control,
    setValue,
    onCloseUnsaved,
    lastStep,
    previousStep,
  };
};

export type IUseData = ReturnType<typeof useDataStep>;
