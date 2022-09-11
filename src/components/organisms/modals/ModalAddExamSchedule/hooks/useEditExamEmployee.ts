/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

import { IExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/types';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutFindExamByHierarchy } from 'core/services/hooks/mutations/checklist/exams/useMutFindExamByHierarchy/useMutUpdateExamRisk';
import { useMutCreateEmployee } from 'core/services/hooks/mutations/manager/useMutCreateEmployee';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';

import { IEmployee } from '../../../../../core/interfaces/api/IEmployee';

export const initialExamScheduleState = {
  employeeId: undefined as number | undefined,
  companyId: undefined as string | undefined,
  examType: undefined as ExamHistoryTypeEnum | undefined,
  hierarchy: undefined as undefined | IHierarchy,
  obs: undefined as undefined | string,
  clinicObs: undefined as undefined | string,
  changeHierarchyAnyway: undefined as undefined | boolean,
  changeHierarchyWhenDone: true as undefined | boolean,
  changeHierarchyDate: undefined as undefined | Date,
  sector: undefined as undefined | IHierarchy,
  examsData: [] as IExamsScheduleTable[],
  errors: {
    sector: false,
    hierarchy: false,
  },
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

  const { data: employee } = useQueryEmployee({
    id: data.employeeId,
    companyId: data.companyId,
  });

  const isEdit = false;
  const notInHierarchy = employee?.id && !employee?.hierarchyId;
  const newHierarchy = [
    ExamHistoryTypeEnum.ADMI,
    ExamHistoryTypeEnum.OFFI,
  ].includes(data.examType as any);

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

  const hasExamsAskSchedule = data.examsData?.some(
    (data) =>
      data.isAttendance && data.scheduleType === ClinicScheduleTypeEnum.ASK,
  );

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    modalName,
    employee,
    onSubmitData,
    isEdit,
    loading: updateEmployee.isLoading || createEmployee.isLoading,
    createEmployee,
    updateEmployee,
    newHierarchy,
    notInHierarchy,
    hasExamsAskSchedule,
  };
};

export type IUseEditEmployee = ReturnType<typeof useEditExamEmployee>;
