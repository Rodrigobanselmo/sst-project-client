/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { rolesConstantMap } from 'core/constants/maps/roles.constant.map';
import { UserAccessScopeEnum } from 'core/enums/user-access-scope.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useBusinessGroupCompanyContext } from 'core/hooks/useBusinessGroupCompanyContext';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutInviteUser } from 'core/services/hooks/mutations/user/useMutInviteUser';
import { useMutUpdateUserCompany } from 'core/services/hooks/mutations/user/useMutUpdateUserCompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import {
  IQueryCompanies,
  useQueryCompanies,
} from 'core/services/hooks/queries/useQueryCompanies';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import {
  getUserGroupLinkedCompanies,
  inferUserAccessScope,
  resolveCompaniesIdsForSubmit,
  resolveGroupCompaniesForScope,
} from 'core/utils/helpers/user-access-scope.helper';
import { userManageSchema } from 'core/utils/schemas/user-manage.schema';

import { initialAccessGroupsSelectState } from '../../ModalSelectAccessGroup';
import { initialCompanySelectState } from '../../ModalSelectCompany';
import { useMutateAddUser } from '@v2/services/auth/user/add/hooks/useMutateAddUser';

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
  employeeId: undefined as number | undefined,
  accessScope: UserAccessScopeEnum.SINGLE,
  linkedCompanyIds: [] as string[],
  onSubmit: (data: { id: number }) => {},
};

export const useAddUser = () => {
  const { registerModal, findModalData, isOpen } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialUserState);
  const hydratedModalRef = useRef<string | null>(null);
  const inferredEditScopeRef = useRef(false);
  const userChangedScopeRef = useRef(false);
  const [missingGroup, setMissingGroup] = useState(false);
  const [missingScopeSelection, setMissingScopeSelection] = useState(false);

  const { handleSubmit, setError, control, setValue, reset, getValues } =
    useForm<any>({
      resolver: yupResolver(userManageSchema),
    });

  const inviteUserMut = useMutInviteUser();
  const addUserMut = useMutateAddUser();
  const updateUserMut = useMutUpdateUserCompany();

  const { preventUnwantedChanges } = usePreventAction();

  const { data: queryCompany } = useQueryCompany();

  const [userData, setUserData] = useState({
    ...initialUserState,
  });

  const isModalOpen = isOpen(ModalEnum.USER_ADD);

  const baseCompany =
    userData.company?.id ? userData.company : queryCompany?.id ? queryCompany : null;

  const {
    companyWithGroup,
    isBusinessGroup,
    businessGroupId,
    isLoadingGroupMembers,
    hasLoadedGroupMembers,
  } = useBusinessGroupCompanyContext(baseCompany);

  const activeCompany = companyWithGroup ?? baseCompany;

  const isConsulting = !!activeCompany?.isConsulting;

  const { companies: consultingCompanies = [] } = useQueryCompanies(
    1,
    {
      userId: isConsulting && userData.id ? userData.id : undefined,
      findAll: true,
      disabled: !isConsulting || !userData.id,
    },
    200,
  );

  const linkedCompanyIdsForEdit = useMemo(() => {
    if (userData.linkedCompanyIds?.length) return userData.linkedCompanyIds;
    if (userData.companies.length > 0) {
      return userData.companies.map((company) => company.id);
    }
    return activeCompany?.id ? [activeCompany.id] : [];
  }, [activeCompany?.id, userData.companies, userData.linkedCompanyIds]);

  useEffect(() => {
    if (!isModalOpen) {
      hydratedModalRef.current = null;
      inferredEditScopeRef.current = false;
      userChangedScopeRef.current = false;
      return;
    }

    const initialData = findModalData<Partial<typeof initialUserState>>(
      ModalEnum.USER_ADD,
    );

    if (
      !initialData ||
      !Object.keys(initialData)?.length ||
      (initialData as any).passBack
    ) {
      return;
    }

    const hydrationKey = JSON.stringify({
      id: initialData.id ?? 0,
      companyId: initialData.company?.id ?? '',
      email: initialData.email ?? '',
    });

    if (hydratedModalRef.current === hydrationKey) return;

    hydratedModalRef.current = hydrationKey;
    inferredEditScopeRef.current = false;
    userChangedScopeRef.current = false;

    setUserData((oldData) => {
      const newData = {
        ...initialUserState,
        ...oldData,
        ...initialData,
        sendEmail: initialData.id ? false : initialData.sendEmail ?? true,
        companies: initialData.companies?.length
          ? initialData.companies
          : initialData.company
            ? [initialData.company]
            : [],
      };

      initialDataRef.current = newData;
      return newData;
    });
  }, [findModalData, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || !isConsulting) return;
    if (!consultingCompanies.length || userData.companies.length > 0) return;

    setUserData((oldData) => {
      const newData = {
        ...oldData,
        companies: consultingCompanies,
      };

      initialDataRef.current = newData;
      return newData;
    });
  }, [consultingCompanies, isConsulting, isModalOpen, userData.companies.length]);

  useEffect(() => {
    if (!isModalOpen || !isBusinessGroup || !hasLoadedGroupMembers) return;
    if (!activeCompany?.group?.companies?.length) return;
    if (!userData.id) return;
    if (inferredEditScopeRef.current) return;
    if (userChangedScopeRef.current) return;

    inferredEditScopeRef.current = true;

    setUserData((oldData) => {
      const nextData = {
        ...oldData,
        accessScope: inferUserAccessScope(
          activeCompany,
          linkedCompanyIdsForEdit,
        ),
        companies: getUserGroupLinkedCompanies(
          activeCompany,
          linkedCompanyIdsForEdit,
        ),
      };

      initialDataRef.current = nextData;
      return nextData;
    });
  }, [
    activeCompany,
    hasLoadedGroupMembers,
    isBusinessGroup,
    isModalOpen,
    linkedCompanyIdsForEdit,
    userData.id,
  ]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.USER_ADD, data);
    setUserData(initialUserState);
    reset();
    setMissingGroup(false);
    setMissingScopeSelection(false);
    hydratedModalRef.current = null;
    inferredEditScopeRef.current = false;
    userChangedScopeRef.current = false;
  };

  const onSubmit: SubmitHandler<{
    email?: string;
    name: string;
  }> = async (data) => {
    if (!userData.id && !data?.email && userData.sendEmail) {
      return setError('email', { message: 'E-mail é obrigatório' });
    }

    if (!userData?.group?.id) {
      return setMissingGroup(true);
    }

    const companiesIds = resolveCompaniesIdsForSubmit({
      scope: userData.accessScope,
      company: activeCompany,
      selectedCompanies: userData.companies,
      isEdit: !!userData.id,
      isBusinessGroup,
    });

    if (
      isBusinessGroup &&
      userData.accessScope !== UserAccessScopeEnum.SINGLE &&
      !companiesIds?.length
    ) {
      return setMissingScopeSelection(true);
    }

    if (
      isBusinessGroup &&
      userData.accessScope === UserAccessScopeEnum.SELECTED &&
      userData.companies.length === 0
    ) {
      return setMissingScopeSelection(true);
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
      companyId: activeCompany?.id,
      ...(userData.group ? { groupId: userData.group.id } : {}),
      ...(isConsulting
        ? { companiesIds: userData.companies.map((company) => company.id) }
        : {}),
      ...(isBusinessGroup && companiesIds?.length ? { companiesIds } : {}),
      name: data.name ?? userData.name,
      ...(userData.id ? {} : { email: data.email }),
    };

    if (userData.id == 0) {
      const createdUser = await addUserMut.mutateAsync({
        companyId: activeCompany?.id as string,
        groupId: submitData.groupId as number,
        name: submitData.name,
        email: submitData.email as string,
        employeeId: userData.employeeId,
        ...(isBusinessGroup && companiesIds?.length ? { companiesIds } : {}),
      });

      if (createdUser) userData.onSubmit(createdUser);
      onClose();
    } else {
      await updateUserMut.mutateAsync({
        ...submitData,
        userId: userData.id,
      });
      onClose();
    }
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

      setMissingGroup(false);
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
      setMissingScopeSelection(false);
    };

    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      multiple: true,
      onSelect,
      selected: userData.companies,
      query,
    } as Partial<typeof initialCompanySelectState>);
  };

  const handleOpenGroupCompanySelect = () => {
    handleOpenCompanySelect({
      groupId: businessGroupId ?? activeCompany?.group?.id,
    });
  };

  const handleRemoveCompany = (company: ICompany) => {
    setUserData({
      ...userData,
      companies: userData.companies.filter((c) => c.id !== company.id),
    });
  };

  const handleAccessScopeChange = (accessScope: UserAccessScopeEnum) => {
    userChangedScopeRef.current = true;

    const nextCompanies = resolveGroupCompaniesForScope(
      accessScope,
      activeCompany,
      userData.companies,
    );

    setUserData({
      ...userData,
      accessScope,
      companies:
        accessScope === UserAccessScopeEnum.SELECTED
          ? userData.companies
          : nextCompanies,
    });
    setMissingScopeSelection(false);
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading:
      inviteUserMut.isLoading ||
      updateUserMut.isLoading ||
      addUserMut.isPending,
    userData,
    setUserData,
    control,
    handleSubmit,
    isEdit: !!userData.id,
    handleOpenAccessSelect,
    handleOpenCompanySelect,
    handleOpenGroupCompanySelect,
    handleRemoveCompany,
    handleAccessScopeChange,
    isConsulting,
    isBusinessGroup,
    setValue,
    missingGroup,
    missingScopeSelection,
    isLoadingGroupMembers,
    hasLoadedGroupMembers,
  };
};

export type IUseAddUser = ReturnType<typeof useAddUser>;

export { inferUserAccessScope, getUserGroupLinkedCompanies };
