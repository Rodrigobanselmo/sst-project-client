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
  ICreateExam,
  useMutCreateExam,
} from 'core/services/hooks/mutations/checklist/exams/useMutCreateExam/useMutCreateExam';
import { useMutUpdateExam } from 'core/services/hooks/mutations/checklist/exams/useMutUpdateExam/useMutUpdateExam';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { examSchema } from 'core/utils/schemas/exam.schema';

export const initialExamState = {
  id: 0,
  name: '',
  instruction: '',
  material: '',
  companyId: '',
  status: StatusEnum.ACTIVE,
  type: ExamTypeEnum.LAB,
  analyses: '',
  esocial27Code: '',
  isAttendance: undefined as boolean | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (exam: IExam | null) => {},
};

interface ISubmit {
  name: string;
  analyses: string;
  material: string;
  type: ExamTypeEnum;
}

const modalName = ModalEnum.EXAMS_ADD;

export const useEditExams = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const { user } = useGetCompanyId();

  const { data: company } = useQueryCompany();
  const { data: userCompany } = useQueryCompany(user?.companyId);

  const { handleSubmit, setValue, setError, control, reset, getValues } =
    useForm({
      resolver: yupResolver(examSchema),
    });

  const createMutation = useMutCreateExam();
  const updateMutation = useMutUpdateExam();

  const { preventUnwantedChanges } = usePreventAction();

  const initialDataRef = useRef(initialExamState);
  const [examData, setExamData] = useState({
    ...initialExamState,
  });

  const companies = removeDuplicate([userCompany, company], {
    removeById: 'id',
  });

  const isManyCompanies = companies.length > 1;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialExamState>>(modalName);

    if (initialData) {
      setExamData((oldData) => {
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
    setExamData(initialExamState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        cleanObjectValues({ ...examData, ...values }),
        cleanObjectValues(initialDataRef.current),
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: ICreateExam & { id?: number } = {
      ...data,
      companyId: examData.companyId,
      id: examData.id,
      status: examData.status,
      instruction: examData.instruction,
      isAttendance: examData.isAttendance || undefined,
    };

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation
          .mutateAsync(submitData)
          .then((exam) => examData.callback(exam));
      } else {
        await updateMutation
          .mutateAsync(submitData)
          .then((exam) => examData.callback(exam));
      }

      onClose();
    } catch (error) {}
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    examData,
    onSubmit,
    loading: updateMutation.isLoading || createMutation.isLoading,
    control,
    handleSubmit,
    setExamData,
    setValue,
    companies,
    isManyCompanies,
    modalName,
  };
};

export type IUseEditExam = ReturnType<typeof useEditExams>;
