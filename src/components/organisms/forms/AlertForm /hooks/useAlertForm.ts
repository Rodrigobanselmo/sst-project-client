import { useEffect, useState } from 'react';

import { initialAccessGroupsSelectState } from 'components/organisms/modals/ModalSelectAccessGroup';
import { initialUsersSelectState } from 'components/organisms/modals/ModalSelectUsers';
import {
  initialInputModalState,
  TypeInputModal,
} from 'components/organisms/modals/ModalSingleInput';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

import {
  AlertsFieldEnum,
  AlertsGroupTypeEnum,
  AlertsTypeEnum,
} from 'core/constants/maps/alert.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { IAlert } from 'core/interfaces/api/IAlert';
import { IUser } from 'core/interfaces/api/IUser';
import { useMutSendAlert } from 'core/services/hooks/mutations/manager/alert/useMutSendAlert/useMutSendAlert';
import {
  IUpsIUpserALert,
  useMutUpsertAlert,
} from 'core/services/hooks/mutations/manager/alert/useMutUpsertAlert/useMutUpsertAlert';
import { useQueryAlert } from 'core/services/hooks/queries/useQueryAlert/useQueryAlert';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export const useAlertForm = () => {
  const { onStackOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();

  const { data: alerts, isLoading } = useQueryAlert();
  const { data: company } = useQueryCompany();

  const [alertType, setAlertType] = useState(AlertsGroupTypeEnum.COMPANY);

  useEffect(() => {
    if (company.isClinic) {
      setAlertType(AlertsGroupTypeEnum.CLINIC);
    }
  }, [company]);

  const updateMutation = useMutUpsertAlert();
  const sendMutation = useMutSendAlert();

  const onSave = async ({
    id,
    field,
    companyId,
    type,
    remove,
  }: {
    companyId: string;
    type: AlertsTypeEnum;
    id: string;
    field: AlertsFieldEnum;
    remove?: boolean;
  }) => {
    const dt: IUpsIUpserALert = {
      companyId,
      type,
    };

    if (!remove && field == AlertsFieldEnum.GROUP) dt.groupsIds = [Number(id)];
    if (!remove && field == AlertsFieldEnum.USER) dt.usersIds = [Number(id)];
    if (!remove && field == AlertsFieldEnum.EMAIL) dt.emails = [id];

    if (remove && field == AlertsFieldEnum.GROUP)
      dt.removeGroupsIds = [Number(id)];
    if (remove && field == AlertsFieldEnum.USER)
      dt.removeUsersIds = [Number(id)];
    if (remove && field == AlertsFieldEnum.EMAIL) dt.removeEmails = [id];

    await updateMutation
      .mutateAsync(dt)
      .then(() => {})
      .catch(() => {});
  };

  const onConfigSave = async ({
    companyId,
    type,
    configJson,
  }: {
    companyId: string;
    type: AlertsTypeEnum;
    configJson?: IAlert['configJson'];
  }) => {
    const dt: IUpsIUpserALert = {
      companyId,
      type,
      ...(configJson && { configJson }),
    };

    await updateMutation
      .mutateAsync(dt)
      .then(() => {})
      .catch(() => {});
  };

  const onAddSave = async (options: {
    field: AlertsFieldEnum;
    companyId: string;
    type: AlertsTypeEnum;
  }) => {
    if (options.field == AlertsFieldEnum.GROUP)
      onStackOpenModal(ModalEnum.ACCESS_GROUP_SELECT, {
        onSelect: (group: IAccessGroup) => {
          onSave({ ...options, id: String(group.id) });
        },
      } as Partial<typeof initialAccessGroupsSelectState>);

    if (options.field == AlertsFieldEnum.USER)
      onStackOpenModal(ModalEnum.USER_SELECT, {
        onSelect: (user: IUser) => {
          onSave({ ...options, id: String(user.id) });
        },
      } as Partial<typeof initialUsersSelectState>);

    if (options.field == AlertsFieldEnum.EMAIL)
      onStackOpenModal(ModalEnum.SINGLE_INPUT, {
        onConfirm: (newValue: string) => {
          onSave({ ...options, id: newValue });
        },
        placeholder: 'email@simplesst.com',
        label: 'Email',
        type: TypeInputModal.EMAIL,
        name: '',
      } as typeof initialInputModalState);
  };

  return {
    loading: updateMutation.isLoading || isLoading,
    onSave,
    alerts,
    alertType,
    setAlertType,
    company,
    enqueueSnackbar,
    onAddSave,
    onConfigSave,
    sendMutation,
  };
};

export type IUseOsReturn = ReturnType<typeof useAlertForm>;
