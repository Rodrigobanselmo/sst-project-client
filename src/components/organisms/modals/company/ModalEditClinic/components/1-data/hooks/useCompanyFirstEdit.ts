import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import dayjs from 'dayjs';

import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';

import { IUseAddCompany } from '../../../hooks/useEditClinic';
import { phoneMask } from './../../../../../../../../core/utils/masks/phone.mask';

export const useCompanyEdit = ({
  companyData,
  onSubmitData,
  cnpjMutation,
  setCompanyData,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
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
    'initials',
    'responsibleNit',
    'responsibleCpf',
    'initials',
    'unit',
  ];

  const onChangeCnpj = async (value: string) => {
    if (value.replace(/\D/g, '').length === 14) {
      try {
        const data = await cnpjMutation.mutateAsync(value).catch(() => {});
        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            if (value) {
              if (key == 'cnpj') return;
              if (key == 'phone')
                return setValue('phone', phoneMask.mask(data.phone));
              if (data.address)
                Object.entries(data.address).forEach(([key, value]) => {
                  if (value) setValue(key, value);
                });
              setValue(key, value);
            }
          });

          setCompanyData((oldData) => {
            const newData = {
              ...oldData,
              ...data,
              activityStartDate: data.activity_start_date
                ? dayjs(data.activity_start_date).toDate() || undefined
                : undefined,
            };

            return newData;
          });
        }
      } catch (error) {
        //
      }
    }
  };

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
      const {
        name,
        fantasy,
        type,
        email,
        phone,
        responsibleName,
        responsibleNit,
        responsibleCpf,
        initials,
        unit,
      } = getValues();

      const submitData = {
        ...companyData,
        name,
        fantasy,
        type,
        email,
        phone,
        responsibleName,
        responsibleNit,
        responsibleCpf,
        initials,
        unit,
      };

      onSubmitData(submitData, nextStep);
    }
  };

  return {
    onSubmit,
    loading: updateCompany.isLoading,
    control,
    onCloseUnsaved,
    lastStep,
    onChangeCnpj,
  };
};
