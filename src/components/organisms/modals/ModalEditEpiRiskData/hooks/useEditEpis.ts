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
import { IEpi, IEpiRiskData } from 'core/interfaces/api/IEpi';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

export const initialEpiDataState = {
  id: 0,
  ca: '',
  expiredDate: new Date(),
  status: StatusEnum.ACTIVE,
  observation: '',
  equipment: '',
  description: '',
  report: '',
  restriction: '',
  isValid: true,
  epiRiskData: {} as Partial<IEpiRiskData>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (epi: Partial<IEpi> | null) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmit: (epi: Partial<IEpi> | null) => {},
};

interface ISubmit {
  name: string;
  cpf: string;
}

export const useEditEpis = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEpiDataState);
  const switchRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, control, reset, getValues } = useForm();

  // const createMutation = useMutCreateEpi();
  // const updateMutation = useMutUpdateEpi();

  const { preventUnwantedChanges } = usePreventAction();

  const [epiData, setEpiData] = useState({
    ...initialEpiDataState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialEpiDataState>>(
      ModalEnum.EPI_EPI_DATA,
    );

    if (initialData) {
      setEpiData((oldData) => {
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
    onCloseModal(ModalEnum.EPI_EPI_DATA, data);
    setEpiData(initialEpiDataState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const beforeObject = cleanObjectValues({
      ...epiData,
      ...cleanObjectValues(values),
    });
    const afterObject = cleanObjectValues(initialDataRef.current);

    if (preventUnwantedChanges(afterObject, beforeObject, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: Partial<IEpi> = {
      ...epiData,
      ...data,
      epiRiskData: {
        ...epiData.epiRiskData,
        epiId: epiData.id,
      },
    };

    if (epiData.onSubmit) {
      epiData.onSubmit(submitData);
    }

    try {
      // if (!submitData.id) {
      //   delete submitData.id;
      //   await createMutation
      //     .mutateAsync(submitData)
      //     .then((epi) => epiData.callback(epi));
      // } else {
      //   await updateMutation
      //     .mutateAsync(submitData)
      //     .then((epi) => epiData.callback(epi));
      // }

      if (!switchRef.current?.checked) {
        onClose();
      } else {
        setEpiData({
          ...initialEpiDataState,
        });
        reset();
      }
    } catch (error) {}
  };

  const onSelectCheck = (isChecked: boolean, type: keyof IEpiRiskData) => {
    setEpiData((oldData) => ({
      ...oldData,
      epiRiskData: { ...oldData.epiRiskData, [type]: isChecked },
    }));
  };

  const onSelectAllChecked = (isChecked: boolean) => {
    setEpiData((oldData) => ({
      ...oldData,
      epiRiskData: {
        ...oldData.epiRiskData,
        epcCheck: isChecked,
        efficientlyCheck: isChecked,
        longPeriodsCheck: isChecked,
        maintenanceCheck: isChecked,
        sanitationCheck: isChecked,
        unstoppedCheck: isChecked,
        validationCheck: isChecked,
        trainingCheck: isChecked,
        tradeSignCheck: isChecked,
      },
    }));
  };

  const isEdit = !!epiData.epiRiskData?.epiId;
  const isAllSelected = !!(
    epiData.epiRiskData?.efficientlyCheck &&
    epiData.epiRiskData?.epcCheck &&
    epiData.epiRiskData?.longPeriodsCheck &&
    epiData.epiRiskData?.maintenanceCheck &&
    epiData.epiRiskData?.sanitationCheck &&
    epiData.epiRiskData?.unstoppedCheck &&
    epiData.epiRiskData?.validationCheck &&
    epiData.epiRiskData?.tradeSignCheck &&
    epiData.epiRiskData?.trainingCheck
  );
  const isExpired = dayjs(epiData.expiredDate).isBefore(dayjs());

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    epiData,
    onSubmit,
    loading: false,
    control,
    handleSubmit,
    setEpiData,
    switchRef,
    isEdit,
    onSelectCheck,
    onSelectAllChecked,
    isAllSelected,
    isExpired,
  };
};

export type IUseEditEpi = ReturnType<typeof useEditEpis>;
