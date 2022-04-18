/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { StatusEnum } from 'project/enum/status.enum';
import * as Yup from 'yup';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutCreateGenerateSource } from 'core/services/hooks/mutations/checklist/useMutCreateGenerateSource';
import { useMutUpdateGenerateSource } from 'core/services/hooks/mutations/checklist/useMutUpdateGenerateSource';
import { generateSourceSchema } from 'core/utils/schemas/generateSource.schema';

export const initialAddGenerateSourceState = {
  status: StatusEnum.ACTIVE,
  name: '',
  id: 0,
  localId: '' as string | number,
  risk: {} as IRiskFactors,
  riskIds: [] as (string | number)[],
  hasSubmit: false,
  passDataBack: false,
  edit: false,
};

export const useAddGenerateSource = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAddGenerateSourceState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(Yup.object().shape(generateSourceSchema)),
  });

  const createGenerateSourceMut = useMutCreateGenerateSource();
  const updateGenerateSourceMut = useMutUpdateGenerateSource();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [generateSourceData, setGenerateSourceData] = useState({
    ...initialAddGenerateSourceState,
  });

  useEffect(() => {
    const initialData = getModalData<
      Partial<typeof initialAddGenerateSourceState>
    >(ModalEnum.GENERATE_SOURCE_ADD);

    if (initialData) {
      setGenerateSourceData((oldData) => {
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
    onCloseModal(ModalEnum.GENERATE_SOURCE_ADD, data);
    setGenerateSourceData(initialAddGenerateSourceState);
    reset();
  };

  const onRemove = () => {
    if (generateSourceData.passDataBack)
      onCloseModal(ModalEnum.GENERATE_SOURCE_ADD, {
        remove: true,
        isAddGenerateSource: true,
        localId: generateSourceData.localId,
      });

    setGenerateSourceData(initialAddGenerateSourceState);
    reset();
  };

  const onSubmit: SubmitHandler<{
    name: string;
    recName: string;
    medName: string;
  }> = async ({ recName, medName, ...formData }) => {
    const data = {
      ...formData,
      recMeds: [{ recName, medName }],
    };

    if (generateSourceData.passDataBack)
      return onClose({
        status: generateSourceData.status,
        isAddGenerateSource: true,
        edit: generateSourceData.edit,
        localId: generateSourceData?.localId,
        ...data,
      });

    if (!generateSourceData.risk.id) return;

    const submitData = {
      status: generateSourceData.status,
      riskId: generateSourceData.risk.id,
      ...data,
    };

    if (generateSourceData.id == 0) {
      await createGenerateSourceMut.mutateAsync(submitData);
    } else {
      await updateGenerateSourceMut.mutateAsync({
        ...submitData,
        id: generateSourceData.id,
      });
    }

    onClose();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...generateSourceData, ...values },
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
      createGenerateSourceMut.isLoading || updateGenerateSourceMut.isLoading,
    generateSourceData,
    setGenerateSourceData,
    control,
    handleSubmit,
    onRemove: () => preventDelete(onRemove),
  };
};
