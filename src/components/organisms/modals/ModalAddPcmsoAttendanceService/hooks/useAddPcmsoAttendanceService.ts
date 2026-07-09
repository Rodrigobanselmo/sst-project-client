import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  PcmsoAttendanceServiceTypeEnum,
} from 'core/interfaces/api/IPcmsoAttendanceService';
import { useMutCreatePcmsoAttendanceService } from 'core/services/hooks/mutations/manager/pcmsoAttendanceService/useMutCreatePcmsoAttendanceService/useMutCreatePcmsoAttendanceService';
import { useMutDeletePcmsoAttendanceService } from 'core/services/hooks/mutations/manager/pcmsoAttendanceService/useMutDeletePcmsoAttendanceService/useMutDeletePcmsoAttendanceService';
import { useMutUpdatePcmsoAttendanceService } from 'core/services/hooks/mutations/manager/pcmsoAttendanceService/useMutUpdatePcmsoAttendanceService/useMutUpdatePcmsoAttendanceService';
import { pcmsoAttendanceServiceSchema } from 'core/utils/schemas/pcmsoAttendanceService.schema';

export const initialPcmsoAttendanceServiceState = {
  id: '',
  name: '',
  companyId: '',
  workspaceId: '',
  serviceType: 'HOSPITAL' as PcmsoAttendanceServiceTypeEnum,
  address: '',
  phone: '',
  distanceLabel: '',
  travelTimeLabel: '',
  notes: '',
  sortOrder: 0,
  status: StatusEnum.ACTIVE,
};

const modalName = ModalEnum.PCMSO_ATTENDANCE_SERVICE_ADD;

export const useAddPcmsoAttendanceService = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialPcmsoAttendanceServiceState);

  const { handleSubmit, control, reset, setValue, getValues } = useForm<any>({
    resolver: yupResolver(pcmsoAttendanceServiceSchema),
    defaultValues: initialPcmsoAttendanceServiceState,
  });

  const createMutation = useMutCreatePcmsoAttendanceService();
  const updateMutation = useMutUpdatePcmsoAttendanceService();
  const deleteMutation = useMutDeletePcmsoAttendanceService();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [serviceData, setServiceData] = useState({
    ...initialPcmsoAttendanceServiceState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialPcmsoAttendanceServiceState>>(modalName);

    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setServiceData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;
        reset(newData);
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(modalName);
    setServiceData(initialPcmsoAttendanceServiceState);
    reset(initialPcmsoAttendanceServiceState);
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    const before = { ...initialDataRef.current } as any;
    const after = { ...serviceData, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    if (loading) return;

    if (serviceData.id) {
      await updateMutation.mutateAsync({
        ...data,
        id: serviceData.id,
        workspaceId: serviceData.workspaceId,
        sortOrder: Number(data.sortOrder ?? serviceData.sortOrder ?? 0),
        status: data.status || serviceData.status,
      });
    } else {
      await createMutation.mutateAsync({
        ...data,
        workspaceId: serviceData.workspaceId,
        companyId: serviceData.companyId,
        sortOrder: Number(data.sortOrder ?? 0),
      });
    }

    onClose();
  };

  const handleDelete = () => {
    preventDelete(async () => {
      await deleteMutation.mutateAsync({
        id: serviceData.id,
        workspaceId: serviceData.workspaceId,
      });
      onClose();
    });
  };

  const loading =
    createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading;

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    serviceData,
    setServiceData,
    control,
    handleSubmit,
    isEdit: !!serviceData.id,
    modalName,
    handleDelete: () => preventDelete(handleDelete),
    setValue,
  };
};

export type IUseAddPcmsoAttendanceService = ReturnType<typeof useAddPcmsoAttendanceService>;
