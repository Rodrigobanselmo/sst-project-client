/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import {
  IProfessional,
  IProfessionalCouncil,
} from 'core/interfaces/api/IProfessional';
import { IUser } from 'core/interfaces/api/IUser';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutUpdateGho } from 'core/services/hooks/mutations/checklist/gho/useMutUpdateGho';
import { cleanObjectNullValues } from 'core/utils/helpers/cleanObjectValues';
import { ghoSchema } from 'core/utils/schemas/gho.schema';
import { useQueryScheduleMedicalVisitOne } from 'core/services/hooks/queries/useQueryScheduleMedicalVisitOne/useQueryScheduleMedicalVisitOne';
import {
  ICreateScheduleMedicalExam,
  useMutCreateScheduleMedicalVisit,
} from 'core/services/hooks/mutations/manager/scheduleMedicalVisit/useMutCreateScheduleMedicalVisit/useMutCreateScheduleMedicalVisit';
import {
  IEmployeeSelectedExamTypeProps,
  IEmployeeSelectedProps,
} from 'components/organisms/tables/EmployeeScheduleMedicalVisitTable/EmployeeScheduleMedicalVisitTable';
import { ICreateEmployeeExamHistory } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutCreateEmployeeHisExam/useMutCreateEmployeeHisExam';
import { IdsEnum } from 'core/enums/ids.enums';
import { useSnackbar } from 'notistack';
import {
  IUpdateScheduleMedicalExam,
  useMutUpdateScheduleMedicalVisit,
} from 'core/services/hooks/mutations/manager/scheduleMedicalVisit/useMutUpdateScheduleMedicalVisit/useMutUpdateScheduleMedicalVisit';

export const initialModalEditScheduleMedicalVisitState = {
  status: StatusEnum.PROCESSING,
  id: 0,
  doneClinicDate: undefined as Date | undefined,
  doneLabDate: undefined as Date | undefined,
  companyId: undefined as string | undefined,

  company: undefined as ICompany | undefined,
  user: undefined as IUser | undefined,
  clinic: undefined as ICompany | undefined,
  lab: undefined as ICompany | undefined,
  doc: undefined as IProfessional | undefined,

  exams: [] as IEmployeeExamsHistory[],
};

const modalName = ModalEnum.SCHEDULE_MEDICAL_VISIT_MODAL;

export const useModalEditScheduleMedicalVisit = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialModalEditScheduleMedicalVisitState);
  const tableRef = useRef<{
    getData: () => {
      data: IEmployeeSelectedProps;
      examTypes: IEmployeeSelectedExamTypeProps;
    };
  }>(null);

  const { handleSubmit, control, reset, setValue, getValues, setError } =
    useForm();
  const { enqueueSnackbar } = useSnackbar();

  const createScheduleVisit = useMutCreateScheduleMedicalVisit();
  const updateScheduleVisit = useMutUpdateScheduleMedicalVisit();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialModalEditScheduleMedicalVisitState,
  });

  const { data: medicalVisit, isLoading: medicalVisitLoading } =
    useQueryScheduleMedicalVisitOne({
      id: data.id,
      companyId: data.companyId,
    });

  const isEdit = data.id !== 0 && data.id;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialModalEditScheduleMedicalVisitState>>(
        modalName,
      );

    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setData((oldData) => {
        const newData = {
          ...cleanObjectNullValues(oldData),
          ...cleanObjectNullValues(initialData),
          ...medicalVisit,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, medicalVisit]);

  const onClose = () => {
    onCloseModal(modalName);
    setData(initialModalEditScheduleMedicalVisitState);
    reset();
  };

  const onSubmit: SubmitHandler<any> = async (formData) => {
    let error = false;
    if (!data.company?.id) {
      setError('company', { message: 'Selecione uma empresa' });
      error = true;
    }
    if (!data.doneClinicDate) {
      setError('doneClinicDate', { message: 'Selecione uma data' });
      error = true;
    }
    if (!data.clinic?.id) {
      setError('clinic', { message: 'Selecione uma clínica' });
      error = true;
    }
    if (!data.doc?.id) {
      setError('doc', { message: 'Selecione um médico' });
      error = true;
    }

    const tableData = tableRef.current?.getData();

    if (!tableData) return;

    const exams: ICreateEmployeeExamHistory[] = [];

    const examsMap = medicalVisit?.exams?.reduce((acc, curr) => {
      acc[`${curr.employeeId}${curr.examId}`] = curr;
      return acc;
    }, {} as Record<string, IEmployeeExamsHistory>);

    Object.entries(tableData.data).forEach(([employeeId, recordExam]) => {
      Object.entries(recordExam).forEach(([examId, dataExam]) => {
        if (!dataExam.checked) return;

        const isAttendance = dataExam.exam?.isAttendance;

        if (!isAttendance && !data.lab?.id) {
          setError('lab', { message: 'Selecione um laboratório' });
          error = true;
        }
        if (!isAttendance && !data.doneLabDate) {
          setError('doneLabDate', { message: 'Selecione uma data' });
          error = true;
        }
        if (!dataExam.infoExam?.validity) {
          setError(`validity_${employeeId}_${examId}`, {
            message: 'Selecione uma validade',
          });
          error = true;
        }

        let examType = tableData.examTypes[Number(employeeId)];
        if (!examType) {
          const examTypeName =
            IdsEnum.EMPLOYEE_SCHEDULE_MEDICAL_EXAM_TYPE_CHECKBOX.replace(
              ':id',
              String(employeeId),
            );

          const [examTypeValue] = getValues([examTypeName]);

          examType = examTypeValue;

          if (!examType) {
            error = true;
            setError(examType, { message: 'Campo obrigatório' });
          }
        }

        if (error) {
          return;
        }

        if (!dataExam.infoExam?.validity) return;

        const exam: ICreateEmployeeExamHistory & { id?: number } = {
          companyId: data.company?.id as string,
          doneDate: (isAttendance
            ? data.doneClinicDate
            : data.doneLabDate) as Date,
          status: data.status,
          clinicId: isAttendance ? data.clinic?.id : data.lab?.id,
          doctorId: data.doc?.id,
          employeeId: Number(employeeId),
          examId: Number(examId),
          examType,
          time: '00:00',
          validityInMonths: dataExam.infoExam?.validity,
        };

        if (isEdit && medicalVisit) {
          const visitScheduleExam = examsMap?.[`${employeeId}${examId}`];
          if (
            visitScheduleExam &&
            visitScheduleExam.scheduleMedicalVisitId == medicalVisit.id
          ) {
            exam.id = visitScheduleExam?.id;
          }
        }

        exams.push(exam);
      });
    });

    if (error) {
      return;
    }
    if (!data.company?.id) return;
    if (!data.clinic?.id) return;
    if (!data.doneClinicDate) return;
    if (!exams.length) {
      enqueueSnackbar('Selecione ao menos 1 funcionario', {
        variant: 'warning',
        autoHideDuration: 3000,
      });
    }

    const submitData: IUpdateScheduleMedicalExam = {
      companyId: data.company?.id,
      doneClinicDate: data.doneClinicDate,
      doneLabDate: data.doneLabDate,
      status: data.status,
      clinicId: data.clinic.id,
      labId: data.lab?.id,
      docId: data.doc?.id,
      exams,
    };

    if (!isEdit) {
      await createScheduleVisit.mutateAsync(submitData).catch(() => {});
    } else {
      submitData.id = data.id;
      await updateScheduleVisit.mutateAsync(submitData).catch(() => {});
    }

    onClose();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...data, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading:
      createScheduleVisit.isLoading ||
      updateScheduleVisit.isLoading ||
      medicalVisitLoading,
    data,
    setData,
    control,
    handleSubmit,
    modalName,
    tableRef,
    setValue,
    medicalVisit,
  };
};

export type IUseModalEditScheduleMedicalVisit = ReturnType<
  typeof useModalEditScheduleMedicalVisit
>;
