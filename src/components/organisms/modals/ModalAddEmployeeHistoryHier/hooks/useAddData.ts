/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import {
  ICreateEmployeeHierarchyHistory,
  useMutCreateEmployeeHisHier,
} from 'core/services/hooks/mutations/manager/employee-history/useMutCreateEmployeeHisHier/useMutCreateEmployeeHisHier';
import { useMutDeleteEmployeeHisHier } from 'core/services/hooks/mutations/manager/employee-history/useMutDeleteEmployeeHisHier/useMutDeleteEmployeeHisHier';
import { useMutUpdateEmployeeHisHier } from 'core/services/hooks/mutations/manager/employee-history/useMutUpdateEmployeeHisHier/useMutUpdateEmployeeHisHier';

import { SModalInitContactProps } from '../types';
import { cleanObjectNullValues } from './../../../../../core/utils/helpers/cleanObjectValues';
import { employeeHistoryHierarchySchema } from './../../../../../core/utils/schemas/employee.schema';

export const initialEmployeeHistoryHierState = {
  id: 0 as number | undefined,
  motive: undefined as undefined | EmployeeHierarchyMotiveTypeEnum,
  startDate: undefined as undefined | Date,
  hierarchyId: undefined as undefined | string,
  employeeId: undefined as undefined | number,
  subOfficeId: undefined as undefined | string,
  employee: undefined as undefined | IEmployee,
  created_at: undefined as undefined | Date,
  updated_at: undefined as undefined | Date,
  companyId: undefined as undefined | string,
  hierarchy: undefined as undefined | IHierarchy,
  sector: undefined as undefined | IHierarchy,
  subOffice: undefined as undefined | IHierarchy,
  errors: {
    sector: false,
    hierarchy: false,
    subOffice: false,
  },
};

const modalName = ModalEnum.EMPLOYEE_HISTORY_HIER_ADD;

export const useAddData = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEmployeeHistoryHierState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(employeeHistoryHierarchySchema),
  });

  const createMutation = useMutCreateEmployeeHisHier();
  const updateMutation = useMutUpdateEmployeeHisHier();
  const deleteMutation = useMutDeleteEmployeeHisHier();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [data, setData] = useState({
    ...initialEmployeeHistoryHierState,
  });

  const { getCompanyId } = useGetCompanyId();

  const companyId = getCompanyId(data);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEmployeeHistoryHierState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...cleanObjectNullValues(initialData),
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialEmployeeHistoryHierState);
    reset();
  };

  const handleDelete = () => {
    if (data.id)
      deleteMutation
        .mutateAsync({
          id: data.id,
          employeeId: data.employeeId,
          companyId: data.companyId,
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
  };

  const onSubmit: SubmitHandler<Omit<SModalInitContactProps, 'id'>> = async (
    dataForm,
  ) => {
    if (data.motive !== EmployeeHierarchyMotiveTypeEnum.DEM) {
      if (!data.sector?.id) {
        setData({
          ...data,
          errors: { ...data.errors, sector: true, hierarchy: true },
        });
        return;
      }
      if (!data.hierarchy?.id) {
        setData({
          ...data,
          errors: { ...data.errors, hierarchy: true },
        });
        return;
      }
    }

    if (!data.employeeId) return;
    if (!data.startDate) return;

    const submitData: ICreateEmployeeHierarchyHistory & { id?: number } = {
      id: data.id,
      companyId,
      hierarchyId: data.hierarchy?.id || data?.employee?.hierarchyId || '',
      subOfficeId: data.subOffice?.id || data?.employee?.subOffices?.[0]?.id,
      employeeId: data.employeeId,
      startDate: data.startDate,
      ...dataForm,
    };

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation.mutateAsync(submitData);
        onClose();
      } else {
        await updateMutation.mutateAsync(submitData);
        onClose();
      }
    } catch (error) {
      console.error('error');
    }
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const before = { ...initialDataRef.current } as any;
    const after = { ...data, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: createMutation.isLoading || updateMutation.isLoading,
    control,
    handleSubmit,
    isEdit: !!data.id,
    modalName,
    handleDelete: () => preventDelete(handleDelete),
    data,
    setData,
    companyId,
  };
};
