/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import clone from 'clone';
import { onDownloadPdf } from 'components/molecules/SIconDownloadExam/SIconDownloadExam';
import { initialFileUploadState } from 'components/organisms/modals/ModalUploadNewFile/ModalUploadNewFile';
import { IExamComplementsClinicTable } from 'components/organisms/tables/ExamsComplementsClinicTable/ExamsComplementsClinicTable';
import { IExamComplementsTable } from 'components/organisms/tables/ExamsComplementsTable/ExamsComplementsTable';
import { useSnackbar } from 'notistack';
import { ExamHistoryConclusionEnum } from 'project/enum/employee-exam-history-conclusion.enum';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useTableSelect } from 'core/hooks/useTableSelect';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IExam } from 'core/interfaces/api/IExam';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useMutFindExamByHierarchy } from 'core/services/hooks/mutations/checklist/exams/useMutFindExamByHierarchy/useMutUpdateExamRisk';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
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
import { useMutUploadEmployeeHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUploadEmployeeHisExam/useMutUploadEmployeeHisExam';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { dateToDate } from 'core/utils/date/date-format';

import { employeeHistoryExamSchema } from '../../../../../core/utils/schemas/employee.schema';
import { SModalInitContactProps } from '../types';

export const initialEditEmployeeHistoryExamState = {
  doctor: undefined,
  status: undefined,
  evaluationType: undefined,
} as Partial<
  IEmployee & {
    doctor?: IProfessional;
    status?: undefined | StatusEnum;
    evaluationType?: ExamHistoryEvaluationEnum;
  }
>;

const modalName = ModalEnum.EMPLOYEE_HISTORY_EXAM_EDIT_CLINIC;

export const useAddData = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const initialDataRef = useRef(initialEditEmployeeHistoryExamState);

  const { handleSubmit, setValue, control, trigger, reset, getValues } =
    useForm({
      resolver: yupResolver(employeeHistoryExamSchema),
    });

  const updateMutation = useMutUpdateManyScheduleHisExam();
  const uploadMutation = useMutUploadEmployeeHisExam();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialEditEmployeeHistoryExamState,
  });

  const isEdit = !!data.id;
  const { getCompanyId } = useGetCompanyId();
  const { data: company } = useQueryCompany();

  // const companyId = useMemo(() => getCompanyId({}), [getCompanyId]);
  const companyId = useMemo(
    () =>
      getCompanyId(company.isClinic ? {} : data.companyId || data.company?.id),
    [company.isClinic, data.company?.id, data.companyId, getCompanyId],
  );

  const clinicExam = data?.examsHistory?.find((e) => e.exam?.isAttendance);
  const complementaryExams = data?.examsHistory?.filter(
    (e) => !e.exam?.isAttendance,
  );

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEditEmployeeHistoryExamState>>(
        modalName,
      );

    const setInitialData = async () => {
      if (initialData && !(initialData as any).passBack) {
        setData((oldData) => {
          const clinicExam = initialData?.examsHistory?.find(
            (e) => e.exam?.isAttendance,
          );

          const newData = {
            ...oldData,
            ...initialData,
            ...data,
            doctor: clinicExam?.doctor,
            status: clinicExam?.status,
          };

          initialDataRef.current = newData;
          return newData;
        });
      }
    };

    setInitialData();

    setTimeout(() => {
      trigger(['sex', 'birthday']);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialEditEmployeeHistoryExamState);
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
        status: data.status || examData.status,
      };

      if (examData.exam?.isAttendance) {
        if (data.evaluationType) submit.evaluationType = data.evaluationType;
        if (data.doctor?.id) {
          submit.doctorId = data.doctor.id;
          if (!data.status || data.status === StatusEnum.PROCESSING)
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

  const onChangeDoctor = async (prof: IProfessional) => {
    const [sex, birthday] = getValues(['sex', 'birthday']);

    if (!sex || !birthday) {
      setData({
        ...data,
        doctor: { name: '', id: '' } as any,
      });
      setTimeout(() => {
        setData({
          ...data,
          doctor: undefined,
        });
      }, 100);

      return enqueueSnackbar(
        'Preencha os dados do funcionário para prosseguir',
        {
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
          variant: 'warning',
        },
      );
    }

    const submitData: IUpdateManyScheduleExamHistory = {
      birthday: data.birthday,
      isClinic: true,
      companyId,
      data: [],
    };

    let asoId: number;

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
        asoId = examData.exam.id;
        if (prof?.id) {
          submit.doctorId = prof.id;
          submit.status = StatusEnum.DONE;
        }
      }

      submitData.data.push(submit);
    });

    await updateMutation
      .mutateAsync({ ...submitData })
      .then(() => {
        if (prof?.id)
          onDownloadPdf(RoutesEnum.PDF_GUIDE, {
            employeeId: data.id,
            companyId,
            asoId,
          });
        setData({
          ...data,
          doctor: prof,
        });
      })
      .catch(() => null);
  };

  const onCloseUnsaved = () => {
    const { doctor, evaluationType, examType, doneDate, time, ...values } =
      getValues();

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

  const { onToggleSelected, onIsSelected, onToggleAll, selectedData } =
    useTableSelect();

  const uploadExam = async ({ ids, file }: { ids: number[]; file: File }) => {
    const exams = await uploadMutation.mutateAsync({
      ids,
      companyId: data.companyId || data.company?.id,
      file,
    });

    setData({
      ...data,
      examsHistory: data.examsHistory?.map((exam) => {
        const found = exams?.find((e) => e.id === exam.id);
        return { ...exam, ...(found?.fileUrl && { fileUrl: found.fileUrl }) };
      }),
    });
  };

  const onUploadManyFile = () => {
    const ids = selectedData;

    if (ids.length == 0) {
      return enqueueSnackbar(
        'Selecione os exames abaixo para adcionar o arquivo',
        {
          variant: 'warning',
        },
      );
    }

    onStackOpenModal(ModalEnum.UPLOAD_NEW_FILE, {
      onConfirm: ({ files }) => {
        if (files && files[0]) {
          uploadExam({ file: files[0], ids });
        }
      },
    } as Partial<typeof initialFileUploadState>);
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
    onToggleSelected,
    onIsSelected,
    onToggleAll,
    selectedData,
    uploadExam,
    uploadMutation,
    onUploadManyFile,
    onChangeDoctor,
  };
};
