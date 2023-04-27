import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';

export const useExamsStep = ({
  data,
  setData,
  onCloseUnsaved: onClose,
  employee,
  ...rest
}: IUseEditEmployee) => {
  const { setError, control, reset, setValue, clearErrors } = useFormContext();
  const { nextStep, stepCount, goToStep, previousStep } = useWizard();

  const evalExam = data.examsData.find((x) => x.isAvaliation);

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    let isErrorFound = false;
    clearErrors();
    if (!data.avaliationExam?.id && !evalExam) {
      setError('avaliationExam', { message: 'Campo obrigatório' });
      isErrorFound = true;
    }

    if (isErrorFound) return;

    nextStep();
  };

  return {
    onSubmit,
    control,
    onCloseUnsaved,
    lastStep,
    data,
    setData,
    setValue,
    employee,
    previousStep,
    evalExam,
    setError,
    clearErrors,
    ...rest,
  };
};
