import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';

export const useEmployeeStep = ({
  data,
  onSubmitData,
  setData,
  onCloseUnsaved: onClose,
  ...rest
}: IUseEditEmployee) => {
  const { trigger, getValues, control, reset } = useFormContext();
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
      // eslint-disable-next-line no-empty-pattern
      const {} = getValues();

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
