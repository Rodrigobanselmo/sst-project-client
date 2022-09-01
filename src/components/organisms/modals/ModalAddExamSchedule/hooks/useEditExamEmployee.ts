/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutCreateEmployee } from 'core/services/hooks/mutations/manager/useMutCreateEmployee';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';

import { IEmployee } from '../../../../../core/interfaces/api/IEmployee';

export const initialExamScheduleState = {
  employeeId: undefined as number | undefined,
  companyId: undefined as string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (employee: IEmployee | null) => {},
};

const modalName = ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE;

export const useEditExamEmployee = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialExamScheduleState);

  const updateEmployee = useMutUpdateEmployee();
  const createEmployee = useMutCreateEmployee();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialExamScheduleState,
  });

  const isEdit = false;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialExamScheduleState>>(modalName);

    if (initialData) {
      setData((oldData) => {
        const replaceData = {} as any;

        Object.keys(oldData).map((key) => {
          if (key in initialData) {
            replaceData[key] =
              (initialData as any)[key] ||
              (initialExamScheduleState as any)[key];
          }
        });

        const newData = {
          ...oldData,
          ...replaceData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialExamScheduleState);
  };

  const onCloseUnsaved = (action?: () => void) => {
    if (preventUnwantedChanges(data, initialDataRef.current, onClose)) return;
    onClose();
    action?.();
  };

  const onSubmitData = async (
    submitData: any,
    nextStep: () => void,
    { save }: { save?: boolean } = { save: true },
  ) => {};

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    modalName,

    onSubmitData,
    isEdit,
    loading: updateEmployee.isLoading || createEmployee.isLoading,
    createEmployee,
    updateEmployee,
  };
};

export type IUseEditEmployee = ReturnType<typeof useEditExamEmployee>;
