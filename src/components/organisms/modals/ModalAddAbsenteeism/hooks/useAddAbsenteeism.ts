import { useEffect, useCallback, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { GiConsoleController } from 'react-icons/gi';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import dayjs from 'dayjs';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { AbsenteeismMotive } from 'core/interfaces/api/IAbsenteeism';
import { ICid } from 'core/interfaces/api/ICid';
import { IEsocialTable18Mot } from 'core/interfaces/api/IEsocial';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  ICreateAbsenteeism,
  useMutCreateAbsenteeism,
} from 'core/services/hooks/mutations/manager/absenteeism/useMutCreateAbsenteeism/useMutCreateAbsenteeism';
import { useMutDeleteAbsenteeism } from 'core/services/hooks/mutations/manager/absenteeism/useMutDeleteAbsenteeism/useMutDeleteAbsenteeism';
import { useMutUpdateAbsenteeism } from 'core/services/hooks/mutations/manager/absenteeism/useMutUpdateAbsenteeism/useMutUpdateAbsenteeism';
import { useQueryAbsenteeism } from 'core/services/hooks/queries/useQueryAbsenteeism/useQueryAbsenteeism';
import { useQueryAbsenteeismMotives } from 'core/services/hooks/queries/useQueryAbsenteeismMotives/useQueryAbsenteeismMotives';
import { useQueryCids } from 'core/services/hooks/queries/useQueryCids/useQueryCids';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';
import { useQueryEsocial18Tables } from 'core/services/hooks/queries/useQueryEsocial18/useQueryEsocial18';
import { cleanObjectNullValues } from 'core/utils/helpers/cleanObjectValues';

import { absenteeismSchema } from '../../../../../core/utils/schemas/absenteeism.schema';
import { SModalSubmitAbsenteeismProps } from '../types';
import { IEmployee } from './../../../../../core/interfaces/api/IEmployee';

export const initialAbsenteeismState = {
  id: 0,
  companyId: undefined as string | undefined,
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
  docId: undefined as number | undefined,
  doc: undefined as IProfessional | undefined,
  timeUnit: DateUnitEnum.DAY as DateUnitEnum,
  isJustified: undefined as boolean | undefined,
  isExtern: undefined as boolean | undefined,
  local: undefined as string | undefined,
  observation: undefined as string | undefined,
  sameAsBefore: undefined as boolean | undefined,
  traffic: undefined as number | undefined,
  vacationStartDate: undefined as Date | undefined,
  vacationEndDate: undefined as Date | undefined,
  cnpjSind: undefined as string | undefined,
  infOnusRemun: undefined as number | undefined,
  cnpjMandElet: undefined as string | undefined,
  origRetif: undefined as number | undefined,
  tpProc: undefined as number | undefined,
  nrProc: undefined as number | undefined,
  motiveId: undefined as number | undefined,
  esocial18Motive: undefined as number | undefined,
  esocial18Code: undefined as string | undefined,
  cidId: undefined as string | undefined,
  cid: undefined as ICid | undefined,
  status: undefined as StatusEnum | undefined,
  employeeId: undefined as number | undefined,
  employee: undefined as IEmployee | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
  time: undefined as number | undefined,

  esocial18: undefined as IEsocialTable18Mot | undefined,
  motive: undefined as AbsenteeismMotive | undefined,
};

const modalName = ModalEnum.ABSENTEEISM_ADD;

export const useAddAbsenteeism = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAbsenteeismState);

  const createMutation = useMutCreateAbsenteeism();
  const updateMutation = useMutUpdateAbsenteeism();
  const deleteMutation = useMutDeleteAbsenteeism();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [absenteeismData, setAbsenteeismData] = useState({
    ...initialAbsenteeismState,
  });

  const isEdit = !!absenteeismData.id;

  const { data: absenteeismMotives } = useQueryAbsenteeismMotives();
  const { data: esocial18Table } = useQueryEsocial18Tables();

  const { data: company } = useQueryCompany(absenteeismData.companyId);

  const { data: employee, isLoading: employeeLoading } = useQueryEmployee({
    id: absenteeismData.employeeId,
    companyId: absenteeismData.companyId,
    absenteeismLast60Days: true,
  });

  const { data: absenteeism, isLoading: absenteeismLoading } =
    useQueryAbsenteeism({
      id: absenteeismData.id,
      companyId: absenteeismData.companyId,
    });

  const getDateWithTime = useCallback((date?: Date, time?: string) => {
    if (!date) return;
    const [h, m] = (time || '').split(':');
    return dayjs(date)
      .set('hour', Number(h || 0))
      .set('minute', Number(m || 0))
      .toDate();
  }, []);

  const getTimeFromDate = useCallback((date?: Date) => {
    if (!date) return undefined;
    const dt = dayjs(date);
    return `${String(dt.get('hour')).padStart(2, '0')}:${String(
      dt.get('minute'),
    ).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialAbsenteeismState>>(modalName);

    if (initialData && !(initialData as any).passBack) {
      setAbsenteeismData((oldData) => {
        const newData = {
          ...oldData,
          ...cleanObjectNullValues(initialData),
          companyId: oldData.companyId || initialData.companyId,
          employeeId: oldData.employeeId || initialData.employeeId,
          ...absenteeism,
          startTime: getTimeFromDate(absenteeism?.startDate),
          endTime: getTimeFromDate(absenteeism?.endDate),
          esocial18Code: absenteeism?.esocial18?.code,
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData, absenteeism]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setAbsenteeismData(initialAbsenteeismState);
  };

  const onCloseUnsaved = (action?: () => void) => {
    const before = { ...initialDataRef.current } as any;
    const after = { ...absenteeismData } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
    action?.();
  };

  const onSubmitData = async (
    submitData: any,
    nextStep: () => void,
    { save }: { save?: boolean } = { save: true },
  ) => {
    if (!isEdit && save) {
      await createMutation
        .mutateAsync(submitData)
        .then((employee) => {
          nextStep();
          setAbsenteeismData((data) => ({
            ...data,
            ...submitData,
            ...employee,
          }));
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
    } else if (!isEdit) {
      nextStep();
      setAbsenteeismData((data) => ({
        ...data,
        ...submitData,
      }));
    } else {
      await updateMutation
        .mutateAsync(submitData)
        .then(() => {
          onClose();
        })
        .catch(() => {});
    }
  };

  const handleDelete = () => {
    if (absenteeismData.id)
      deleteMutation
        .mutateAsync({
          id: absenteeismData.id,
          companyId: absenteeismData.companyId,
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmitData,
    onClose,
    loading:
      createMutation.isLoading ||
      updateMutation.isLoading ||
      absenteeismLoading ||
      employeeLoading,
    absenteeismData,
    setAbsenteeismData,
    isEdit,
    modalName,
    handleDelete: () => preventDelete(handleDelete),
    company,
    employee,
    getDateWithTime,
    getTimeFromDate,
    esocial18Table,
    absenteeism,
    absenteeismMotives,
  };
};

export type IUseAddAbsenteeism = ReturnType<typeof useAddAbsenteeism>;
