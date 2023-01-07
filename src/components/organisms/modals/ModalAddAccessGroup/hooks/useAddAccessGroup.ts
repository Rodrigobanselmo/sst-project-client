/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useSnackbar } from 'notistack';
import { RoleEnum } from 'project/enum/roles.enums';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  IUpsertAccessGroup,
  useMutUpsertAccessGroup,
} from 'core/services/hooks/mutations/user/useMutUpsertAuthGroups';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import {
  convertFromPermissionsMap,
  IPermissionMap,
} from '../../ModalAddUsers/hooks/useAddUser';
import { accessGroupSchema } from './../../../../../core/utils/schemas/access-group.schema';

export const initialAccessGroupState = {
  roles: [] as RoleEnum[],
  permissions: {} as IPermissionMap,
  errors: {
    roles: '',
  },
  description: '',
  name: '',
  companyId: '',
  id: 0,
};

export const useAddAccessGroup = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAccessGroupState);
  const submitType = useRef('');
  const { enqueueSnackbar } = useSnackbar();

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(accessGroupSchema),
  });

  const upsertAccessGroup = useMutUpsertAccessGroup();

  const { preventUnwantedChanges } = usePreventAction();

  const [accessGroupData, setAccessGroupData] = useState({
    ...initialAccessGroupState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialAccessGroupState>>(
      ModalEnum.ACCESS_GROUP_ADD,
    );

    if (initialData && !(initialData as any).passBack) {
      setAccessGroupData((oldData) => {
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
    onCloseModal(ModalEnum.ACCESS_GROUP_ADD, data);
    setAccessGroupData(initialAccessGroupState);
    reset();
  };

  const onSubmit: SubmitHandler<{ description: string; name: string }> = async (
    data,
  ) => {
    const isCopy = submitType.current == 'copy';
    if (isCopy && data.name === initialDataRef?.current?.name) {
      return enqueueSnackbar('A cópia não pode ter o mesmo nome do original', {
        variant: 'warning',
      });
    }

    if (accessGroupData.roles.length === 0)
      return setAccessGroupData((oldData) => ({
        ...oldData,
        errors: { roles: 'selecione ao menos uma permissão' },
      }));

    const { permissions } = convertFromPermissionsMap(
      accessGroupData.permissions,
    );

    const roles = accessGroupData.roles.filter((role) =>
      Object.values(RoleEnum).includes(role),
    );

    const submitData: IUpsertAccessGroup = {
      roles: removeDuplicate(roles, { simpleCompare: true }),
      permissions: removeDuplicate(permissions, { simpleCompare: true }),
      companyId: accessGroupData.companyId,
      ...data,
    };

    if (accessGroupData.id != 0 && !isCopy) submitData.id = accessGroupData.id;
    await upsertAccessGroup.mutateAsync(submitData).catch(() => {});

    onClose();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...accessGroupData, ...values },
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
    loading: upsertAccessGroup.isLoading,
    accessGroupData,
    setAccessGroupData,
    control,
    handleSubmit,
    submitType,
    isEdit: !!accessGroupData.id,
  };
};
