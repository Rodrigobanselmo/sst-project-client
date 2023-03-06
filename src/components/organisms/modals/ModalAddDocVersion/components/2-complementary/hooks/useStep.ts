import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import {
  IUpsertPGRDocumentData,
  useMutUpsertPGRDocumentData,
} from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertPGRDocumentData/useMutUpsertPGRDocumentData';
import { IUpsertRiskGroupData } from 'core/services/hooks/mutations/checklist/riskGroupData/useMutUpsertRiskGroupData';

import { IUsePGRHandleModal } from '../../../hooks/usePGRHandleActions';

export const useStep = ({ data, setData }: IUsePGRHandleModal) => {
  const { control, trigger, getValues } = useFormContext();
  const { previousStep, goToStep, stepCount } = useWizard();

  const updateMutation = useMutUpsertPGRDocumentData();

  const fields = ['visitDate', 'source'];

  const onPrevStep = async () => {
    previousStep();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);
    if (!isValid) return;

    const { visitDate, source } = getValues();

    const submitData: IUpsertPGRDocumentData = {
      id: data.id,
      companyId: data.companyId,
      workspaceId: data.workspaceId,
      json: {
        complementaryDocs: data.json?.complementaryDocs,
        complementarySystems: data.json?.complementarySystems,
        visitDate: visitDate || null,
        source,
        isQ5: data.json?.isQ5,
        hasEmergencyPlan: data.json?.hasEmergencyPlan,
      },
    };

    setData((data) => ({ ...data, ...submitData } as any));
    await updateMutation
      .mutateAsync(submitData)
      .then(() => {
        goToStep(stepCount - 1);
      })
      .catch(() => {});
  };

  const onAddArray = (
    value: string,
    type: 'complementaryDocs' | 'complementarySystems',
  ) => {
    setData({
      ...data,
      json: {
        ...data.json,
        [type]: [...(data.json as any)[type], value],
      },
    });
  };

  const onDeleteArray = (
    value: string,
    type: 'complementaryDocs' | 'complementarySystems',
  ) => {
    setData({
      ...data,
      json: {
        ...data.json,
        [type]: [
          ...(data.json as any)[type].filter((item: string) => item !== value),
        ],
      },
    });
  };

  return {
    onSubmit,
    loading: updateMutation.isLoading,
    control,
    onAddArray,
    onDeleteArray,
    onPrevStep,
    setData,
    data,
  };
};
