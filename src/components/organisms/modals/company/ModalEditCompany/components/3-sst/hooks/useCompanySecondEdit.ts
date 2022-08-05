import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { IUseAddCompany } from '../../../hooks/useEditCompany';

export const useCompanyEdit = ({
  companyData,
  setCompanyData,
  cepMutation,
  onSubmitData,
  isEdit,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
  const { nextStep, previousStep, activeStep, goToStep, stepCount } =
    useWizard();

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved(() => reset());
  };

  const onChangeCep = async (value: string) => {
    if (value.replace(/\D/g, '').length === 8) {
      try {
        const data = await cepMutation.mutateAsync(value).catch(() => {});
        if (data)
          Object.entries(data).forEach(([key, value]) => {
            setValue(key, value);
          });

        setCompanyData((oldData) => {
          const newData = {
            ...oldData,
            ...data,
          };
          return newData;
        });
      } catch (error) {
        //
      }
    }
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    const { numAsos } = getValues();

    const submitData = {
      ...companyData,
      numAsos,
      doctorResponsibleId: companyData.doctorResponsible?.id || undefined,
      tecResponsibleId: companyData.tecResponsible?.id || undefined,
      isSavedCreation: !isEdit,
    };

    console.log(submitData);
    onSubmitData(submitData, nextStep, { save: true });
  };

  return {
    onSubmit,
    control,
    onCloseUnsaved,
    previousStep,
    activeStep,
    onChangeCep,
    lastStep,
  };
};
