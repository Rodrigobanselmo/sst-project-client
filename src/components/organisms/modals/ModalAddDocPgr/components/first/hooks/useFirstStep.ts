import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import {
  IUpsertRiskGroupData,
  useMutUpsertRiskGroupData,
} from 'core/services/hooks/mutations/checklist/useMutUpsertRiskGroupData';

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
  ];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { name, approvedBy, elaboratedBy, visitDate, revisionBy, source } =
        getValues();

      const submitData: IUpsertRiskGroupData = {
        name,
        approvedBy,
        elaboratedBy,
        visitDate,
        revisionBy,
        source,
        id: data.id,
      };

      if (data.id) {
        await updateMutation.mutateAsync(submitData);
        setData((data) => ({ ...data, ...submitData }));
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
