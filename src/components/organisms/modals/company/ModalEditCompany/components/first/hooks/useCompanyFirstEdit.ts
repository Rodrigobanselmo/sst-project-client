import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/useMutUpdateCompany';

import { IUseAddCompany } from '../../../hooks/useEditCompany';

export const useCompanyEdit = ({
  companyData,
  setCompanyData,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset } = useFormContext();
  const { nextStep, stepCount, goToStep } = useWizard();

  const updateCompany = useMutUpdateCompany();

  const fields = [
    'cnpj',
    'email',
    'phone',
    'name',
    'fantasy',
    'type',
    'responsibleName',
  ];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { name, fantasy, type, email, phone, responsibleName } =
        getValues();

      const submitData = {
        ...companyData,
        name,
        fantasy,
        type,
        email,
        phone,
        responsibleName,
      };

      nextStep();
      setCompanyData((companyData) => ({ ...companyData, ...submitData }));
    }
  };

  return {
    onSubmit,
    loading: updateCompany.isLoading,
    control,
    onCloseUnsaved,
    lastStep,
  };
};
