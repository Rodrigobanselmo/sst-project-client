/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { ICreateAbsenteeism } from 'core/services/hooks/mutations/manager/absenteeism/useMutCreateAbsenteeism/useMutCreateAbsenteeism';

import { IUseAddAbsenteeism } from '../../../hooks/useAddAbsenteeism';

export const useDoctorData = (props: IUseAddAbsenteeism) => {
  const { absenteeismData, onCloseUnsaved: onClose, onSubmitData } = props;

  const { trigger, getValues, control, reset, setValue, clearErrors } =
    useFormContext();
  const { nextStep, stepCount, goToStep, previousStep } = useWizard();

  const fields = ['local'];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    clearErrors();
    const isValid = await trigger(fields);
    if (!isValid) return;

    const { local } = getValues();

    // let error = false;
    // if (!absenteeismData.startDate) {
    //   setError('startDate', { message: 'Campo obrigatório' });
    //   error = true;
    // }

    // if (error) return;

    const submitData: ICreateAbsenteeism & { id?: number } = {
      ...(absenteeismData as any),
      docId: absenteeismData?.doc?.id || absenteeismData.docId,
      cidId: absenteeismData.cid?.cid || absenteeismData.cidId,
      local,
    };

    onSubmitData(submitData, nextStep);
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

export type IUseDoctorData = ReturnType<typeof useDoctorData>;
