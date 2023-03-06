/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

import { IExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/types';
import { useSnackbar } from 'notistack';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ClinicScheduleTypeEnum, IExam } from 'core/interfaces/api/IExam';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutCreateEmployee } from 'core/services/hooks/mutations/manager/useMutCreateEmployee';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';
import { useFetchQueryClinic } from 'core/services/hooks/queries/useQueryClinic';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';

import { IEmployee } from '../../../../../core/interfaces/api/IEmployee';

export const initialExamScheduleState = {
  employeeId: undefined as number | undefined,
  companyId: undefined as string | undefined,
  examType: undefined as ExamHistoryTypeEnum | undefined,
  hierarchy: undefined as undefined | IHierarchy,
  obs: undefined as undefined | string,
  avaliationExam: undefined as undefined | IExam,
  clinicObs: undefined as undefined | string,
  hierarchyId: undefined as undefined | string,
  subOfficeId: undefined as undefined | string,
  changeHierarchyAnyway: undefined as undefined | boolean,
  changeHierarchyWhenDone: false as undefined | boolean,
  changeHierarchyDate: undefined as undefined | Date,
  sector: undefined as undefined | IHierarchy,
  subOffice: undefined as undefined | IHierarchy,
  examsData: [] as IExamsScheduleTable[],
  isPendingExams: false,
  errors: {
    sector: false,
    hierarchy: false,
    subOffice: false,
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
  const { fetchClinic, getClinic } = useFetchQueryClinic();
  const { enqueueSnackbar } = useSnackbar();
  const { data: company } = useQueryCompany();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialExamScheduleState,
  });

  const { data: employee } = useQueryEmployee({
    id: data.employeeId,
    companyId: data.companyId,
  });

  const { data: hierarchyTree } = useQueryHierarchies(data.companyId);

  const isEdit = false;
  const isPendingExams = data.isPendingExams;
  const notInHierarchy = employee?.id && !employee?.hierarchyId;
  const newHierarchy = [
    ExamHistoryTypeEnum.ADMI,
    ExamHistoryTypeEnum.OFFI,
  ].includes(data.examType as any);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialExamScheduleState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
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
          ...(replaceData.hierarchyId && {
            hierarchy: hierarchyTree?.[replaceData.hierarchyId],
            ...(hierarchyTree?.[replaceData.hierarchyId] &&
              hierarchyTree[replaceData.hierarchyId].parentId && {
                sector:
                  hierarchyTree[
                    hierarchyTree[replaceData.hierarchyId].parentId as any
                  ],
              }),
            ...(replaceData.subOfficeId &&
              hierarchyTree?.[replaceData.subOfficeId] && {
                subOffice: hierarchyTree?.[replaceData.subOfficeId],
              }),
          }),
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, hierarchyTree]);

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
    isPendingExams,
    fetchClinic,
    getClinic,
    enqueueSnackbar,
    company,
  };
};

export type IUseEditEmployee = ReturnType<typeof useEditExamEmployee>;
