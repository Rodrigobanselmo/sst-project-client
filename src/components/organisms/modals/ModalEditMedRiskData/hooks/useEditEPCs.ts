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
import { IRecMed, IRecMedRiskData } from 'core/interfaces/api/IRiskFactors';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

export const initialEPCDataState = {
  id: '',
  medName: '',
  status: StatusEnum.ACTIVE,
  recMedToRiskFactorData: {} as Partial<IRecMedRiskData>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (epc: Partial<IRecMed> | null) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmit: (epc: Partial<IRecMed> | null) => {},
};

interface ISubmit {
  medName: string;
}

export const useEditEPCs = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEPCDataState);
  const switchRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, control, reset, getValues } = useForm();

  // const createMutation = useMutCreateEPC();
  // const updateMutation = useMutUpdateEPC();

  const { preventUnwantedChanges } = usePreventAction();

  const [epcData, setEPCData] = useState({
    ...initialEPCDataState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialEPCDataState>>(
      ModalEnum.EPC_RISK_DATA,
    );

    if (initialData) {
      setEPCData((oldData) => {
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
    setEPCData(initialEPCDataState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const beforeObject = cleanObjectValues({
      ...epcData,
      ...cleanObjectValues(values),
    });
    const afterObject = cleanObjectValues(initialDataRef.current);

    if (preventUnwantedChanges(afterObject, beforeObject, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: Partial<IRecMed> = {
      // ...epcData,
      ...data,
      // recMedToRiskFactorData: {
      //   ...epcData.epcRiskData,
      //   epcId: epcData.id,
      // },
    };

    if (epcData.onSubmit) {
      epcData.onSubmit(submitData);
    }

    try {
      // if (!submitData.id) {
      //   delete submitData.id;
      //   await createMutation
      //     .mutateAsync(submitData)
      //     .then((epc) => epcData.callback(epc));
      // } else {
      //   await updateMutation
      //     .mutateAsync(submitData)
      //     .then((epc) => epcData.callback(epc));
      // }

      if (!switchRef.current?.checked) {
        onClose();
      } else {
        setEPCData({
          ...initialEPCDataState,
        });
        reset();
      }
    } catch (error) {}
  };

  const onSelectCheck = (isChecked: boolean, type: keyof IRecMedRiskData) => {
    setEPCData((oldData) => ({
      ...oldData,
      recMedToRiskFactorData: {
        ...oldData.recMedToRiskFactorData,
        [type]: isChecked,
      },
    }));
  };

  const onSelectAllChecked = (isChecked: boolean) => {
    setEPCData((oldData) => ({
      ...oldData,
      epcRiskData: {
        ...oldData.recMedToRiskFactorData,
        efficientlyCheck: isChecked,
      },
    }));
  };

  const isEdit = !!epcData.recMedToRiskFactorData?.recMedId;

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    epcData,
    onSubmit,
    loading: false,
    control,
    handleSubmit,
    setEPCData,
    switchRef,
    isEdit,
    onSelectCheck,
    onSelectAllChecked,
  };
};

export type IUseEditEPC = ReturnType<typeof useEditEPCs>;
