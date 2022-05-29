/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutInviteUser } from 'core/services/hooks/mutations/company/useMutInviteUser';
import { useMutUpdateUserCompany } from 'core/services/hooks/mutations/company/useMutUpdateUserCompany';
import { ghoSchema } from 'core/utils/schemas/gho.schema';

export const initialUserState = {
  status: StatusEnum.ACTIVE,
  roles: [] as string[],
  permissions: [] as string[],
  email: '',
  id: '',
};

export const useAddUser = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialUserState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(ghoSchema),
  });

  const inviteUserMut = useMutInviteUser();
  const updateUserMut = useMutUpdateUserCompany();

  const { preventUnwantedChanges } = usePreventAction();

  const [userData, setUserData] = useState({
    ...initialUserState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialUserState>>(
      ModalEnum.USER_ADD,
    );

    if (initialData) {
      setUserData((oldData) => {
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
    onCloseModal(ModalEnum.USER_ADD, data);
    setUserData(initialUserState);
    reset();
  };

  const onSubmit: SubmitHandler<{ email: string }> = async (data) => {
    const submitData = {
      status: userData.status,
      ...data,
    };

    if (userData.id == '') {
      await inviteUserMut.mutateAsync(submitData);
    } else {
      await updateUserMut.mutateAsync({
        ...submitData,
        id: userData.id,
      });
    }

    onClose();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...userData, ...values },
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
    loading: inviteUserMut.isLoading || updateUserMut.isLoading,
    userData,
    setUserData,
    control,
    handleSubmit,
  };
};
