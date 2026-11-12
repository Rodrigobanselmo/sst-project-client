import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { usePreventAction } from 'core/hooks/usePreventAction';
import { dateToDateLessTime } from 'core/utils/date/date-format';

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
  getInitialCompanyData,
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

    if (isEdit) {
      const initial = getInitialCompanyData();
      const doctorId = companyData.doctorResponsible?.id;
      const asoCount = numAsos === '' || numAsos == null ? undefined : Number(numAsos);
      const policy = healthSafetyEnvironmentPolicy ?? companyData.healthSafetyEnvironmentPolicy ?? '';
      const esocialStart = companyData.esocialStart;
      const changes = {
        ...(esocialStart &&
          dateToDateLessTime(esocialStart)?.getTime() !==
            dateToDateLessTime(initial.esocialStart)?.getTime() && { esocialStart }),
        ...(companyData.esocialSend !== initial.esocialSend && {
          esocialSend: companyData.esocialSend,
        }),
        ...(doctorId != null && doctorId !== initial.doctorResponsible?.id && {
          doctorResponsibleId: doctorId,
        }),
        ...(asoCount != null && asoCount !== initial.numAsos && { numAsos: asoCount }),
        ...(companyData.blockResignationExam !== initial.blockResignationExam && {
          blockResignationExam: companyData.blockResignationExam,
        }),
        ...(policy !== (initial.healthSafetyEnvironmentPolicy ?? '') && {
          healthSafetyEnvironmentPolicy: policy,
        }),
      };

      if (!Object.keys(changes).length) {
        rest.onClose();
        return;
      }

      await onSubmitData({ id: companyData.id, ...changes }, nextStep, { save: true });
      return;
    }

    const submitData = {
      ...companyData,
      numAsos,
      healthSafetyEnvironmentPolicy: healthSafetyEnvironmentPolicy ?? '',
      doctorResponsibleId: companyData.doctorResponsible?.id || undefined,
      tecResponsibleId: companyData.tecResponsible?.id || undefined,
      isSavedCreation: !isEdit,
    };

    await onSubmitData(submitData, nextStep, { save: true });
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
