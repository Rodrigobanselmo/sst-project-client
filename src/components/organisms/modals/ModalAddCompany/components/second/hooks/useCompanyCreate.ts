import { useFormContext } from 'react-hook-form';

import { useMutCreateCompany } from 'core/services/hooks/mutations/manager/useMutCreateCompany';

import { IUseAddCompany } from '../../../hooks/useAddCompany';

export const useCompanyCreate = ({
  companyData,
  onClose,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset } = useFormContext();

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

      onClose();
    }
  };

  return {
    onSubmit,
    loading: createCompany.isLoading || updateCompany.isLoading,
    control,
    onCloseUnsaved,
  };
};
