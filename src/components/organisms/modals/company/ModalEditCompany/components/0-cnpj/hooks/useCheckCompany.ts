import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import dayjs from 'dayjs';

import { IErrorResp } from 'core/services/errors/types';
import { useMutationCNPJ } from 'core/services/hooks/mutations/general/useMutationCnpj';
import { GetCNPJResponse } from 'core/services/hooks/mutations/general/useMutationCnpj/types';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseAddCompany } from '../../../hooks/useEditCompany';

export const useCheckCompany = ({
  setCompanyData,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
  const { nextStep } = useWizard();

  const cnpjMutation = useMutationCNPJ();

  const fields = ['cnpj'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { cnpj } = getValues();
      const next = (data: GetCNPJResponse = {} as GetCNPJResponse) => {
        nextStep();
        setCompanyData((state) => ({
          ...state,
          ...data,
          phone: phoneMask.mask(data.phone),
          activity_start_date: data.activity_start_date
            ? dayjs(data.activity_start_date).toDate() || undefined
            : undefined,
          cnpj,
        }));
      };

      try {
        const data = await cnpjMutation.mutateAsync(cnpj);
        next(data);
      } catch (error) {
        if ((error as IErrorResp).response.status === 500) next();
      }
    }
  };

  return {
    onSubmit,
    loading: cnpjMutation.isLoading,
    control,
    onCloseUnsaved,
    setValue,
  };
};
