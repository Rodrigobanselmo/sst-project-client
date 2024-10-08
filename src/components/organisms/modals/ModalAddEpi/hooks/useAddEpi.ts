/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutUpdateGho } from 'core/services/hooks/mutations/checklist/gho/useMutUpdateGho';
import { cleanObjectNullValues } from 'core/utils/helpers/cleanObjectValues';
import { ghoSchema } from 'core/utils/schemas/gho.schema';

export const initialAddEpiState = {
  status: StatusEnum.ACTIVE,
  ca: '',
  description: '',
  id: 0,
};

export const useAddEpi = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAddEpiState);

  const { handleSubmit, control, reset, getValues, setValue } = useForm<any>({
    resolver: yupResolver(ghoSchema),
  });

  const createGhoMut = useMutCreateGho();
  const updateGhoMut = useMutUpdateGho();

  const { preventUnwantedChanges } = usePreventAction();

  const [epiData, setEpiData] = useState({
    ...initialAddEpiState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialAddEpiState>>(
      ModalEnum.EPI_ADD,
    );

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setEpiData((oldData) => {
        const newData = {
          ...oldData,
          ...cleanObjectNullValues(initialData),
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(ModalEnum.EPI_ADD);
    setEpiData(initialAddEpiState);
    reset();
  };

  const onSubmit: SubmitHandler<{ ca: string; description: string }> = async (
    data,
  ) => {
    const submitData = {
      status: epiData.status,
      ...data,
    };

    if (epiData.id == 0) {
      await createGhoMut.mutateAsync(submitData).catch(() => {});
    } else {
      // await updateGhoMut.mutateAsync({
      //   ...submitData,
      //   id: epiData.id,
      // });
    }

    onClose();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...epiData, ...values },
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
    epiData,
    setEpiData,
    control,
    handleSubmit,
    setValue,
  };
};
