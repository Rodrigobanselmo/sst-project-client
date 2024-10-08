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

  const fields = [
    'cep',
    'street',
    'neighborhood',
    'city',
    'state',
    'complement',
    'number',
  ];

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
    const isValid = await trigger(fields);
    if (isValid) {
      const { neighborhood, number, city, street, cep, complement, state } =
        getValues();

      const submitData = {
        ...companyData,
        isSavedCreation: !isEdit,
        address: {
          neighborhood: neighborhood,
          number: number,
          city: city,
          street: street,
          cep: cep,
          complement: complement,
          state: state,
        },
      };

      onSubmitData(submitData, nextStep, { save: true });
    }
  };

  return {
    onSubmit,
    control,
    onCloseUnsaved,
    previousStep,
    activeStep,
    onChangeCep,
    lastStep,
    setValue,
  };
};
