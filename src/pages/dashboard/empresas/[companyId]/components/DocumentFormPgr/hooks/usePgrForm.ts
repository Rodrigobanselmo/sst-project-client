import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import {
  IUpsertRiskGroupData,
  useMutUpsertRiskGroupData,
} from 'core/services/hooks/mutations/checklist/useMutUpsertRiskGroupData';
import { pgrSchema } from 'core/utils/schemas/pgr.schema';

interface ISubmit
  extends Omit<IUpsertRiskGroupData, 'status' | 'id' | 'companyId'> {}

export const usePgrForm = (docId: string) => {
  const { handleSubmit, control, getValues, trigger } = useForm({
    resolver: yupResolver(pgrSchema),
  });

  const updateMutation = useMutUpsertRiskGroupData();

  const onSubmitNewVersion: SubmitHandler<ISubmit> = async (data) => {
    const submitData: IUpsertRiskGroupData = {
      id: docId,
      ...data,
    };
    await updateMutation.mutateAsync(submitData);
  };

  const onSave = async () => {
    const isValid = await trigger(['name']);

    if (isValid) {
      const { name, approvedBy, elaboratedBy, visitDate, revisionBy }: ISubmit =
        getValues();
      await updateMutation.mutateAsync({
        id: docId,
        name,
        approvedBy,
        elaboratedBy,
        visitDate,
        revisionBy,
      });
    }
  };

  return {
    onSubmitNewVersion,
    loading: updateMutation.isLoading,
    control,
    handleSubmit,
    onSave,
  };
};

export type IUseEditWorkspace = ReturnType<typeof usePgrForm>;
