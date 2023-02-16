import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import {
  getBlockDates,
  notAvailableScheduleTime,
} from 'components/organisms/tables/ExamsScheduleTable/columns/ExamsScheduleClinic';
import { IExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/types';
import dayjs from 'dayjs';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';

import { ICompany } from 'core/interfaces/api/ICompany';
import { useFetchQueryClinic } from 'core/services/hooks/queries/useQueryClinic';
import { useQueryHisScheduleClinicTime } from 'core/services/hooks/queries/useQueryHisScheduleClinicTime/useQueryHisScheduleClinicTime';
import { addBusinessDays } from 'core/utils/date/addBusinessDays';
import { addMinutesToTime, getDateWithTime } from 'core/utils/helpers/times';
import { sortDate } from 'core/utils/sorts/data.sort';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';
import { IScheduleBlock } from './../../../../../../../core/interfaces/api/IScheduleBlock';

export const getIsBlockedTime = (
  getBlockTimeList: {
    from: string;
    to: string;
  }[],
  time: string,
  halfExamMim: number,
  block?: { date?: Date; scheduleBlocks: Record<string, IScheduleBlock[]> },
) => {
  const listTime = getBlockTimeList;

  if (block && block.date) {
    const blockDate =
      block.scheduleBlocks[dayjs(block.date).format('YYYYMMDD')] || [];

    blockDate.forEach((scheduleBlock) => {
      listTime.push({
        from: scheduleBlock.startTime,
        to: scheduleBlock.endTime,
      });
    });
  }

  return !!getBlockTimeList.find(
    ({ from, to }) =>
      getDateWithTime(addMinutesToTime(from, -halfExamMim)) <
        getDateWithTime(time as string) &&
      getDateWithTime(time as string) < getDateWithTime(to),
  );
};

export const useEvaluationStep = ({
  data,
  setData,
  onCloseUnsaved: onClose,
  employee,
  isPendingExams,
  enqueueSnackbar,
  ...rest
}: IUseEditEmployee) => {
  const { setError, getValues, control, reset, setValue, clearErrors } =
    useFormContext();
  const { nextStep, stepCount, goToStep, previousStep } = useWizard();
  const { fetchClinic } = useFetchQueryClinic();

  const isEval = data.examType == ExamHistoryTypeEnum.EVAL;

  const clinicExam = data.examsData.find((x) =>
    isEval ? x.isAvaliation : x.isAttendance,
  );

  const { data: scheduledTimes, isLoading: isLoadingTime } =
    useQueryHisScheduleClinicTime({
      clinicId: clinicExam?.clinic?.id,
      examId: clinicExam?.id,
      date: clinicExam?.doneDate,
    });

  const lastComplementaryDate = data.examsData
    .map((schedule) => {
      if (!isPendingExams && (!schedule.isSelected || schedule.isAttendance))
        return;
      if (!schedule.doneDate) return;
      return dayjs(addBusinessDays(schedule.doneDate, schedule.dueInDays || 0));
    })
    .filter((i) => i)
    .sort((a, b) => sortDate(b, a))[0];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    goToStep(stepCount - 1);
  };

  const examMim = clinicExam?.clinic?.clinicExams?.find(
    (x) => x.examMinDuration,
  )?.examMinDuration;

  const getBlockTimeList = useMemo(() => {
    if (!examMim) return [];

    return scheduledTimes.map((s) => {
      const toTime = addMinutesToTime(s.time, examMim);
      return { from: s.time, to: toTime };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.examsData, scheduledTimes]);

  const onSubmit = async () => {
    let isErrorFound = false;

    clearErrors();
    data.examsData.forEach((data) => {
      if (
        !!data.doneDate &&
        data.isAttendance &&
        (isPendingExams || data.isSelected)
      ) {
        if (!isEval && lastComplementaryDate?.isAfter(dayjs(data.doneDate))) {
          isErrorFound = true;
          enqueueSnackbar(
            'Necessario mudar data do exame clínico para data posterior ao ultimo resultado dos exames complementares',
            {
              variant: 'error',
              autoHideDuration: 3000,
            },
          );
          return;
        }
      }

      if (!data.isAttendance || !data.isSelected) return;
      if (!data.clinic?.id) {
        setError(`clinic_${data.id}`, { message: 'Campo obrigatório' });
        isErrorFound = true;
      }

      if (!data.doneDate) {
        setError(`doneDate_${data.id}`, { message: 'Campo obrigatório' });
        isErrorFound = true;
      }

      if (!data.time) {
        setError(`time_${data.id}`, { message: 'Obrigatório' });
        isErrorFound = true;
      }

      if (data.time) {
        const { blockDateTime } = getBlockDates({ row: data });

        const isBlocked = getIsBlockedTime(
          getBlockTimeList,
          data.time as string,
          (examMim || 0) / 2,
          { date: data.doneDate, scheduleBlocks: blockDateTime },
        );

        if (isBlocked) {
          setError(`time_${data.id}`, { message: 'horário já agendado' });
          isErrorFound = true;
        }

        if (clinicExam) {
          const isNotAvailable = notAvailableScheduleTime(
            data.time as string,
            clinicExam,
          );

          if (isNotAvailable) {
            setError(`time_${data.id}`, { message: 'horário indisponível' });
            isErrorFound = true;
          }
        }
      }
    });

    if (isErrorFound) return;

    const { clinicObs } = getValues();
    setData((data) => ({ ...data, clinicObs }));
    nextStep();
  };

  const setComplementaryExam = async (exam: Partial<IExamsScheduleTable>) => {
    let clinic: ICompany | undefined = undefined;

    if (exam.clinic?.id) {
      const clinicData = await fetchClinic(exam.clinic.id);
      if (clinicData) clinic = clinicData;
    }

    const actualExams = [...data.examsData].map((_data) => {
      if (_data.id === exam.id) {
        const examClinic = clinic?.clinicExams?.find(
          (examClinic) => examClinic.examId == exam.id,
        );

        return {
          ..._data,
          ...exam,
          ...('clinic' in exam && {
            dueInDays: examClinic?.dueInDays,
            scheduleRange: examClinic?.scheduleRange,
            scheduleType: examClinic?.scheduleType,
            clinic: clinic,
          }),
        };
      }

      return _data;
    });

    setData({ ...data, examsData: actualExams });
  };

  return {
    onSubmit,
    control,
    onCloseUnsaved,
    lastStep,
    data,
    setData,
    setValue,
    employee,
    previousStep,
    setComplementaryExam,
    lastComplementaryDate,
    isPendingExams,
    isLoadingTime,
    getBlockTimeList,
    isEval,
    ...rest,
  };
};
