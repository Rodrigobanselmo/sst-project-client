import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import {
  IUpsertRiskGroupData,
  useMutUpsertRiskGroupData,
} from 'core/services/hooks/mutations/checklist/riskGroupData/useMutUpsertRiskGroupData';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useStep = ({ data, setData }: IUseAddCompany) => {
  const { control } = useFormContext();
  const { nextStep, previousStep } = useWizard();

  const updateMutation = useMutUpsertRiskGroupData();

  const onPrevStep = async () => {
    previousStep();
  };

  const onSubmit = async () => {
    const submitData: IUpsertRiskGroupData = {
      complementaryDocs: data.complementaryDocs,
      complementarySystems: data.complementarySystems,
      id: data.id,
    };

    if (data.id) {
      setData((data) => ({ ...data, ...submitData } as any));
      await updateMutation
        .mutateAsync(submitData)
        .then(() => {
          nextStep();
        })
        .catch(() => {});
    }
  };

  const onAddArray = (
    value: string,
    type: 'complementaryDocs' | 'complementarySystems',
  ) => {
    setData({
      ...data,
      [type]: [...(data as any)[type], value],
    });
  };

  const onDeleteArray = (
    value: string,
    type: 'complementaryDocs' | 'complementarySystems',
  ) => {
    setData({
      ...data,
      [type]: [...(data as any)[type].filter((item: string) => item !== value)],
    });
  };

  return {
    onSubmit,
    loading: updateMutation.isLoading,
    control,
    onAddArray,
    onDeleteArray,
    onPrevStep,
  };
};
