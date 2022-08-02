/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { useSnackbar } from 'notistack';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { IListHierarchyQuery } from 'core/hooks/useListHierarchyQuery';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  ICreateProfessional,
  useMutCreateProfessional,
} from 'core/services/hooks/mutations/user/professionals/useMutCreateProfessional';
import { useMutUpdateProfessional } from 'core/services/hooks/mutations/user/professionals/useMutUpdateProfessional';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { professionalSchema } from 'core/utils/schemas/professional.schema';

import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { initialWorkspaceSelectState } from '../../ModalSelectWorkspace';

export const initialProfessionalState = {
  id: 0,
  name: '',
  cpf: '',
  phone: '',
  email: '',
  councilType: '',
  councilUF: '',
  councilId: '',
  crm: '',
  crea: '',
  certifications: [] as string[],
  formation: [] as string[],
  type: '' as ProfessionalTypeEnum,
  status: StatusEnum.ACTIVE,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (professional: IProfessional | null) => {},
};

interface ISubmit {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  councilType: string;
  councilUF: string;
  councilId: string;
  crm: string;
  crea: string;
  type: string;
}

export const useEditProfessionals = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialProfessionalState);
  const { data: company } = useQueryCompany();

  const { handleSubmit, setValue, control, reset, getValues } = useForm({
    resolver: yupResolver(professionalSchema),
  });

  const createMutation = useMutCreateProfessional();
  const updateMutation = useMutUpdateProfessional();

  const { preventUnwantedChanges } = usePreventAction();

  const [professionalData, setProfessionalData] = useState({
    ...initialProfessionalState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialProfessionalState>>(
      ModalEnum.PROFESSIONALS_ADD,
    );

    if (initialData) {
      setProfessionalData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [company, getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.PROFESSIONALS_ADD, data);
    setProfessionalData(initialProfessionalState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        cleanObjectValues({ ...professionalData, ...values }),
        cleanObjectValues(initialDataRef.current),
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: ICreateProfessional & { id?: number } = {
      ...data,
      id: professionalData.id,
      certifications: professionalData.certifications,
      formation: professionalData.formation,
      status: professionalData.status,
      type: professionalData.type,
    };

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation
          .mutateAsync(submitData)
          .then((professional) => professionalData.callback(professional));
      } else {
        await updateMutation
          .mutateAsync(submitData)
          .then((professional) => professionalData.callback(professional));
      }

      onClose();
    } catch (error) {}
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    professionalData,
    onSubmit,
    loading: updateMutation.isLoading || createMutation.isLoading,
    control,
    handleSubmit,
    setProfessionalData,
    setValue,
  };
};

export type IUseEditProfessional = ReturnType<typeof useEditProfessionals>;
