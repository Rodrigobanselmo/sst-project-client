import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import {
  availableScheduleDate,
  notAvailableScheduleTime,
} from 'components/organisms/tables/ExamsScheduleTable/columns/ExamsScheduleClinic';
import { IExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/types';

import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useFetchQueryClinic } from 'core/services/hooks/queries/useQueryClinic';
import { queryClient } from 'core/services/queryClient';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';

export const useExamsStep = ({
  data,
  setData,
  onCloseUnsaved: onClose,
  employee,
  fetchClinic,
  getClinic,
  ...rest
}: IUseEditEmployee) => {
  const { setError, control, getValues, reset, setValue, clearErrors } =
    useFormContext();
  const { nextStep, stepCount, goToStep, previousStep } = useWizard();

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    let isErrorFound = false;
    clearErrors();
    data.examsData.forEach((data) => {
      if (!data.isSelected || data.isAttendance) return;
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
    });

    if (isErrorFound) return;
    const { obs } = getValues();
    setData((data) => ({ ...data, obs }));
    nextStep();
  };

  const setComplementaryExam = async (exam: Partial<IExamsScheduleTable>) => {
    let clinic: ICompany | undefined = undefined;

    if (exam.clinic?.id) {
      const clinicData = await fetchClinic(exam.clinic.id);
      if (clinicData) clinic = clinicData;
    }

    const actualExams = [...data.examsData].map((_data) => {
      if (_data.isAttendance) return _data;

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

      const examEdited = data.examsData.find((e) => e.id === exam.id);
      if (!examEdited) return _data;

      if (exam.clinic?.id && !clinic) {
        const clinicData = getClinic(examEdited.clinic?.id);
        if (clinicData) clinic = clinicData;
      }

      if (!clinic) return _data;

      Object.entries(exam).forEach(([key, value]) => {
        if (typeof value === 'boolean') return;
        if (key != 'clinic' && _data.clinic?.id !== exam.clinic?.id) return;
        if (exam.isAttendance) return;

        if (!(_data as any)[key]) {
          const examClinic = clinic?.clinicExams?.find(
            (examClinic) => examClinic.examId == _data.id,
          );

          if (examClinic) {
            (_data as any)['dueInDays'] = examClinic?.dueInDays;
            (_data as any)['scheduleRange'] = examClinic?.scheduleRange;
            (_data as any)['scheduleType'] = examClinic?.scheduleType;

            if (key === 'doneDate') {
              const isOk = availableScheduleDate(value as any, {
                scheduleRange: examClinic?.scheduleRange,
              });

              if (isOk) (_data as any)[key] = (exam as any)[key];
            }

            if (key === 'time' && _data.doneDate) {
              const isOk = !notAvailableScheduleTime(value as any, {
                scheduleRange: examClinic?.scheduleRange,
                doneDate: _data.doneDate,
              });

              if (isOk) (_data as any)[key] = (exam as any)[key];
            }

            if (key === 'clinic') {
              (_data as any)[key] = clinic;
            }
          }
        }
      });

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
    ...rest,
  };
};
