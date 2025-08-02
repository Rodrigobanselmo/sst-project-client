/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutationCEP } from 'core/services/hooks/mutations/general/useMutationCep';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';

import { heatSchema } from '../../../../../core/utils/schemas/heat.schema';

export const initialActivityState = {
  risk: {
    stel: '',
    twa: '',
    nr15lt: '',
    vmp: '',
    activities: [] as any,
  } as IRiskFactors,
  activities: [],
  realActivity: '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreate: (value: any) => {},
};

interface ISubmit {
  activities: { description?: string; subActivity?: string }[];
  realActivity?: string;
}

const modalName = ModalEnum.ACTIVITY_ADD;

export const useModalAddActivity = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialActivityState);

  const updateMutation = useMutUpdateCompany();
  const cepMutation = useMutationCEP();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialActivityState,
  });

  const { handleSubmit, control, reset, getValues, setValue, watch } =
    useForm();

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialActivityState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };
        initialDataRef.current = newData;

        setValue('activities', initialDataRef.current.activities);

        return newData;
      });
    }
  }, [getModalData, setValue]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialActivityState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...data, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (dataFrom) => {
    const submit = {
      activities: dataFrom.activities.map((activity) => ({
        description: activity.description,
        subActivity: activity.subActivity,
      })),
      realActivity: dataFrom.realActivity,
    };

    data.onCreate && data.onCreate(submit);

    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    onSubmit,
    loading: updateMutation.isLoading,
    loadingCep: cepMutation.isLoading,
    control,
    handleSubmit,
    data,
    setData,
    modalName,
    setValue,
    watch,
  };
};

export type IUseModalActivity = ReturnType<typeof useModalAddActivity>;
