import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';

import { IUseAddCompany } from '../../../hooks/useEditCompany';

export const useCompanyEdit = ({
  companyData,
  isEdit,
  onSubmitData,
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
        ...(isEdit ? {
          id: companyData.id,
          activity_start_date: companyData.activity_start_date,
          primary_activity: companyData.primary_activity,
          status: companyData.status,
          license: companyData.license,
          isConsulting: companyData.isConsulting,
          permissions: companyData.permissions,
        } : companyData),
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

      onSubmitData(submitData, nextStep, { onlyChanges: true });
    }
  };

  return {
    onSubmit,
    loading: updateCompany.isLoading,
    control,
    onCloseUnsaved,
    lastStep,
    setValue,
  };
};
