/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany as IClinic, ICompany } from 'core/interfaces/api/ICompany';
import { ScheduleBlockTypeEnum } from 'core/interfaces/api/IScheduleBlock';
import { useMutCreateScheduleBlock } from 'core/services/hooks/mutations/manager/block/useMutCreateScheduleBlock/useMutCreateScheduleBlock';
import { useMutDeleteScheduleBlock } from 'core/services/hooks/mutations/manager/block/useMutDeleteScheduleBlock/useMutDeleteScheduleBlock';
import { useMutUpdateScheduleBlock } from 'core/services/hooks/mutations/manager/block/useMutUpdateScheduleBlock/useMutUpdateScheduleBlock';
import { useQueryScheduleBlock } from 'core/services/hooks/queries/block/useQueryScheduleBlock/useQueryScheduleBlock';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import {
  cleanObjectNullValues,
  cleanObjectValues,
} from 'core/utils/helpers/cleanObjectValues';
import { scheduleBlockSchema } from 'core/utils/schemas/scheduleBlock.schema';

import { ICreateScheduleBlock } from '../../../../../core/services/hooks/mutations/manager/block/useMutCreateScheduleBlock/useMutCreateScheduleBlock';

export const initialScheduleBlockState = {
  id: 0,
  companyId: '',
  name: undefined as undefined | string,
  description: undefined as undefined | string,
  startDate: undefined as undefined | Date,
  endDate: undefined as undefined | Date,
  startTime: undefined as undefined | string,
  endTime: undefined as undefined | string,
  yearRecurrence: undefined as undefined | boolean,
  allCompanies: undefined as undefined | boolean,
  status: undefined as undefined | StatusEnum,
  type: undefined as undefined | ScheduleBlockTypeEnum,

  applyOnCompanies: [] as ICompany[],
};

interface ISubmit {
  name: string;
  description: string;
}

const modalName = ModalEnum.SCHEDULE_BLOCK_ADD;

export const useAddScheduleBlock = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const { user } = useGetCompanyId();
  const { data: company } = useQueryCompany();

  const { handleSubmit, setValue, setError, control, reset, getValues } =
    useForm({
      resolver: yupResolver(scheduleBlockSchema),
    });

  const createMutation = useMutCreateScheduleBlock();
  const updateMutation = useMutUpdateScheduleBlock();
  const deleteMutation = useMutDeleteScheduleBlock();

  const { preventUnwantedChanges } = usePreventAction();

  const initialDataRef = useRef(initialScheduleBlockState);
  const [scheduleblockData, setScheduleblockData] = useState({
    ...initialScheduleBlockState,
  });

  const isEdit = !!scheduleblockData.id;
  const isClinic = !!company.isClinic;

  const { data: scheduleblock, isLoading: scheduleblockLoading } =
    useQueryScheduleBlock({
      id: scheduleblockData.id,
      companyId: scheduleblockData.companyId,
    });

  useEffect(() => {
    const initialData = getModalData<
      Partial<typeof initialScheduleBlockState> & { companyId: string }
    >(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setScheduleblockData((oldData) => {
        const newData = {
          ...oldData,
          ...cleanObjectNullValues(initialData),
          ...scheduleblock,
          ...(scheduleblock?.startDate && {
            startDate: dayjs(scheduleblock.startDate).add(3, 'h').toDate(),
          }),
          ...(scheduleblock?.endDate && {
            endDate: dayjs(scheduleblock.endDate).add(3, 'h').toDate(),
          }),
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
  }, [scheduleblock, getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setScheduleblockData(initialScheduleBlockState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        cleanObjectValues({ ...scheduleblockData, ...values }),
        cleanObjectValues(initialDataRef.current),
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    let isErrorFound = false;
    if (!scheduleblockData.startDate) {
      setError('startDate', { message: 'Campo Obrigatório' });
      isErrorFound = true;
    }
    if (!scheduleblockData.endDate) {
      setError('endDate', { message: 'Campo Obrigatório' });
      isErrorFound = true;
    }

    if (isErrorFound) return;

    if (
      !isClinic &&
      !scheduleblockData.allCompanies &&
      scheduleblockData.applyOnCompanies.length == 0
    ) {
      return enqueueSnackbar('Selecione ao menos uma Clínica', {
        variant: 'error',
      });
    }

    const submitData: ICreateScheduleBlock & { id?: number } = {
      ...data,
      id: scheduleblockData.id,
      status: scheduleblockData.status,
      allCompanies: scheduleblockData.allCompanies,
      companyId: scheduleblockData.companyId || (user?.companyId as string),
      endTime: scheduleblockData.endTime,
      startTime: scheduleblockData.startTime,
      type: scheduleblockData.type,
      endDate: scheduleblockData.endDate as Date,
      startDate: scheduleblockData.startDate as Date,
      yearRecurrence: scheduleblockData.yearRecurrence,
      companiesIds: scheduleblockData.applyOnCompanies.map((i) => i.id),
    };

    if (isClinic) delete submitData.allCompanies;
    if (isClinic) submitData.companiesIds = [company.id];

    try {
      if (!isEdit) {
        delete submitData.id;
        await createMutation
          .mutateAsync(submitData)
          .then(() => {
            close();
          })
          .catch(() => {});
      } else {
        await updateMutation
          .mutateAsync(submitData)
          .then(() => {
            close();
          })
          .catch(() => {});
      }

      onClose();
    } catch (error) {}
  };

  const handleDelete = () => {
    if (scheduleblockData.id)
      deleteMutation
        .mutateAsync({
          id: scheduleblockData.id,
          companyId: scheduleblockData.companyId,
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
  };

  const handleSelectClinic = (clinic: IClinic) => {
    setScheduleblockData((oldData) => {
      const filtered = oldData.applyOnCompanies.filter(
        (w) => w.id != clinic?.id,
      );

      if (filtered.length !== oldData.applyOnCompanies.length)
        return { ...oldData, applyOnCompanies: filtered };

      return {
        ...oldData,
        applyOnCompanies: [clinic, ...oldData.applyOnCompanies],
      };
    });
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    scheduleblockData,
    onSubmit,
    loading:
      updateMutation.isLoading ||
      createMutation.isLoading ||
      scheduleblockLoading,
    control,
    handleSubmit,
    setScheduleblockData,
    setValue,
    modalName,
    handleDelete,
    handleSelectClinic,
    scheduleblock,
    isClinic,
  };
};

export type IUseEditScheduleBlock = ReturnType<typeof useAddScheduleBlock>;
