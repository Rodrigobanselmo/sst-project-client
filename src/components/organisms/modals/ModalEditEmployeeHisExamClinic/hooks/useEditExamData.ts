/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import clone from 'clone';
import { initialFileUploadState } from 'components/organisms/modals/ModalUploadNewFile/ModalUploadNewFile';
import { IExamComplementsClinicTable } from 'components/organisms/tables/ExamsComplementsClinicTable/ExamsComplementsClinicTable';
import { useSnackbar } from 'notistack';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useTableSelect } from 'core/hooks/useTableSelect';
import { ICompany } from 'core/interfaces/api/ICompany';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  IUpdateManyScheduleExamHistory,
  useMutUpdateManyScheduleHisExam,
} from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import { useMutUploadEmployeeHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUploadEmployeeHisExam/useMutUploadEmployeeHisExam';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { employeeHistoryExamSchema } from '../../../../../core/utils/schemas/employee.schema';
import { initialExamScheduleState } from '../../ModalAddExamSchedule/hooks/useEditExamEmployee';
import { SModalInitContactProps } from '../types';

export const onGetExamPdfRoute = ({
  isAvaliation,
}: {
  isAvaliation?: boolean;
}) => {
  if (isAvaliation) return RoutesEnum.PDF_KIT_EVAL;
  return RoutesEnum.PDF_KIT_EXAM;
};

export const onUserSchedule = (examHistory: IEmployeeExamsHistory) => {
  if (examHistory.status == StatusEnum.DONE) return 'Realizado por';
  if (examHistory.status == StatusEnum.CANCELED) return 'Cancelado por';

  return 'Editado por';
};

export const initialEditEmployeeHistoryExamState = {
  doctor: undefined,
  status: undefined,
  evaluationType: undefined,
} as Partial<
  IEmployee & {
    doctor?: IProfessional;
    clinic?: ICompany;
    status?: undefined | StatusEnum;
    evaluationType?: ExamHistoryEvaluationEnum;
    reScheduleExamData?: IEmployeeExamsHistory;
  }
>;

const modalName = ModalEnum.EMPLOYEE_HISTORY_EXAM_EDIT_CLINIC;

export const useAddData = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const initialDataRef = useRef(initialEditEmployeeHistoryExamState);

  const {
    handleSubmit,
    setError,
    setValue,
    control,
    trigger,
    reset,
    getValues,
    setFocus,
  } = useForm<any>({
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

  const clinicExam = data?.examsHistory?.find(
    (e) => e.exam?.isAttendance || e.exam?.isAvaliation,
  );
  const complementaryExams = data?.examsHistory?.filter(
    (e) => !e.exam?.isAttendance && !e.exam?.isAvaliation,
  );

  const isAvaliation = clinicExam?.exam?.isAvaliation;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEditEmployeeHistoryExamState>>(
        modalName,
      );

    const setInitialData = async () => {
      // eslint-disable-next-line prettier/prettier
      if (
        initialData &&
        Object.keys(initialData)?.length &&
        !(initialData as any).passBack
      ) {
        setData((oldData) => {
          const clinicExam = initialData?.examsHistory?.find(
            (e) => e.exam?.isAttendance || e.exam?.isAvaliation,
          );

          const newData = {
            ...oldData,
            ...initialData,
            ...data,
            doctor: data.doctor || clinicExam?.doctor,
            status: data.status || clinicExam?.status,
          };

          const isReturn = clinicExam?.examType === ExamHistoryTypeEnum.RETU;

          if (isReturn && newData.examsHistory) {
            newData.examsHistory = newData.examsHistory?.filter(
              (e) => e.examType == ExamHistoryTypeEnum.RETU,
            );
          }

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
        status: examData.status,
      };

      if (examData.exam?.isAttendance) {
        if (data.evaluationType) submit.evaluationType = data.evaluationType;

        submit.status = data.status;
        submit.doctorId =
          data.doctor?.id ||
          (initialDataRef.current?.doctor ? null : undefined);
        // if (data.doctor?.id) {
        //   submit.doctorId = data.doctor.id;
        //   if (!data.status || data.status === StatusEnum.PROCESSING)
        //     submit.status = StatusEnum.DONE;
        // }
      }

      submitData.data.push(submit);
    });

    await updateMutation
      .mutateAsync({ ...submitData })
      .then(() => onClose())
      .catch(() => null);
  };

  const onChangeDoctor = async (prof: IProfessional) => {
    // const [sex, birthday] = getValues(['sex', 'birthday']);

    // if (!sex || !birthday) {
    //   setData({
    //     ...data,
    //     doctor: { name: '', id: '' } as any,
    //   });
    //   setTimeout(() => {
    //     setData({
    //       ...data,
    //       doctor: undefined,
    //     });
    //   }, 100);

    //   setFocus('sex');
    //   if (!sex) setError('sex', { message: 'Campo Obrigatório' });
    //   if (!birthday) setError('birthday', { message: 'Campo Obrigatório' });

    //   return enqueueSnackbar(
    //     'Preencha os dados do funcionário para prosseguir',
    //     {
    //       anchorOrigin: {
    //         vertical: 'top',
    //         horizontal: 'center',
    //       },
    //       variant: 'warning',
    //     },
    //   );
    // }

    setData({
      ...data,
      doctor: prof,
    });

    // const submitData: IUpdateManyScheduleExamHistory = {
    //   birthday: data.birthday,
    //   isClinic: true,
    //   companyId,
    //   data: [],
    // };

    // let asoOrAvaliationId: number;

    // data.examsHistory?.forEach((examData) => {
    //   if (!data.id) return;

    //   const submit: IUpdateManyScheduleExamHistory['data'][0] = {
    //     employeeId: data.id,
    //     id: examData.id,
    //     conclusion: examData.conclusion,
    //     status: examData.status,
    //   };

    //   if (examData.exam?.isAttendance || examData.exam?.isAvaliation) {
    //     if (data.evaluationType) submit.evaluationType = data.evaluationType;
    //     asoOrAvaliationId = examData?.id;
    //     if (prof?.id) {
    //       submit.doctorId = prof.id;
    //       submit.status = StatusEnum.DONE;
    //     }
    //   }

    //   submitData.data.push(submit);
    // });

    // await updateMutation
    //   .mutateAsync({ ...submitData })
    //   .then(() => {
    //     if (prof?.id)
    //       onDownloadPdf(onGetExamPdfRoute({ isAvaliation }), {
    //         employeeId: data.id,
    //         companyId,
    //         asoId: asoOrAvaliationId,
    //       });
    //     setData({
    //       ...data,
    //       doctor: prof,
    //     });
    //   })
    //   .catch(() => null);
  };

  const onChangeStatusToDone = async () => {
    setData((old) => ({
      ...old,
      status: StatusEnum.DONE,
      // examsHistory: data.examsHistory?.map((e) => ({
      //   ...e,
      //   ...(e.status == StatusEnum.PROCESSING && {
      //     status: StatusEnum.DONE,
      //   }),
      // })),
    }));

    enqueueSnackbar('Exame realizado com sucesso', {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      variant: 'success',
    });
  };

  const onChangeStatusToCancel = async () => {
    setData((old) => ({
      ...old,
      status: StatusEnum.CANCELED,
    }));

    enqueueSnackbar('Exame cancelado com sucesso', {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      variant: 'warning',
    });
  };

  const showIfKitMedico = async () => {
    const [sex, birthday] = getValues(['sex', 'birthday']);

    if (!sex || !birthday) {
      if (!sex) setError('sex', { message: 'Campo Obrigatório' });
      if (!birthday) setError('birthday', { message: 'Campo Obrigatório' });
      setFocus('sex');
      enqueueSnackbar('Preencha os dados do funcionário para prosseguir', {
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
        variant: 'warning',
      });

      return false;
    }

    return true;
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

    enqueueSnackbar('Exames realizados com sucesso', {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      variant: 'success',
    });
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
      accept: '',
      onConfirm: ({ files }) => {
        if (files && files[0]) {
          uploadExam({ file: files[0], ids });
        }
      },
    } as Partial<typeof initialFileUploadState>);
  };

  const onReSchedule = () => {
    const exam = data.reScheduleExamData;

    if (exam)
      onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE, {
        examType: exam.examType,
        hierarchyId: exam.hierarchyId,
        subOfficeId: exam.subOfficeId,
        companyId: exam?.employee?.companyId,
        employeeId: exam?.employee?.id,
      } as Partial<typeof initialExamScheduleState>);
  };

  const onGetExamType = (clinicExam: IEmployeeExamsHistory) => {
    if (clinicExam.examType) return clinicExam.examType;

    return '';
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
    isAvaliation,
    showIfKitMedico,
    onChangeStatusToDone,
    onReSchedule,
    onChangeStatusToCancel,
    onGetExamType,
  };
};
