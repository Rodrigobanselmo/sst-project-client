/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  IEngsRiskData,
  IRecMed,
  IRecMedRiskData,
} from 'core/interfaces/api/IRiskFactors';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

export const initialEngsRiskDataState = {
  id: '',
  medName: '',
  status: StatusEnum.ACTIVE,
  engsRiskData: {} as Partial<IEngsRiskData>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (eng: Partial<IRecMed> | null) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmit: (eng: Partial<IRecMed> | null) => {},
};

interface ISubmit {
  medName: string;
}

export const useEditEngsRisk = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEngsRiskDataState);
  const switchRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, control, reset, getValues, setValue } = useForm();

  // const createMutation = useMutCreateEng();
  // const updateMutation = useMutUpdateEng();

  const { preventUnwantedChanges } = usePreventAction();

  const [engData, setEngData] = useState({
    ...initialEngsRiskDataState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialEngsRiskDataState>>(
      ModalEnum.EPC_RISK_DATA,
    );

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setEngData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.EPC_RISK_DATA, data);
    setEngData(initialEngsRiskDataState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const beforeObject = cleanObjectValues({
      ...engData,
      ...cleanObjectValues(values),
    });
    const afterObject = cleanObjectValues(initialDataRef.current);

    if (preventUnwantedChanges(afterObject, beforeObject, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: Partial<IRecMed> = {
      ...engData,
      ...data,
      engsRiskData: {
        ...engData.engsRiskData,
        recMedId: engData.id,
      },
    };

    if (engData.onSubmit) {
      engData.onSubmit(submitData);
    }

    try {
      // if (!submitData.id) {
      //   delete submitData.id;
      //   await createMutation
      //     .mutateAsync(submitData)
      //     .then((eng) => engData.callback(eng));
      // } else {
      //   await updateMutation
      //     .mutateAsync(submitData)
      //     .then((eng) => engData.callback(eng));
      // }

      if (!switchRef.current?.checked) {
        onClose();
      } else {
        setEngData({
          ...initialEngsRiskDataState,
        });
        reset();
      }
    } catch (error) {}
  };

  const onSelectCheck = (isChecked: boolean, type: keyof IRecMedRiskData) => {
    setEngData((oldData) => ({
      ...oldData,
      engsRiskData: {
        ...oldData.engsRiskData,
        [type]: isChecked,
      },
    }));
  };

  const onSelectAllChecked = (isChecked: boolean) => {
    setEngData((oldData) => ({
      ...oldData,
      engsRiskData: {
        ...oldData.engsRiskData,
        efficientlyCheck: isChecked,
      },
    }));
  };

  const isEdit = !!engData.engsRiskData?.recMedId;

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    engData,
    onSubmit,
    loading: false,
    control,
    handleSubmit,
    setEngData,
    switchRef,
    isEdit,
    onSelectCheck,
    onSelectAllChecked,
    setValue,
  };
};

export type IUseEditEng = ReturnType<typeof useEditEngsRisk>;
