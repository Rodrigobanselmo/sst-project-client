/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import dayjs from 'dayjs';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  ClinicScheduleTypeEnum,
  IExam,
  IExamToRisk,
} from 'core/interfaces/api/IExam';
import {
  ICreateClientExam,
  useMutUpsertClientExam,
} from 'core/services/hooks/mutations/checklist/exams/useMutUpsertClientExam/useMutCreateClientExam';
import { useQueryClinicExams } from 'core/services/hooks/queries/useQueryClinicExams/useQueryClinicExams';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { dateToDateLessTime } from 'core/utils/date/date-format';
import {
  cleanObjectNullValues,
  cleanObjectValues,
} from 'core/utils/helpers/cleanObjectValues';
import { moneyConverter } from 'core/utils/helpers/money';

import { clinicExamsSchema } from './../../../../../core/utils/schemas/clinicExams.schema';

export const initialClinicExamState = {
  id: 0,
  name: '',
  examId: 0,
  companyId: '',
  examMinDuration: 0,
  groupId: '',
  observation: '',
  dueInDays: 0,
  isScheduled: null,
  isPeriodic: true,
  isChange: true,
  isAdmission: true,
  isReturn: false,
  isDismissal: false,
  exam: {} as IExam,
  status: StatusEnum.ACTIVE,
  startDate: dayjs().toDate() as Date | undefined,
  endDate: undefined as Date | undefined,
  scheduleType: '' as ClinicScheduleTypeEnum,
  scheduleRange: undefined as Record<string, string> | undefined,
  price: undefined as number | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (clinicExam: IExam | null) => {},
};

interface ISubmit {
  type: string;
  price: string;
  examMinDuration: string;
  scheduleType: ClinicScheduleTypeEnum;
  dueInDays: number;
}

const modalName = ModalEnum.EXAMS_CLINIC_ADD;

export const useEditClinicExams = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const { data: company } = useQueryCompany();

  const { handleSubmit, setValue, setError, control, reset, getValues } =
    useForm({ resolver: yupResolver(clinicExamsSchema) });

  const upsertMutation = useMutUpsertClientExam();
  // const updateMutation = useMutUpdateExam();

  const { preventUnwantedChanges } = usePreventAction();

  const initialDataRef = useRef(initialClinicExamState);
  const [clinicExamData, setClinicExamData] = useState({
    ...initialClinicExamState,
  });

  const { data: allClinicExams } = useQueryClinicExams(
    1,
    {
      examId: clinicExamData.examId,
      companyId: clinicExamData.companyId,
      groupId: clinicExamData.groupId,
      orderBy: 'startDate',
      orderByDirection: 'desc',
    },
    5,
  );

  console.log('clinicExamData', clinicExamData);

  const isEdit = !!clinicExamData?.id;

  const initializeModalDate = (initialData?: any) => {
    if (!initialData) return;

    setClinicExamData((oldData) => {
      const newData = {
        ...oldData,
        ...cleanObjectNullValues(initialData),
      };
      initialDataRef.current = newData;

      return newData;
    });
  };

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialClinicExamState>>(modalName);

    initializeModalDate(initialData);
  }, [company, getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setClinicExamData(initialClinicExamState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        cleanObjectValues({ ...clinicExamData, ...values }),
        cleanObjectValues(initialDataRef.current),
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async ({
    type,
    dueInDays,
    ...data
  }) => {
    console.log(dueInDays);
    if (!clinicExamData?.exam?.id) {
      return setError('exam', { message: 'Exame obrigatório' });
    }

    if (!dueInDays && !clinicExamData?.exam?.isAttendance) {
      return setError('dueInDays', { message: 'campo obrigatório' });
    }

    const startDate = dateToDateLessTime(clinicExamData.startDate);

    if (!startDate) {
      return setError('startDate', { message: 'Data de início obrigatório' });
    }

    const submitData: ICreateClientExam = {
      ...data,
      dueInDays,
      companyId: clinicExamData.companyId,
      examId: clinicExamData.exam.id,
      status: clinicExamData.status,
      groupId: clinicExamData.groupId || undefined,
      scheduleRange: clinicExamData.scheduleRange,
      startDate: startDate,
      price: moneyConverter(data.price) || undefined,
      isScheduled: !!Number(type),
      observation: clinicExamData.observation,
      isPeriodic: clinicExamData.isPeriodic,
      isChange: clinicExamData.isChange,
      isAdmission: clinicExamData.isAdmission,
      isReturn: clinicExamData.isReturn,
      isDismissal: clinicExamData.isDismissal,
    };

    try {
      await upsertMutation
        .mutateAsync(submitData)
        .then((clinicExam) => clinicExamData.callback(clinicExam));
      onClose();
    } catch (error) {}
  };

  const onSelectCheck = (isChecked: boolean, type: keyof IExamToRisk) => {
    setClinicExamData((oldData) => ({
      ...oldData,
      [type]: isChecked,
    }));
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    clinicExamData,
    onSubmit,
    // loading: updateMutation.isLoading || createMutation.isLoading,
    loading: false,
    control,
    handleSubmit,
    setClinicExamData,
    setValue,
    modalName,
    isEdit,
    allClinicExams,
    initializeModalDate,
    onStackOpenModal,
    onSelectCheck,
  };
};

export type IUseEditClinicExam = ReturnType<typeof useEditClinicExams>;
