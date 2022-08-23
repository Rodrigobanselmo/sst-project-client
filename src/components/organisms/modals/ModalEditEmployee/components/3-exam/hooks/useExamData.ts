import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { IUseEditEmployee } from '../../../hooks/useEditEmployee';

export const useExamData = ({
  data,
  onSubmitData,
  setData,
  onCloseUnsaved: onClose,
  ...rest
}: IUseEditEmployee) => {
  const { trigger, control, reset } = useFormContext();
  const { nextStep, stepCount, goToStep } = useWizard();

  const fields: string[] = [];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const submitData = {
        ...data,
      };

      onSubmitData(submitData, nextStep);
    }
  };

  return {
    onSubmit,
    control,
    onCloseUnsaved,
    lastStep,
    data,
    setData,
    ...rest,
  };
};
