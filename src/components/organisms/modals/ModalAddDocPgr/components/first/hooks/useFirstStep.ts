import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import deepEqual from 'deep-equal';

import {
  IUpsertRiskGroupData,
  useMutUpsertRiskGroupData,
} from 'core/services/hooks/mutations/checklist/riskGroupData/useMutUpsertRiskGroupData';
import { dateFormat } from 'core/utils/date/date-format';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useFirstStep = ({ data, setData, ...rest }: IUseAddCompany) => {
  const { trigger, getValues, control, reset } = useFormContext();
  const { nextStep } = useWizard();

  const updateMutation = useMutUpsertRiskGroupData();

  const fields = [
    'name',
    'approvedBy',
    'elaboratedBy',
    'visitDate',
    'revisionBy',
    'source',
    'coordinatorBy',
  ];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const {
        name,
        approvedBy,
        elaboratedBy,
        visitDate,
        revisionBy,
        source,
        coordinatorBy,
      } = getValues();

      const submitData: IUpsertRiskGroupData = {
        name,
        approvedBy,
        elaboratedBy,
        visitDate: dateFormat(visitDate),
        revisionBy,
        source,
        id: data.id,
        isQ5: data.isQ5,
        hasEmergencyPlan: data.hasEmergencyPlan,
        coordinatorBy,
      };

      if (data.id) {
        if (!deepEqual({ ...data, ...submitData }, data)) {
          await updateMutation.mutateAsync(submitData).catch(() => {});
          setData((data) => ({ ...data, ...submitData } as any));
        }
        nextStep();
      }
    }
  };

  return {
    onSubmit,
    loading: updateMutation.isLoading,
    control,
    onCloseUnsaved,
  };
};
