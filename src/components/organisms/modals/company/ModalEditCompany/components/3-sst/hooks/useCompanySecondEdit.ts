import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { usePreventAction } from 'core/hooks/usePreventAction';

import { IUseAddCompany } from '../../../hooks/useEditCompany';
import {
  HSE_POLICY_PRESET_OVERWRITE_MESSAGE,
  resolveHsePolicyPresetApplication,
} from '../../../company-hse-policy-preset';

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
  const { preventWarn } = usePreventAction();

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

  const handleApplyHsePolicyPreset = () => {
    const current = getValues('healthSafetyEnvironmentPolicy');
    const resolved = resolveHsePolicyPresetApplication({
      current,
      confirmedOverwrite: false,
    });

    if (resolved === 'needs-confirmation') {
      preventWarn(HSE_POLICY_PRESET_OVERWRITE_MESSAGE, () => {
        const confirmed = resolveHsePolicyPresetApplication({
          current,
          confirmedOverwrite: true,
        });
        if (confirmed !== 'needs-confirmation') {
          setValue('healthSafetyEnvironmentPolicy', confirmed, {
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      });
      return;
    }

    setValue('healthSafetyEnvironmentPolicy', resolved, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onSubmit = async () => {
    const { numAsos, healthSafetyEnvironmentPolicy } = getValues();

    const submitData = {
      ...companyData,
      numAsos,
      healthSafetyEnvironmentPolicy: healthSafetyEnvironmentPolicy ?? '',
      doctorResponsibleId: companyData.doctorResponsible?.id || undefined,
      tecResponsibleId: companyData.tecResponsible?.id || undefined,
      isSavedCreation: !isEdit,
    };

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
    setValue,
    handleApplyHsePolicyPreset,
  };
};
