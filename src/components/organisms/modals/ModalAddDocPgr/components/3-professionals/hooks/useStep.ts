import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import deepEqual from 'deep-equal';
import { useSnackbar } from 'notistack';

import { IUser } from 'core/interfaces/api/IUser';
import {
  IUpsertRiskGroupData,
  useMutUpsertRiskGroupData,
} from 'core/services/hooks/mutations/checklist/riskGroupData/useMutUpsertRiskGroupData';
import { dateFormat } from 'core/utils/date/date-format';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useStep = ({ data, setData, initialDataRef }: IUseAddCompany) => {
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
        validityStart: dateFormat(`01/${validityStart}`),
        validityEnd: dateFormat(`01/${validityEnd}`),
        professionalsIds: data.professionals.map((p) => p.id),
        users: data.users,
        id: data.id,
      };

      if (data.id) {
        const before = cleanObjectValues(initialDataRef.current);
        const after = { ...data, ...submitData };

        if (!deepEqual(after, before)) {
          await updateMutation
            .mutateAsync(submitData)
            .then(() => {
              setData((data) => {
                const setDataObj = {
                  ...data,
                  validityStart: dateFormat(`01/${validityStart}`),
                  validityEnd: dateFormat(`01/${validityEnd}`),
                };
                initialDataRef.current = setDataObj;

                return setDataObj;
              });
              nextStep();
            })
            .catch(() => {});
        } else {
          nextStep();
        }
      }
    }
  };

  const onAddArray = (user: IUser, type: 'professionals' | 'users') => {
    let value: any;

    if (Array.isArray(user)) {
      value = user.map((u) => ({
        ...u,
        userPgrSignature: { userId: u.id, isSigner: true },
      }));
    } else {
      value = {
        ...user,
        userPgrSignature: { userId: user.id, isSigner: true },
      } as IUser;
    }

    setData({
      ...data,
      [type]: removeDuplicate([...(data as any)[type], ...value], {
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

  const onAddSigner = (
    user: IUser,
    check: boolean,
    type: 'professionals' | 'users',
  ) => {
    const value = {
      ...user,
      userPgrSignature: { userId: user.id, isSigner: check },
    } as IUser;

    const index = data[type]?.findIndex((item) => item.id === value.id);
    if (index != -1) {
      data[type][index] = value;
    }

    setData({
      ...data,
    });
  };

  return {
    onSubmit,
    loading: updateMutation.isLoading,
    control,
    onPrevStep,
    onAddArray,
    onDeleteArray,
    onAddSigner,
  };
};
