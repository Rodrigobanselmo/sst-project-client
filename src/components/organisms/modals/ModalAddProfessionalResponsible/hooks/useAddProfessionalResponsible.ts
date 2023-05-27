/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { ProfessionalRespTypeEnum } from 'project/enum/professional-responsible-type.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useMutCreateProfessionalResponsible } from 'core/services/hooks/mutations/manager/professionalResponsible/useMutCreateProfessionalResponsible/useMutCreateProfessionalResponsible';
import { useMutDeleteProfessionalResponsible } from 'core/services/hooks/mutations/manager/professionalResponsible/useMutDeleteProfessionalResponsible/useMutDeleteProfessionalResponsible';
import {
  IUpdateProfessionalResponsible,
  useMutUpdateProfessionalResponsible,
} from 'core/services/hooks/mutations/manager/professionalResponsible/useMutUpdateProfessionalResponsible/useMutUpdateProfessionalResponsible';
import { professionalResponsibleSchema } from 'core/utils/schemas/professional-responsible.schema';

import { SModalInitProfessionalResponsibleProps } from '../types';

export const initialProfessionalResponsibleState = {
  id: 0,
  startDate: undefined as Date | undefined,
  companyId: '',
  professional: undefined as IProfessional | undefined,
  type: undefined as ProfessionalRespTypeEnum | undefined,
};

const modalName = ModalEnum.PROF_RESPONSIBLE;

export const useAddProfessionalResponsible = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialProfessionalResponsibleState);

  const { handleSubmit, control, reset, getValues, setError, setValue } =
    useForm({
      resolver: yupResolver(professionalResponsibleSchema),
    });

  const createMutation = useMutCreateProfessionalResponsible();
  const updateMutation = useMutUpdateProfessionalResponsible();
  const deleteMutation = useMutDeleteProfessionalResponsible();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [professionalResponsibleData, setProfessionalResponsibleData] =
    useState({
      ...initialProfessionalResponsibleState,
    });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialProfessionalResponsibleState>>(
        modalName,
      );

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setProfessionalResponsibleData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setProfessionalResponsibleData(initialProfessionalResponsibleState);
    reset();
  };

  const handleDelete = () => {
    if (professionalResponsibleData.id)
      deleteMutation
        .mutateAsync({
          id: professionalResponsibleData.id,
          companyId: professionalResponsibleData.companyId,
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
  };

  const onSubmit: SubmitHandler<
    Omit<SModalInitProfessionalResponsibleProps, 'id'>
  > = async (data) => {
    if (!professionalResponsibleData?.professional?.id) {
      setError('profResponsible', { message: 'O campo é obrigatório' });
      return;
    }
    if (!professionalResponsibleData?.startDate) {
      setError('startDate', { message: 'O campo é obrigatório' });
      return;
    }

    const submitData: IUpdateProfessionalResponsible = {
      ...data,
      id: professionalResponsibleData.id,
      professionalCouncilId: professionalResponsibleData.professional.id,
      companyId: professionalResponsibleData.companyId,
    };

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation.mutateAsync(submitData).then(() => onClose());
      } else {
        await updateMutation.mutateAsync(submitData).then(() => onClose());
      }
    } catch (error) {}
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const before = { ...initialDataRef.current } as any;
    const after = { ...professionalResponsibleData, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: createMutation.isLoading || updateMutation.isLoading,
    professionalResponsibleData,
    setProfessionalResponsibleData,
    control,
    handleSubmit,
    isEdit: !!professionalResponsibleData.id,
    modalName,
    handleDelete: () => preventDelete(handleDelete),
    setValue,
  };
};
