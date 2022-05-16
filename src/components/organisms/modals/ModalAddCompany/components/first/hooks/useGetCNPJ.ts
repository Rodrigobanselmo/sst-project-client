import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { useMutCreateCompany } from 'core/services/hooks/mutations/company/useMutCreateCompany';

import { IUseAddCompany } from '../../../hooks/useAddCompany';

export const useGetCNPJ = ({ setCompanyData, ...rest }: IUseAddCompany) => {
  const { trigger, getValues, control, reset } = useFormContext();
  const { nextStep } = useWizard();

  const createCompany = useMutCreateCompany();
  const updateCompany = useMutCreateCompany();

  const fields = ['cnpj'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { cnpj } = getValues();
      nextStep();
      setCompanyData((state) => ({
        ...state,
        cnpj,
      }));
    }
  };

  return {
    onSubmit,
    loading: createCompany.isLoading || updateCompany.isLoading,
    control,
    onCloseUnsaved,
  };
};
