/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import clone from 'clone';
import { IExamComplementsClinicTable } from 'components/organisms/tables/ExamsComplementsClinicTable/ExamsComplementsClinicTable';
import { IExamComplementsTable } from 'components/organisms/tables/ExamsComplementsTable/ExamsComplementsTable';
import { ExamHistoryConclusionEnum } from 'project/enum/employee-exam-history-conclusion.enum';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IExam } from 'core/interfaces/api/IExam';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useMutFindExamByHierarchy } from 'core/services/hooks/mutations/checklist/exams/useMutFindExamByHierarchy/useMutUpdateExamRisk';
import {
  ICreateEmployeeExamHistory,
  useMutCreateEmployeeHisExam,
} from 'core/services/hooks/mutations/manager/employee-history-exam/useMutCreateEmployeeHisExam/useMutCreateEmployeeHisExam';
import { useMutDeleteEmployeeHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutDeleteEmployeeHisExam/useMutDeleteEmployeeHisExam';
import { useMutFindByIdEmployeeHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutFindByIdEmployeeHisExam/useMutFindByIdEmployeeHisExam';
import { useMutUpdateEmployeeHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateEmployeeHisExam/useMutUpdateEmployeeHisExam';
import {
  IUpdateManyScheduleExamHistory,
  useMutUpdateManyScheduleHisExam,
} from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import { dateToDate } from 'core/utils/date/date-format';

import { employeeHistoryExamSchema } from '../../../../../core/utils/schemas/employee.schema';
import { SModalInitContactProps } from '../types';

export const initialEmployeeHistoryExamState = {
  doctor: undefined,
  evaluationType: undefined,
} as Partial<
  IEmployee & {
    doctor?: IProfessional;
    evaluationType?: ExamHistoryEvaluationEnum;
  }
>;

const modalName = ModalEnum.EMPLOYEE_HISTORY_EXAM_EDIT_CLINIC;

export const useAddData = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEmployeeHistoryExamState);

  const { handleSubmit, setValue, control, reset, getValues, setError } =
    useForm({
      resolver: yupResolver(employeeHistoryExamSchema),
    });

  const updateMutation = useMutUpdateManyScheduleHisExam();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialEmployeeHistoryExamState,
  });

  const isEdit = !!data.id;
  const { companyId } = useGetCompanyId();

  const clinicExam = data?.examsHistory?.find((e) => e.exam?.isAttendance);
  const complementaryExams = data?.examsHistory?.filter(
    (e) => !e.exam?.isAttendance,
  );

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEmployeeHistoryExamState>>(modalName);

    const setInitialData = async () => {
      if (initialData) {
        setData((oldData) => {
          const newData = {
            ...oldData,
            ...initialData,
            ...data,
          };

          initialDataRef.current = newData;
          return newData;
        });
      }
    };

    setInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialEmployeeHistoryExamState);
    reset();
  };

  const onSubmit: SubmitHandler<Omit<SModalInitContactProps, 'id'>> = async (
    dataForm,
  ) => {
    const submitData: IUpdateManyScheduleExamHistory = {
      birthday: data.birthday,
      isClinic: true,
      companyId,
      cpf: dataForm.cpf,
      email: dataForm.email,
      name: dataForm.name,
      phone: dataForm.phone,
      sex: dataForm.sex,
      data: [],
    };

    data.examsHistory?.forEach((examData) => {
      if (!data.id) return;

      const submit: IUpdateManyScheduleExamHistory['data'][0] = {
        employeeId: data.id,
        id: examData.id,
        conclusion: examData.conclusion,
        status: examData.status,
      };

      if (examData.exam?.isAttendance) {
        if (data.evaluationType) submit.evaluationType = data.evaluationType;
        if (data.doctor?.id) {
          submit.doctorId = data.doctor.id;
          submit.status = StatusEnum.DONE;
        }
      }

      submitData.data.push(submit);
    });

    await updateMutation
      .mutateAsync({ ...submitData })
      .then(() => onClose())
      .catch(() => null);
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const before = { ...initialDataRef.current } as any;
    const after = { ...data, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  const setComplementaryExam = (exam: Partial<IExamComplementsClinicTable>) => {
    const actualExams = [...(data.examsHistory || [])].map((examHistory) => {
      const data = clone(examHistory);

      if (examHistory.id === exam.id) {
        return { ...data, ...exam };
      }

      Object.entries(exam).forEach(([key, value]) => {
        if (exam.exam?.isAttendance) return;
        if (typeof value === 'boolean') return;
        if (!(data as any)[key] && value) {
          (data as any)[key] = (exam as any)[key];
        }
      });

      return data;
    });

    console.log(actualExams);
    setData({ ...data, examsHistory: actualExams });
  };

  const setAllComplementaryExamDone = () => {
    const actualExams = [...(data.examsHistory || [])].map((examHistory) => {
      const data = clone(examHistory);
      (data as any).status = StatusEnum.DONE;

      return data;
    });

    setData({ ...data, examsHistory: actualExams });
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: updateMutation.isLoading,
    control,
    handleSubmit,
    isEdit,
    modalName,
    data,
    setData,
    companyId,
    setValue,
    setComplementaryExam,
    clinicExam,
    complementaryExams,
    setAllComplementaryExamDone,
  };
};
