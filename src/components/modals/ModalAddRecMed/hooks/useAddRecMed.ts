/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutAddChecklist } from 'core/services/hooks/mutations/useMutAddChecklist';
import { recMedSchema } from 'core/utils/schemas/recMed.schema';

export const initialAddRecMedState = {
  status: StatusEnum.ACTIVE,
  recName: '',
  medName: '',
  localId: '' as string | number,
  risk: {} as IRiskFactors,
  riskIds: [] as (string | number)[],
  hasSubmit: false,
  passDataBack: false,
  edit: false,
};

export const useAddRecMed = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAddRecMedState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(recMedSchema),
  });
  const mutation = useMutAddChecklist();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [recMedData, setRecMedData] = useState({
    ...initialAddRecMedState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialAddRecMedState>>(
      ModalEnum.REC_MED_ADD,
    );

    if (initialData) {
      setRecMedData((oldData) => {
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
    onCloseModal(ModalEnum.REC_MED_ADD, data);
    setRecMedData(initialAddRecMedState);
    reset();
  };

  const onRemove = () => {
    if (recMedData.passDataBack)
      onCloseModal(ModalEnum.REC_MED_ADD, {
        remove: true,
        isAddRecMed: true,
        localId: recMedData.localId,
      });

    setRecMedData(initialAddRecMedState);
    reset();
  };

  const onSubmit: SubmitHandler<{ recName: string; medName: string }> = (
    data,
  ) => {
    if (recMedData.passDataBack)
      return onClose({
        status: recMedData.status,
        isAddRecMed: true,
        edit: recMedData.edit,
        localId: recMedData?.localId,
        ...data,
      });

    if (!recMedData.risk.id) return;

    const submitData = {
      status: recMedData.status,
      riskId: recMedData.risk.id,
      ...data,
    };

    console.log(submitData);

    // TODO create rec med
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...recMedData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: mutation.isLoading,
    recMedData,
    setRecMedData,
    control,
    handleSubmit,
    onRemove: () => preventDelete(onRemove),
  };
};
