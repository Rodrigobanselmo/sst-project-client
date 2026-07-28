import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  IPcmsoExaminingPhysician,
  mapExaminingPhysicianToProfessional,
} from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useMutCreatePcmsoExaminingPhysician } from 'core/services/hooks/mutations/manager/pcmsoExaminingPhysician/useMutCreatePcmsoExaminingPhysician/useMutCreatePcmsoExaminingPhysician';
import { useMutDeletePcmsoExaminingPhysician } from 'core/services/hooks/mutations/manager/pcmsoExaminingPhysician/useMutDeletePcmsoExaminingPhysician/useMutDeletePcmsoExaminingPhysician';
import { useMutUpdatePcmsoExaminingPhysician } from 'core/services/hooks/mutations/manager/pcmsoExaminingPhysician/useMutUpdatePcmsoExaminingPhysician/useMutUpdatePcmsoExaminingPhysician';
import { pcmsoExaminingPhysicianSchema } from 'core/utils/schemas/pcmsoExaminingPhysician.schema';

export const initialPcmsoExaminingPhysicianState = {
  id: '',
  companyId: '',
  workspaceId: null as string | null,
  professionalCouncilId: 0,
  professional: undefined as IProfessional | undefined,
  notes: '',
  sortOrder: 0,
  status: StatusEnum.ACTIVE,
};

const modalName = ModalEnum.PCMSO_EXAMINING_PHYSICIAN_ADD;

export const useAddPcmsoExaminingPhysician = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialPcmsoExaminingPhysicianState);

  const { handleSubmit, control, reset, setValue, getValues, setError } =
    useForm<any>({
      resolver: yupResolver(pcmsoExaminingPhysicianSchema),
      defaultValues: initialPcmsoExaminingPhysicianState,
    });

  const createMutation = useMutCreatePcmsoExaminingPhysician();
  const updateMutation = useMutUpdatePcmsoExaminingPhysician();
  const deleteMutation = useMutDeletePcmsoExaminingPhysician();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [physicianData, setPhysicianData] = useState({
    ...initialPcmsoExaminingPhysicianState,
  });

  useEffect(() => {
    const initialData =
      getModalData<
        Partial<typeof initialPcmsoExaminingPhysicianState> &
          Partial<IPcmsoExaminingPhysician>
      >(modalName);

    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      const professional =
        initialData.professional ||
        (initialData.professionalCouncil
          ? mapExaminingPhysicianToProfessional(initialData as IPcmsoExaminingPhysician)
          : undefined);

      setPhysicianData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
          workspaceId:
            initialData.workspaceId === undefined
              ? oldData.workspaceId
              : initialData.workspaceId,
          professional,
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
    setPhysicianData(initialPcmsoExaminingPhysicianState);
    reset(initialPcmsoExaminingPhysicianState);
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    const before = { ...initialDataRef.current } as any;
    const after = { ...physicianData, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    if (loading) return;

    if (!physicianData?.professional?.id) {
      setError('examiningPhysician', { message: 'O campo é obrigatório' });
      return;
    }

    const notes =
      typeof data.notes === 'string' ? data.notes.trim() || null : null;

    if (physicianData.id) {
      await updateMutation.mutateAsync({
        id: physicianData.id,
        companyId: physicianData.companyId,
        workspaceId: physicianData.workspaceId,
        professionalCouncilId: physicianData.professional.id,
        notes,
        sortOrder: Number(data.sortOrder ?? physicianData.sortOrder ?? 0),
        status: data.status || physicianData.status,
      });
    } else {
      await createMutation.mutateAsync({
        companyId: physicianData.companyId,
        workspaceId: physicianData.workspaceId,
        professionalCouncilId: physicianData.professional.id,
        notes,
        sortOrder: Number(data.sortOrder ?? 0),
      });
    }

    onClose();
  };

  const handleDelete = () => {
    preventDelete(async () => {
      await deleteMutation.mutateAsync({
        id: physicianData.id,
        workspaceId: physicianData.workspaceId,
      });
      onClose();
    });
  };

  const loading =
    createMutation.isLoading ||
    updateMutation.isLoading ||
    deleteMutation.isLoading;

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    physicianData,
    setPhysicianData,
    control,
    handleSubmit,
    isEdit: !!physicianData.id,
    modalName,
    handleDelete: () => preventDelete(handleDelete),
    setValue,
    professionalType: ProfessionalTypeEnum.DOCTOR,
  };
};

export type IUseAddPcmsoExaminingPhysician = ReturnType<
  typeof useAddPcmsoExaminingPhysician
>;
