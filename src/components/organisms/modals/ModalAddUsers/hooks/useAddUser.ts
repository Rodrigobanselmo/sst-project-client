/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { rolesConstantMap } from 'core/constants/maps/roles.constant.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutInviteUser } from 'core/services/hooks/mutations/user/useMutInviteUser';
import { useMutUpdateUserCompany } from 'core/services/hooks/mutations/user/useMutUpdateUserCompany';
import {
  IQueryCompanies,
  useQueryCompanies,
} from 'core/services/hooks/queries/useQueryCompanies';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { userManageSchema } from 'core/utils/schemas/user-manage.schema';

import { initialAccessGroupsSelectState } from '../../ModalSelectAccessGroup';
import { initialCompanySelectState } from '../../ModalSelectCompany';

export type IPermissionMap = Partial<Record<RoleEnum, string[]>>;

export const convertToPermissionsMap = (
  roles: RoleEnum[],
  permissions: string[],
) => {
  const permissionsMap: IPermissionMap = {};

  roles.forEach((role) => {
    permissionsMap[role] = permissions.filter(
      (permission) =>
        rolesConstantMap[role] &&
        rolesConstantMap[role].permissions?.includes(
          permission.split('-')[0] as PermissionEnum,
        ),
    );
  });
  return permissionsMap;
};

export const convertFromPermissionsMap = (permissions: IPermissionMap) => {
  const roles: RoleEnum[] = [];
  const permissionsList: string[] = [];

  Object.entries(permissions).forEach(([role, values]) => {
    if (Object.values(RoleEnum).includes(role as any)) {
      roles.push(role as RoleEnum);
      permissionsList.push(...values);
    }
  });

  return { roles, permissions: permissionsList };
};

export const initialUserState = {
  status: StatusEnum.ACTIVE,
  roles: [] as RoleEnum[],
  permissions: {} as IPermissionMap,
  errors: {
    roles: '',
  },
  email: '',
  sendEmail: true,
  company: null as ICompany | null,
  companies: [] as ICompany[],
  name: '',
  group: null as IAccessGroup | null,
  id: 0,
};

export const useAddUser = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialUserState);

  const { handleSubmit, setError, control, setValue, reset, getValues } =
    useForm({
      resolver: yupResolver(userManageSchema),
    });

  const inviteUserMut = useMutInviteUser();
  const updateUserMut = useMutUpdateUserCompany();

  const { preventUnwantedChanges } = usePreventAction();

  const [userData, setUserData] = useState({
    ...initialUserState,
  });

  const isConsulting = !!userData?.company?.isConsulting;

  const { companies } = useQueryCompanies(
    1,
    { userId: isConsulting ? userData.id : 0, findAll: true },
    200,
  );

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialUserState>>(
      ModalEnum.USER_ADD,
    );

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
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

  useEffect(() => {
    if (companies && companies.length > 0 && userData.companies.length == 0)
      setUserData((oldData) => {
        const newData = {
          ...oldData,
          companies,
        };

        initialDataRef.current = newData;

        return newData;
      });
  }, [companies, getModalData, userData.companies.length]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.USER_ADD, data);
    setUserData(initialUserState);
    reset();
  };

  const onSubmit: SubmitHandler<{ email: string }> = async (data) => {
    if (!data?.email && userData.sendEmail) {
      return setError('email', { message: 'E-mail é obrigatório' });
    }

    if (userData.roles.length === 0)
      return setUserData((oldData) => ({
        ...oldData,
        errors: { roles: 'selecione ao menos uma role' },
      }));

    const { permissions } = convertFromPermissionsMap(userData.permissions);

    const roles = userData.roles.filter((role) =>
      Object.values(RoleEnum).includes(role),
    );

    const submitData = {
      status: userData.status,
      roles: removeDuplicate(roles, { simpleCompare: true }),
      permissions: removeDuplicate(permissions, { simpleCompare: true }),
      companyId: userData.company?.id,
      ...(userData.group ? { groupId: userData.group.id } : {}),
      ...(isConsulting
        ? { companiesIds: userData.companies.map((company) => company.id) }
        : {}),
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

  const handleOpenAccessSelect = () => {
    const onSelectAccessGroup = (group: IAccessGroup) => {
      setUserData({
        ...userData,
        roles: group.roles,
        permissions: convertToPermissionsMap(group.roles, group.permissions),
        group,
      });
    };

    onStackOpenModal(ModalEnum.ACCESS_GROUP_SELECT, {
      onSelect: onSelectAccessGroup,
    } as Partial<typeof initialAccessGroupsSelectState>);
  };

  const handleOpenCompanySelect = (query?: IQueryCompanies) => {
    const onSelect = (companies: ICompany[]) => {
      setUserData({
        ...userData,
        companies,
      });
    };

    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      multiple: true,
      onSelect,
      selected: userData.companies,
      query,
    } as Partial<typeof initialCompanySelectState>);
  };

  const handleRemoveCompany = (company: ICompany) => {
    setUserData({
      ...userData,
      companies: userData.companies.filter((c) => c.id !== company.id),
    });
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
    handleOpenAccessSelect,
    handleOpenCompanySelect,
    handleRemoveCompany,
    isConsulting,
    setValue,
  };
};
