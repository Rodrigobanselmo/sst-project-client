/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutCreateContact } from 'core/services/hooks/mutations/manager/contact/useMutCreateContact/useMutCreateContact';
import { useMutDeleteContact } from 'core/services/hooks/mutations/manager/contact/useMutDeleteContact/useMutDeleteContact';
import {
  IUpdateContact,
  useMutUpdateContact,
} from 'core/services/hooks/mutations/manager/contact/useMutUpdateContact/useMutUpdateContact';

import { SModalInitContactProps } from '../types';
import { contactSchema } from './../../../../../core/utils/schemas/contact.schema';

export const initialContactState = {
  id: 0,
  name: '',
  phone: '',
  phone_1: '',
  email: '',
  companyId: '',
  obs: '',
};

const modalName = ModalEnum.CONTACT_ADD;

export const useAddContact = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialContactState);

  const { handleSubmit, control, reset, getValues, setValue } = useForm<any>({
    resolver: yupResolver(contactSchema),
  });

  const createMutation = useMutCreateContact();
  const updateMutation = useMutUpdateContact();
  const deleteMutation = useMutDeleteContact();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [contactData, setContactData] = useState({
    ...initialContactState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialContactState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setContactData((oldData) => {
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
    setContactData(initialContactState);
    reset();
  };

  const handleDelete = () => {
    if (contactData.id)
      deleteMutation
        .mutateAsync({ id: contactData.id, companyId: contactData.companyId })
        .then(() => {
          onClose();
        })
        .catch(() => {});
  };

  const onSubmit: SubmitHandler<Omit<SModalInitContactProps, 'id'>> = async (
    data,
  ) => {
    const submitData: IUpdateContact = {
      id: contactData.id,
      companyId: contactData.companyId,
      ...data,
    };

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation.mutateAsync(submitData);
      } else {
        await updateMutation.mutateAsync(submitData);
      }

      onClose();
    } catch (error) {}

    onClose();
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const before = { ...initialDataRef.current } as any;
    const after = { ...contactData, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: createMutation.isLoading || updateMutation.isLoading,
    contactData,
    setContactData,
    control,
    handleSubmit,
    isEdit: !!contactData.id,
    modalName,
    handleDelete: () => preventDelete(handleDelete),
    setValue,
  };
};
