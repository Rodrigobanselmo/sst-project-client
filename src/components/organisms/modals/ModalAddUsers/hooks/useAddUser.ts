/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutInviteUser } from 'core/services/hooks/mutations/user/useMutInviteUser';
import { useMutUpdateUserCompany } from 'core/services/hooks/mutations/user/useMutUpdateUserCompany';
import { userManageSchema } from 'core/utils/schemas/user-manage.schema';

export const initialUserState = {
  status: StatusEnum.ACTIVE,
  roles: [] as RoleEnum[],
  permissions: [] as PermissionEnum[],
  errors: {
    roles: '',
  },
  email: '',
  name: '',
  id: 0,
};

export const useAddUser = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialUserState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(userManageSchema),
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
    if (userData.roles.length === 0)
      return setUserData((oldData) => ({
        ...oldData,
        errors: { roles: 'selecione ao menos uma role' },
      }));

    const submitData = {
      status: userData.status,
      roles: userData.roles,
      ...data,
    };

    if (userData.id == 0) {
      await inviteUserMut.mutateAsync(submitData).catch(() => {});
    } else {
      await updateUserMut
        .mutateAsync({
          ...submitData,
          userId: userData.id,
        })
        .catch(() => {});
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
    isEdit: !!userData.id,
  };
};
