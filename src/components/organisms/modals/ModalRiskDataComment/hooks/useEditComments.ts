/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  RiskRecTextTypeEnum,
  RiskRecTypeEnum,
} from 'project/enum/RiskRecType.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  IUpsertRiskDataRec,
  useMutUpsertRiskDataRec,
} from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskDataRec';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { commentSchema } from 'core/utils/schemas/comment.schema';

export const initialCommentState = {
  id: '',
  status: StatusEnum.ACTIVE,
  name: '',
  text: '',
  type: RiskRecTypeEnum.DONE,
  textType: '' as RiskRecTextTypeEnum,
  riskGroupDataId: '',
  riskDataId: '',
  recMedId: '',
  endDate: '',
  callback: async (data: IUpsertRiskDataRec) => {},
};

interface ISubmit {
  text: string;
  endDate?: string;
  textType: RiskRecTextTypeEnum;
}

export const useEditComments = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialCommentState);
  const switchRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, control, reset, getValues, setError } = useForm({
    resolver: yupResolver(commentSchema),
  });

  const { preventUnwantedChanges } = usePreventAction();

  const [commentData, setCommentData] = useState({
    ...initialCommentState,
  });

  const upsertRiskRecMutation = useMutUpsertRiskDataRec(
    commentData.riskGroupDataId,
  );

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialCommentState>>(
      ModalEnum.RISK_DATA_COMMENTS_ADD,
    );

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setCommentData((oldData) => {
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
    onCloseModal(ModalEnum.RISK_DATA_COMMENTS_ADD, data);
    setCommentData(initialCommentState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const beforeObject = cleanObjectValues({
      ...commentData,
      ...cleanObjectValues(values),
    });

    const afterObject = cleanObjectValues(initialDataRef.current);

    if (preventUnwantedChanges(beforeObject, afterObject, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: IUpsertRiskDataRec = {
      status: commentData.status || undefined,
      comment: {
        text: data.text,
        textType: data.textType,
        type: commentData.type,
      },
      riskFactorDataId: commentData.riskDataId,
      recMedId: commentData.recMedId,
    };

    if (commentData.type === RiskRecTypeEnum.POSTPONED) {
      const selectedDate = dayjs(data.endDate, 'DD-MM-YYYY').isValid();
      if (!selectedDate)
        return setError('endDate', { message: 'Selecione uma data válida' });
      if (dayjs(data.endDate, 'DD-MM-YYYY').isBefore(new Date()))
        return setError('endDate', {
          message: 'Data precisa estar no futuro',
        });

      if (data.endDate) submitData.endDate = data.endDate;
    }

    await upsertRiskRecMutation
      .mutateAsync(submitData)
      .then(() => {
        onClose();
      })
      .catch(console.error);
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    commentData,
    onSubmit,
    loading: upsertRiskRecMutation.isLoading,
    control,
    handleSubmit,
    setCommentData,
    switchRef,
  };
};

export type IUseEditComment = ReturnType<typeof useEditComments>;
