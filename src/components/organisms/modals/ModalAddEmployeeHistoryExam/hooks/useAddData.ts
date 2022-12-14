/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
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
import { dateToDate } from 'core/utils/date/date-format';

import { employeeHistoryExamSchema } from '../../../../../core/utils/schemas/employee.schema';
import { SModalInitContactProps } from '../types';
import { cleanObjectNullValues } from './../../../../../core/utils/helpers/cleanObjectValues';

export const initialEmployeeHistoryExamState = {
  id: 0 as number | undefined,
  // motive: undefined as undefined | EmployeeHierarchyMotiveTypeEnum,
  doneDate: undefined as undefined | Date,
  examId: undefined as undefined | number,
  employeeId: undefined as undefined | number,
  hierarchyId: undefined as undefined | string,
  employee: undefined as undefined | IEmployee,
  created_at: undefined as undefined | Date,
  updated_at: undefined as undefined | Date,
  exam: undefined as undefined | IExam,
  clinic: undefined as undefined | ICompany,
  doctor: undefined as undefined | IProfessional,
  companyId: undefined as undefined | string,
  validityInMonths: undefined as undefined | number,
  status: undefined as undefined | StatusEnum,
  examsData: [] as IExamComplementsTable[],
  hideClinicExam: undefined as undefined | boolean,

  examType: undefined as undefined | ExamHistoryTypeEnum,
  evaluationType: undefined as undefined | ExamHistoryEvaluationEnum,
  conclusion: undefined as undefined | ExamHistoryConclusionEnum,
  time: undefined as undefined | string,

  errors: {
    exam: false,
    clinic: false,
  },
};

const modalName = ModalEnum.EMPLOYEE_HISTORY_EXAM_ADD;

export const useAddData = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEmployeeHistoryExamState);

  const { handleSubmit, setValue, control, reset, getValues, setError } =
    useForm({
      resolver: yupResolver(employeeHistoryExamSchema),
    });

  const createMutation = useMutCreateEmployeeHisExam();
  const updateMutation = useMutUpdateEmployeeHisExam();
  const deleteMutation = useMutDeleteEmployeeHisExam();
  const findByMutation = useMutFindByIdEmployeeHisExam();
  const findExamsMutation = useMutFindExamByHierarchy();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [data, setData] = useState({
    ...initialEmployeeHistoryExamState,
  });

  const isEdit = !!data.id;
  const isAllFields = !data.id || data.exam?.isAttendance;
  const hideClinicExam = data.hideClinicExam || !data.examId;

  const { getCompanyId } = useGetCompanyId();

  const companyId = getCompanyId(data);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEmployeeHistoryExamState>>(modalName);

    const setInitialData = async () => {
      if (initialData) {
        const data = initialData.id
          ? await findByMutation
              .mutateAsync({
                id: initialData.id,
                companyId: initialData.companyId,
              })
              .catch(() => null)
          : {};

        setData((oldData) => {
          const newData = {
            ...oldData,
            ...cleanObjectNullValues(initialData),
            ...data,
          };
          newData.doneDate = dateToDate(newData.doneDate);

          if (newData.time) setValue('time', newData.time);
          if (newData.examType) {
            setValue('examType', newData.examType);
          }
          if (newData.evaluationType)
            setValue('evaluationType', newData.evaluationType);
          if (newData.conclusion) setValue('conclusion', newData.conclusion);

          initialDataRef.current = newData;
          return newData;
        });
      }

      if (!initialData.id && initialData.hierarchyId) {
        const riskDataHierarchy = await findExamsMutation
          .mutateAsync({
            hierarchyId: initialData.hierarchyId,
            employeeId: initialData.employeeId,
          })
          .catch(() => null);

        if (riskDataHierarchy?.data)
          setData((data) => {
            const actualExams = [...data.examsData];
            riskDataHierarchy.data.map((db_data) => {
              if (db_data?.exam?.isAttendance) {
                const origin = db_data?.origins?.[0];
                if (origin) {
                  data.validityInMonths = origin.validityInMonths;
                  data.exam = origin.exam;
                  data.examId = origin.examId;
                }
                return;
              }
              if (
                actualExams.find((examData) => examData.id === db_data.exam?.id)
              )
                return;

              const origin = db_data.origins?.find(
                (origin) => !origin?.skipEmployee,
              );

              if (db_data.exam)
                actualExams.push({
                  id: db_data.exam.id,
                  name: db_data.exam.name,
                  status: StatusEnum.DONE,
                  validityInMonths: origin?.validityInMonths,
                  expiredDate: origin?.expiredDate,
                  isSelected: !origin?.expiredDate || !!origin?.closeToExpired,
                });
            });

            return { ...data, examsData: actualExams };
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

  const onSubmit: SubmitHandler<Omit<SModalInitContactProps, 'id'>> = async ({
    conclusion,
    ...dataForm
  }) => {
    console.log(data);
    if (!data.employeeId) return;
    if (!data.doneDate) return;
    if (isEdit && !hideClinicExam && !data.exam?.id) return;

    let isErrorFound = false;
    if (!hideClinicExam && !data.clinic?.id) {
      setError('clinic', { message: 'Validade obrigatório' });
      isErrorFound = true;
    }
    if (!hideClinicExam && !data.validityInMonths) {
      setError('validityInMonths', { message: 'Campo obrigatório' });
      isErrorFound = true;
    }
    if (!hideClinicExam && isAllFields && !data?.doctor?.id) {
      console.log(data);
      setError('doctor', { message: 'Campo obrigatório' });
      isErrorFound = true;
    }
    if (!hideClinicExam && isAllFields && !data?.evaluationType) {
      setError('evaluationType', { message: 'Campo obrigatório' });
      isErrorFound = true;
    }
    // if (!hideClinicExam && isAllFields && !data?.conclusion) {
    //   setError('conclusion', { message: 'Campo obrigatório' });
    //   isErrorFound = true;
    // }
    if (!hideClinicExam && !data?.examType) {
      setError('examType', { message: 'Campo obrigatório' });
      isErrorFound = true;
    }
    if (!hideClinicExam && !data?.doneDate) {
      setError('doneDate', { message: 'Campo obrigatório' });
      isErrorFound = true;
    }

    if (!isEdit)
      data.examsData.forEach((data) => {
        if (!data.isSelected) return;
        if (!data.clinic?.id) {
          setError(`clinic_${data.id}`, { message: 'Campo obrigatório' });
          isErrorFound = true;
        }
        if (!data.validityInMonths) {
          setError(`val_${data.id}`, { message: 'Campo obrigatório' });
          isErrorFound = true;
        }
        if (!data.doneDate) {
          setError(`doneDate_${data.id}`, { message: 'Campo obrigatório' });
          isErrorFound = true;
        }
      });
    if (isErrorFound) return;

    const submitData: ICreateEmployeeExamHistory = {
      ...dataForm,
      ...(conclusion && { conclusion }),
      examId: data.hideClinicExam ? undefined : data.exam?.id,
      clinicId: data.clinic?.id,
      doctorId: data?.doctor?.id,
      companyId,
      status: data?.status,
      employeeId: data.employeeId,
      doneDate: data.doneDate,
      validityInMonths: dataForm.validityInMonths || data.validityInMonths || 0,
      examsData: data.examsData
        .filter((exam) => exam.isSelected)
        .map((dt) => {
          return {
            clinicId: dt.clinic?.id,
            doneDate: dt.doneDate,
            examId: dt.id,
            status: data?.status,
            validityInMonths: dt.validityInMonths,
          };
        }),
    };

    try {
      if (!data.id) {
        await createMutation.mutateAsync(submitData);
        onClose();
      } else {
        if (!isAllFields) {
          delete submitData.doctorId;
          delete submitData.conclusion;
          delete submitData.evaluationType;
        }
        await updateMutation.mutateAsync({ ...submitData, id: data.id });
        onClose();
      }
    } catch (error) {
      console.log('error');
    }
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const before = { ...initialDataRef.current } as any;
    const after = { ...data, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  const addExam = (exam: IExam) => {
    if (!exam?.id) return;
    const actualExams = [...data.examsData];
    if (actualExams.find((examData) => examData.id == exam.id)) return;

    actualExams.push({
      id: exam.id,
      isSelected: true,
      name: exam.name,
      status: StatusEnum.DONE,
    });

    setData({ ...data, examsData: actualExams });
  };

  const setComplementaryExam = (exam: Partial<IExamComplementsTable>) => {
    const actualExams = [...data.examsData].map((data) => {
      if (data.id === exam.id) {
        return { ...data, ...exam };
      }

      Object.entries(exam).forEach(([key, value]) => {
        if (typeof value === 'boolean') return;

        if (!(data as any)[key] && value) {
          (data as any)[key] = (exam as any)[key];
        }
      });

      return data;
    });

    setData({ ...data, examsData: actualExams });
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading:
      createMutation.isLoading ||
      updateMutation.isLoading ||
      findByMutation.isLoading ||
      findExamsMutation.isLoading,
    control,
    handleSubmit,
    isEdit,
    modalName,
    handleDelete: () => preventDelete(handleDelete),
    data,
    setData,
    companyId,
    setValue,
    addExam,
    setComplementaryExam,
    isAllFields,
    hideClinicExam,
  };
};
