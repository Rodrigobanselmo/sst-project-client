import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { IdsEnum } from 'core/enums/ids.enums';
import { ICreateCat } from 'core/services/hooks/mutations/manager/cat/useMutCreateCat/useMutCreateCat';

import { IUseAddCat } from '../../../hooks/useAddCat';

export const useEmployeeData = (props: IUseAddCat) => {
  const { catData, onCloseUnsaved: onClose, onSubmitData } = props;

  const { trigger, control, reset, setValue, clearErrors } = useFormContext();
  const { nextStep, stepCount, goToStep } = useWizard();

  const fields = ['motiveId'];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSelectEmployee = () => {
    const button = document.getElementById(IdsEnum.EMPLOYEE_SELECT_ID);
    button?.click();
  };

  const onSubmit = async () => {
    clearErrors();
    const isValid = await trigger(fields);
    if (!isValid) return;

    if (!catData.employeeId) return;
    if (!catData.companyId) return;

    const submitData: Partial<ICreateCat> & { id?: number } = {
      ...catData,
      id: catData.id,
      companyId: catData.companyId,
      employeeId: catData.employeeId as number,
    };

    onSubmitData(submitData, nextStep, { save: false });
  };

  return {
    ...props,
    onSubmit,
    control,
    onSelectEmployee,
    setValue,
    onCloseUnsaved,
    lastStep,
  };
};

export type IUseMotiveData = ReturnType<typeof useEmployeeData>;
