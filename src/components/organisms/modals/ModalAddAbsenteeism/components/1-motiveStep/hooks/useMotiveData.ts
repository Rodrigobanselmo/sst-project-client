/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import dayjs from 'dayjs';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import {
  isAbsObservation,
  isAbsTraffic,
} from 'core/interfaces/api/IAbsenteeism';
import { ICreateAbsenteeism } from 'core/services/hooks/mutations/manager/absenteeism/useMutCreateAbsenteeism/useMutCreateAbsenteeism';

import { IUseAddAbsenteeism } from '../../../hooks/useAddAbsenteeism';

export const useMotiveData = (props: IUseAddAbsenteeism) => {
  const {
    absenteeismData,
    onCloseUnsaved: onClose,
    onSubmitData,
    getDateWithTime,
    getTimeFromDate,
  } = props;

  const {
    trigger,
    setError,
    getValues,
    control,
    reset,
    setValue,
    clearErrors,
  } = useFormContext();
  const { nextStep, stepCount, goToStep } = useWizard();

  const fields = ['motiveId'];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const addTime = (time?: string) => {
    const sDt = absenteeismData.startDate;
    const sT = absenteeismData.startTime;

    const dtStart = getDateWithTime(sDt, sT);
    const [h, m] = (time || '').split(':');

    const addDateTime = dayjs(dtStart)
      .add(Number(h || 0), 'hour')
      .add(Number(m || 0), 'minute');

    return getTimeFromDate(addDateTime.toDate());
  };

  const onSelectEmployee = () => {
    const button = document.getElementById(IdsEnum.EMPLOYEE_SELECT_ID);
    button?.click();
  };

  const endDate = useMemo(() => {
    const isDay = absenteeismData.timeUnit == DateUnitEnum.DAY;
    if (isDay) return absenteeismData.endDate;

    const sT = absenteeismData.startTime;
    const eT = absenteeismData.endTime;

    const sDt = absenteeismData.startDate;

    if (!sDt) return undefined;
    if (!sT) return sDt;
    if (!eT) return sDt;

    const dtStart = getDateWithTime(sDt, sT);
    const dtEnd = getDateWithTime(sDt, eT);

    if (dtStart && dtEnd && dtStart > dtEnd)
      return dayjs(absenteeismData.startDate).add(1, 'day').toDate();

    return absenteeismData.startDate;
  }, [
    absenteeismData.endDate,
    absenteeismData.endTime,
    absenteeismData.startDate,
    absenteeismData.startTime,
    absenteeismData.timeUnit,
    getDateWithTime,
  ]);

  const timeAway = useMemo(() => {
    const isDay = absenteeismData.timeUnit == DateUnitEnum.DAY;

    const sT = absenteeismData.startTime;
    const eT = absenteeismData.endTime;

    const sDt = absenteeismData.startDate;
    const eDt = endDate;

    if (!sDt) return;
    if (!eDt) return;
    if (!isDay && !sT) return;
    if (!isDay && !eT) return;

    const dtStart = getDateWithTime(sDt, sT);
    const dtEnd = getDateWithTime(eDt, eT);

    return Math.abs(dayjs(dtStart).diff(dtEnd, isDay ? 'days' : 'hour'));
  }, [
    absenteeismData.endTime,
    absenteeismData.startDate,
    absenteeismData.startTime,
    absenteeismData.timeUnit,
    endDate,
    getDateWithTime,
  ]);

  const onSubmit = async () => {
    clearErrors();
    const isValid = await trigger(fields);
    if (!isValid) return;

    const { traffic, observation } = getValues();
    const esocial18Motive = absenteeismData.esocial18Motive;
    const motiveId = absenteeismData.motiveId;

    const checkObs = isAbsObservation(absenteeismData.esocial18Code);
    const checkTraffic = isAbsTraffic(absenteeismData.esocial18Code);

    let error = false;
    if (!motiveId) {
      setError('motiveId', { message: 'Campo obrigatório' });
      error = true;
    }

    if (!absenteeismData.startDate) {
      setError('startDate', { message: 'Campo obrigatório' });
      error = true;
    }

    if (!endDate) {
      setError('endDate', { message: 'Campo obrigatório' });
      error = true;
    }

    if (checkObs && !observation) {
      setError('observation', { message: 'obrigatório' });
      error = true;
    }

    if (absenteeismData.timeUnit != DateUnitEnum.DAY) {
      if (!absenteeismData.startTime) {
        error = true;
        setError('startTime', { message: 'obrigatório' });
      }
      if (!absenteeismData.endTime) {
        error = true;
        setError('endTime', { message: 'obrigatório' });
      }
    }

    if (!absenteeismData.employeeId) return;
    if (!absenteeismData.startDate) return;
    if (!endDate) return;

    if (absenteeismData?.startDate > endDate) {
      setError('endDate', { message: 'Data anterior ao início' });
      error = true;
    }

    if (error) return;

    const submitData: ICreateAbsenteeism & { id?: number } = {
      id: absenteeismData.id,
      companyId: absenteeismData.companyId,
      startDate: getDateWithTime(
        absenteeismData.startDate,
        absenteeismData.startTime,
      ) as Date,
      endDate: getDateWithTime(endDate, absenteeismData.endTime) as Date,
      employeeId: absenteeismData.employeeId as number,
      timeUnit: absenteeismData.timeUnit,
      motiveId: motiveId,
      observation,
      esocial18Motive: esocial18Motive,
      ...(checkTraffic && {
        traffic,
      }),
    };

    onSubmitData(submitData, nextStep, { save: false });
  };

  return {
    ...props,
    onSubmit,
    control,
    onSelectEmployee,
    setValue,
    timeAway,
    addTime,
    endDate,
    onCloseUnsaved,
    lastStep,
  };
};

export type IUseMotiveData = ReturnType<typeof useMotiveData>;
