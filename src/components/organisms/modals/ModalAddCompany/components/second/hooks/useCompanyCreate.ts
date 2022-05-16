/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { useMutCreateCompany } from 'core/services/hooks/mutations/company/useMutCreateCompany';

import { IUseAddCompany } from '../../../hooks/useAddCompany';

export const useCompanyCreate = ({
  companyData,
  onClose,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset } = useFormContext();
  const { nextStep } = useWizard();

  const createCompany = useMutCreateCompany();
  const updateCompany = useMutCreateCompany();

  const fields = ['cnpj', 'name', 'description', 'fantasy', 'type'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved;
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { cnpj, name, description, fantasy, type } = getValues();
      nextStep();
      onClose();

      const submitData = {
        ...companyData,
        cnpj,
        name,
        description,
        fantasy,
        type,
      };

      if (companyData.id == '') {
        await createCompany.mutateAsync(submitData);
      } else {
        await updateCompany.mutateAsync(submitData);
      }
    }
  };

  return {
    onSubmit,
    loading: createCompany.isLoading || updateCompany.isLoading,
    control,
    onCloseUnsaved,
  };
};
