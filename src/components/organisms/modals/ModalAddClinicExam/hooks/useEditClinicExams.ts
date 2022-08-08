/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ExamTypeEnum, IExam } from 'core/interfaces/api/IExam';
import {
  ICreateClientExam,
  useMutUpsertClientExam,
} from 'core/services/hooks/mutations/checklist/exams/useMutUpsertClientExam/useMutCreateClientExam';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { clinicExamsSchema } from './../../../../../core/utils/schemas/clinicExams.schema';

export const initialExamState = {
  id: 0,
  name: '',
  examId: 0,
  companyId: '',
  dueInDays: 0,
  isScheduled: null,
  observation: '',
  exam: {} as IExam,
  status: StatusEnum.ACTIVE,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (clinicExam: IExam | null) => {},
};

interface ISubmit {
  name: string;
  type: string;
}

const modalName = ModalEnum.EXAMS_CLINIC_ADD;

export const useEditClinicExams = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const { user } = useGetCompanyId();

  const { data: company } = useQueryCompany();
  const { data: userCompany } = useQueryCompany(user?.companyId);

  const { handleSubmit, setValue, setError, control, reset, getValues } =
    useForm({ resolver: yupResolver(clinicExamsSchema) });

  const upsertMutation = useMutUpsertClientExam();
  // const updateMutation = useMutUpdateExam();

  const { preventUnwantedChanges } = usePreventAction();

  const initialDataRef = useRef(initialExamState);
  const [clinicExamData, setClinicExamData] = useState({
    ...initialExamState,
  });

  const companies = removeDuplicate([userCompany, company], {
    removeById: 'id',
  });

  const isEdit = !!clinicExamData?.id;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialExamState>>(modalName);

    if (initialData) {
      setClinicExamData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [company, getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setClinicExamData(initialExamState);
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

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    if (!clinicExamData?.exam?.id) {
      return setError('exam', { message: 'Exame obrigatório' });
    }

    const submitData: ICreateClientExam = {
      companyId: clinicExamData.companyId,
      examId: clinicExamData.exam.id,
      status: clinicExamData.status,
      ...data,
    };
    console.log(submitData);

    try {
      // if (!submitData.examId) {
      await upsertMutation
        .mutateAsync(submitData)
        .then((clinicExam) => clinicExamData.callback(clinicExam));
      // } else {
      // await updateMutation
      //   .mutateAsync(submitData)
      //   .then((clinicExam) => clinicExamData.callback(clinicExam));
      // }

      // onClose();
    } catch (error) {}
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
    companies,
    modalName,
    isEdit,
  };
};

export type IUseEditClinicExam = ReturnType<typeof useEditClinicExams>;
