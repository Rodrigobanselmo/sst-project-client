/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IExam } from 'core/interfaces/api/IExam';
import { useMutCreateEmployeeHisHier } from 'core/services/hooks/mutations/manager/employee-history/useMutCreateEmployeeHisHier/useMutCreateEmployeeHisHier';
import { useMutDeleteEmployeeHisHier } from 'core/services/hooks/mutations/manager/employee-history/useMutDeleteEmployeeHisHier/useMutDeleteEmployeeHisHier';
import { useMutUpdateEmployeeHisHier } from 'core/services/hooks/mutations/manager/employee-history/useMutUpdateEmployeeHisHier/useMutUpdateEmployeeHisHier';

import { employeeHistoryExamSchema } from '../../../../../core/utils/schemas/employee.schema';
import { SModalInitContactProps } from '../types';

export const initialEmployeeHistoryExamState = {
  id: 0 as number | undefined,
  // motive: undefined as undefined | EmployeeHierarchyMotiveTypeEnum,
  startDate: undefined as undefined | Date,
  exmId: undefined as undefined | string,
  employeeId: undefined as undefined | number,
  employee: undefined as undefined | IEmployee,
  created_at: undefined as undefined | Date,
  updated_at: undefined as undefined | Date,
  exm: undefined as undefined | IExam,
  companyId: undefined as undefined | string,
  errors: {
    exam: false,
  },
};

const modalName = ModalEnum.EMPLOYEE_HISTORY_EXAM_ADD;

export const useAddData = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEmployeeHistoryExamState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(employeeHistoryExamSchema),
  });

  const createMutation = useMutCreateEmployeeHisHier();
  const updateMutation = useMutUpdateEmployeeHisHier();
  const deleteMutation = useMutDeleteEmployeeHisHier();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [data, setData] = useState({
    ...initialEmployeeHistoryExamState,
  });

  const { getCompanyId } = useGetCompanyId();

  const companyId = getCompanyId(data);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEmployeeHistoryExamState>>(modalName);

    if (initialData) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialEmployeeHistoryExamState);
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
    if (!data.employeeId) return;
    if (!data.startDate) return;

    // const submitData: ICreateEmployeeHierarchyHistory & { id?: number } = {
    //   id: data.id,
    //   companyId,
    //   employeeId: data.employeeId,
    //   startDate: data.startDate,
    //   ...dataForm,
    // };

    // try {
    //   if (!submitData.id) {
    //     delete submitData.id;
    //     await createMutation.mutateAsync(submitData);
    //     onClose();
    //   } else {
    //     await updateMutation.mutateAsync(submitData);
    //     onClose();
    //   }
    // } catch (error) {
    //   console.log('error');
    // }
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
