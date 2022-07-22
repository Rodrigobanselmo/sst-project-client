/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteGho';
import { useMutUpdateGho } from 'core/services/hooks/mutations/checklist/gho/useMutUpdateGho';
import { ghoSchema } from 'core/utils/schemas/gho.schema';

export const initialAddGhoState = {
  status: StatusEnum.ACTIVE,
  name: '',
  description: '',
  id: '',
};

export const useAddGho = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAddGhoState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(ghoSchema),
  });

  const createGhoMut = useMutCreateGho();
  const updateGhoMut = useMutUpdateGho();
  const deleteGhoMut = useMutDeleteGho();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [ghoData, setGhoData] = useState({
    ...initialAddGhoState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialAddGhoState>>(
      ModalEnum.GHO_ADD,
    );

    if (initialData) {
      setGhoData((oldData) => {
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
    onCloseModal(ModalEnum.GHO_ADD, data);
    setGhoData(initialAddGhoState);
    reset();
  };

  const onRemove = () => {
    deleteGhoMut.mutate(ghoData.id);
    setGhoData(initialAddGhoState);
    reset();
  };

  const onSubmit: SubmitHandler<{ name: string; description: string }> = async (
    data,
  ) => {
    const submitData = {
      status: ghoData.status,
      ...data,
    };

    if (ghoData.id == '') {
      await createGhoMut.mutateAsync(submitData).catch(() => {});
    } else {
      await updateGhoMut
        .mutateAsync({
          ...submitData,
          id: ghoData.id,
        })
        .catch(() => {});
    }

    onClose();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...ghoData, ...values },
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
    loading: createGhoMut.isLoading || updateGhoMut.isLoading,
    ghoData,
    setGhoData,
    control,
    handleSubmit,
    onRemove: () => preventDelete(onRemove),
  };
};
