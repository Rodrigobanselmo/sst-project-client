import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import {
  IUpsertPGRDocumentData,
  useMutUpsertPGRDocumentData,
} from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertPGRDocumentData/useMutUpsertPGRDocumentData';
import { IUpsertRiskGroupData } from 'core/services/hooks/mutations/checklist/riskGroupData/useMutUpsertRiskGroupData';

import { IUsePGRHandleModal } from '../../../hooks/usePGRHandleActions';
import { useMutUpsertPCSMODocumentData } from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertPCSMOODocumentData/useMutUpsertPCSMODocumentData';
import { DocumentTypeEnum } from 'project/enum/document.enums';

export const useStep = ({ data, setData }: IUsePGRHandleModal) => {
  const { control, trigger, getValues, setValue } = useFormContext();
  const { previousStep, goToStep, stepCount } = useWizard();

  const updateMutation = useMutUpsertPGRDocumentData();
  const updatePcmsoMutation = useMutUpsertPCSMODocumentData();

  const fields = ['visitDate', 'source'];

  const onPrevStep = async () => {
    previousStep();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);
    if (!isValid) return;

    const {
      visitDate,
      source,
      months_period_level_2,
      months_period_level_3,
      months_period_level_4,
      months_period_level_5,
    } = getValues();

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
        months_period_level_2: months_period_level_2,
        months_period_level_3: months_period_level_3,
        months_period_level_4: months_period_level_4,
        months_period_level_5: months_period_level_5,
      },
    };

    setData((data) => ({ ...data, ...submitData } as any));
    await (data.type == DocumentTypeEnum.PCSMO
      ? updatePcmsoMutation
      : updateMutation
    )
      .mutateAsync(submitData)
      .then(() => {
        // goToStep(stepCount - 1);
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
    loading: updateMutation.isLoading || updatePcmsoMutation.isLoading,
    control,
    onAddArray,
    onDeleteArray,
    onPrevStep,
    setData,
    data,
    setValue,
  };
};
