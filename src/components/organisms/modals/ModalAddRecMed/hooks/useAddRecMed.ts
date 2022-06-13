/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutCreateRecMed } from 'core/services/hooks/mutations/checklist/recMed/useMutCreateRecMed';
import { useMutDeleteRecMed } from 'core/services/hooks/mutations/checklist/recMed/useMutDeleteRecMed';
import { useMutUpdateRecMed } from 'core/services/hooks/mutations/checklist/recMed/useMutUpdateRecMed';
import { recMedSchema } from 'core/utils/schemas/recMed.schema';

export const initialAddRecMedState = {
  status: StatusEnum.ACTIVE,
  recName: '',
  medName: '',
  id: '',
  localId: '' as string | number,
  risk: {} as IRiskFactors,
  riskIds: [] as (string | number)[],
  hasSubmit: false,
  passDataBack: false,
  edit: false,
  medType: null as MedTypeEnum | null | '',
  onCreate: (value: IRecMed | null) => {},
  onlyInput: '' as 'rec' | 'eng' | 'adm' | '',
};

export const useAddRecMed = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAddRecMedState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(recMedSchema),
  });

  const createRecMedMut = useMutCreateRecMed();
  const updateRecMedMut = useMutUpdateRecMed();
  const deleteMedMut = useMutDeleteRecMed();

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

  const onRemove = async () => {
    if (recMedData.passDataBack)
      onCloseModal(ModalEnum.REC_MED_ADD, {
        remove: true,
        isAddRecMed: true,
        localId: recMedData.localId,
      });
    else {
      await deleteMedMut.mutateAsync(recMedData.id).catch(() => {});
      onClose();
    }

    setRecMedData(initialAddRecMedState);
    reset();
  };

  const onSubmit: SubmitHandler<{
    recName: string;
    medName: string;
    medType: string;
  }> = async (data) => {
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

    try {
      if (recMedData.id == '') {
        const result = await createRecMedMut
          .mutateAsync(submitData)
          .catch(() => {});
        if (result) recMedData.onCreate(result);
      } else {
        await updateRecMedMut
          .mutateAsync({
            ...submitData,
            id: recMedData.id,
          })
          .catch(() => {});
      }
    } catch (error) {}

    onClose();
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
    loading:
      createRecMedMut.isLoading ||
      updateRecMedMut.isLoading ||
      deleteMedMut.isLoading,
    recMedData,
    setRecMedData,
    control,
    handleSubmit,
    onRemove: () => preventDelete(onRemove),
  };
};
