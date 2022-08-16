/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IExam, IExamRiskData } from 'core/interfaces/api/IExam';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

export const initialExamDataState = {
  id: 0,
  examRiskData: {
    id: 0,
    examId: undefined as number | undefined,
    isMale: true,
    isFemale: true,
    isPeriodic: true,
    isChange: true,
    isAdmission: true,
    isReturn: true,
    isDismissal: true,
    validityInMonths: undefined as number | undefined,
    fromAge: undefined as number | undefined,
    toAge: undefined as number | undefined,
  } as Partial<IExamRiskData>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (exam: Partial<IExam> | null) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmit: (exam: Partial<IExam> | null) => {},
};

interface ISubmit {
  validityInMonths: string;
  toAge: string;
  fromAge: string;
}

export const useEditExams = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialExamDataState);
  const switchRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, control, setValue, reset, getValues } = useForm();

  const { preventUnwantedChanges } = usePreventAction();

  const [examData, setExamData] = useState({
    ...initialExamDataState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialExamDataState>>(
      ModalEnum.EXAM_RISK_DATA,
    );

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
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.EXAM_RISK_DATA, data);
    setExamData(initialExamDataState);
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
  }) => {
    const submitData: Partial<IExam> = {
      ...examData,
      examsRiskData: {
        ...examData.examRiskData,
        examId: examData.id,
        fromAge: fromAge ? parseInt(fromAge, 10) : undefined,
        toAge: toAge ? parseInt(toAge, 10) : undefined,
        validityInMonths: validityInMonths
          ? parseInt(validityInMonths, 10)
          : undefined,
      },
    };

    if (examData.onSubmit) {
      examData.onSubmit(submitData);
    }

    try {
      if (!switchRef.current?.checked) {
        onClose();
      } else {
        setExamData({
          ...initialExamDataState,
        });
        reset();
      }
    } catch (error) {}
  };

  const onSelectCheck = (isChecked: boolean, type: keyof IExamRiskData) => {
    setExamData((oldData) => ({
      ...oldData,
      examRiskData: { ...oldData.examRiskData, [type]: isChecked },
    }));
  };

  const isEdit = !!examData.examRiskData?.examId;

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
    setValue,
  };
};

export type IUseEditExam = ReturnType<typeof useEditExams>;
