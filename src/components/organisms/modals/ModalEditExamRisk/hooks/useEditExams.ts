/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IExam, IExamRiskData, IExamToRisk } from 'core/interfaces/api/IExam';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import {
  ICreateExamRisk,
  useMutCreateExamRisk,
} from 'core/services/hooks/mutations/checklist/exams/useMutCreateExamRisk/useMutCreateExamRisk';
import { useMutUpdateExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutUpdateExamRisk/useMutUpdateExamRisk';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { examRiskSchema } from 'core/utils/schemas/exam.schema';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { RiskEnum } from 'project/enum/risk.enums';
import { useSnackbar } from 'notistack';
import { useMutDeleteExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutDeleteExamRisk/useMutDeleteExamRisk';

export const initialExamRiskState = {
  id: 0,
  examId: 0 as number,
  minRiskDegree: 0 as number,
  minRiskDegreeQuantity: 1 as number,
  riskId: '' as string,
  isAll: false,
  isMale: true,
  isFemale: true,
  isPeriodic: true,
  isChange: true,
  isAdmission: true,
  isReturn: false,
  isDismissal: true,
  validityInMonths: undefined as number | undefined,
  lowValidityInMonths: undefined as number | undefined,
  considerBetweenDays: undefined as number | undefined,
  fromAge: undefined as number | undefined,
  toAge: undefined as number | undefined,
  risk: {} as IRiskFactors,
  exam: {} as IExam,
  error: {
    risk: false,
    exam: false,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (exam: Partial<IExamToRisk> | null) => {},
};

interface ISubmit {
  validityInMonths: string;
  lowValidityInMonths: string;
  considerBetweenDays: string;
  fromAge: string;
  toAge: string;
  minRiskDegree: string;
  minRiskDegreeQuantity: string;
}

export const useEditExams = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialExamRiskState);
  const switchRef = useRef<HTMLInputElement>(null);
  const { companyId, userCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  const { handleSubmit, control, setValue, reset, getValues } = useForm({
    resolver: yupResolver(examRiskSchema),
  });

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [examData, setExamData] = useState({
    ...initialExamRiskState,
  });

  const createMutation = useMutCreateExamRisk();
  const updateMutation = useMutUpdateExamRisk();
  const deleteMutation = useMutDeleteExamRisk();

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialExamRiskState>>(
      ModalEnum.EXAM_RISK,
    );

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setExamData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.EXAM_RISK, data);
    setExamData(initialExamRiskState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const beforeObject = cleanObjectValues({
      ...examData,
      ...cleanObjectValues(values),
    });
    const afterObject = cleanObjectValues(initialDataRef.current);

    if (preventUnwantedChanges(afterObject, beforeObject, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async ({
    fromAge,
    toAge,
    validityInMonths,
    lowValidityInMonths,
    minRiskDegree,
    minRiskDegreeQuantity,
    considerBetweenDays,
  }) => {
    let riskId = examData.riskId;
    if (!examData.riskId) {
      if (!examData.isAll) {
        setExamData((oldData) => ({
          ...oldData,
          error: { ...oldData.error, risk: true },
        }));
        return;
      }

      const risks =
        queryClient.getQueryData<IRiskFactors[]>([
          QueryEnum.RISK,
          userCompanyId,
        ]) ||
        queryClient.getQueryData<IRiskFactors[]>([QueryEnum.RISK, companyId]) ||
        [];

      const riskAllId =
        risks.find((risk) => risk.representAll && risk.type == RiskEnum.OUTROS)
          ?.id || '';

      if (!riskAllId) {
        enqueueSnackbar('Não foi possível encontrar o risco', {
          variant: 'error',
        });
        return;
      }

      riskId = riskAllId;
    }

    if (!examData.examId) {
      setExamData((oldData) => ({
        ...oldData,
        error: { ...oldData.error, exam: true },
      }));
      return;
    }

    const submitData: ICreateExamRisk & { id?: number } = {
      ...examData,
      riskId,
      realCompanyId: companyId,
      fromAge: fromAge ? parseInt(fromAge, 10) : null,
      toAge: toAge ? parseInt(toAge, 10) : null,
      validityInMonths: validityInMonths
        ? parseInt(validityInMonths, 10)
        : null,
      lowValidityInMonths: lowValidityInMonths
        ? parseInt(lowValidityInMonths, 10)
        : null,
      considerBetweenDays: considerBetweenDays
        ? parseInt(considerBetweenDays, 10)
        : null,
      minRiskDegree: examData.exam.isAttendance
        ? 0
        : minRiskDegree
        ? parseInt(minRiskDegree, 10)
        : 1,
      minRiskDegreeQuantity: examData.exam.isAttendance
        ? 0
        : minRiskDegreeQuantity
        ? parseInt(minRiskDegreeQuantity, 10)
        : 1,
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

  const onSelectCheck = (isChecked: boolean, type: keyof IExamRiskData) => {
    setExamData((oldData) => ({
      ...oldData,
      [type]: isChecked,
    }));
  };

  const onRemove = async () => {
    const remove = async () => {
      if (examData.id && companyId)
        await deleteMutation.mutateAsync({
          id: examData.id,
          companyId: companyId,
        });

      onClose();
    };

    preventDelete(remove);
  };

  const isEdit = !!examData?.id;

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    examData,
    onSubmit,
    loading: false,
    control,
    handleSubmit,
    setExamData,
    switchRef,
    isEdit,
    onSelectCheck,
    onRemove,
    setValue,
  };
};

export type IUseEditExam = ReturnType<typeof useEditExams>;
