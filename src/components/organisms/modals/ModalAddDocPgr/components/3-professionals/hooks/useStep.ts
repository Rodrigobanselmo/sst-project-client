import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import deepEqual from 'deep-equal';
import { useSnackbar } from 'notistack';

import { IUser } from 'core/interfaces/api/IUser';
import {
  IUpsertRiskGroupData,
  useMutUpsertRiskGroupData,
} from 'core/services/hooks/mutations/checklist/riskGroupData/useMutUpsertRiskGroupData';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useStep = ({ data, setData }: IUseAddCompany) => {
  const { trigger, getValues, control } = useFormContext();
  const { nextStep, previousStep } = useWizard();
  const { enqueueSnackbar } = useSnackbar();

  const updateMutation = useMutUpsertRiskGroupData();

  const fields = ['validityStart', 'validityEnd'];

  const onPrevStep = async () => {
    previousStep();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { validityStart, validityEnd } = getValues();

      const dateStart = validityStart.split('/');
      const dateEnd = validityEnd.split('/');

      if (Number(dateStart[1]) > Number(dateEnd[1])) {
        return enqueueSnackbar('Data de fim deve ser antes da data de início', {
          variant: 'error',
        });
      }

      if (
        Number(dateStart[1]) == Number(dateEnd[1]) &&
        Number(dateStart[0]) >= Number(dateEnd[0])
      ) {
        return enqueueSnackbar('Data de fim deve ser antes da data de início', {
          variant: 'error',
        });
      }

      const submitData: IUpsertRiskGroupData = {
        validityStart: `01/${validityStart}`,
        validityEnd: `01/${validityEnd}`,
        professionalsIds: data.professionals.map((p) => p.id),
        usersIds: data.users.map((p) => p.id),
        id: data.id,
      };

      if (data.id) {
        if (!deepEqual({ ...data, ...submitData }, data)) {
          await updateMutation.mutateAsync(submitData).catch(() => {});
          setData((data) => ({ ...data, ...submitData }));
        }
        nextStep();
      }
    }
  };

  const onAddArray = (value: IUser, type: 'professionals' | 'users') => {
    setData({
      ...data,
      [type]: removeDuplicate([...(data as any)[type], value], {
        removeById: 'id',
      }),
    });
  };

  const onDeleteArray = (value: IUser, type: 'professionals' | 'users') => {
    setData({
      ...data,
      [type]: [
        ...(data as any)[type].filter((item: IUser) => item.id !== value.id),
      ],
    });
  };

  return {
    onSubmit,
    loading: updateMutation.isLoading,
    control,
    onPrevStep,
    onAddArray,
    onDeleteArray,
  };
};
