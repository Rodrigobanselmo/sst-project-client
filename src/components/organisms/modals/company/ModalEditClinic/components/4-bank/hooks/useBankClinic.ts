import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';

import { IUseAddCompany } from '../../../hooks/useEditClinic';

export const useBankClinic = ({
  companyData,
  onSubmitData,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
  const { previousStep, nextStep } = useWizard();

  const updateCompany = useMutUpdateCompany();

  const fields = ['paymentDay', 'paymentType'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved(() => reset());
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { paymentType, paymentDay } = getValues();

      const submitData = {
        ...companyData,
        isTaxNote: companyData.isTaxNote || false,
        observationBank: companyData.observationBank || undefined,
        paymentDay: paymentDay || undefined,
        paymentType: paymentType || undefined,
        companyId: companyData.id,
      };

      onSubmitData(submitData, nextStep);
    }
  };

  return {
    onSubmit,
    loading: updateCompany.isLoading,
    control,
    previousStep,
    onCloseUnsaved,
    setValue,
  };
};
