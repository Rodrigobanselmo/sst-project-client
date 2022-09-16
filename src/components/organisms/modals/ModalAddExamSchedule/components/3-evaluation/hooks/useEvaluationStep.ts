import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import {
  notAvailableScheduleDate,
  notAvailableScheduleTime,
} from 'components/organisms/tables/ExamsScheduleTable/columns/ExamsScheduleClinic';
import { IExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/types';
import dayjs from 'dayjs';

import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useFetchQueryClinic } from 'core/services/hooks/queries/useQueryClinic';
import { queryClient } from 'core/services/queryClient';
import { sortData } from 'core/utils/sorts/data.sort';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';

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

  const lastComplementaryDate = data.examsData
    .map((schedule) => {
      if (!schedule.isSelected || schedule.isAttendance) return;
      if (!schedule.doneDate) return;
      return dayjs(schedule.doneDate).add(schedule.dueInDays || 0, 'd');
    })
    .filter((i) => i)
    .sort((a, b) => sortData(b, a))[0];

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
      if (
        !!data.doneDate &&
        data.isAttendance &&
        (isPendingExams || data.isSelected)
      ) {
        if (lastComplementaryDate?.isAfter(dayjs(data.doneDate))) {
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
    ...rest,
  };
};
