import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import {
  notAvailableScheduleDate,
  notAvailableScheduleTime,
} from 'components/organisms/tables/ExamsScheduleTable/columns/ExamsScheduleClinic';
import { IExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/types';
import dayjs from 'dayjs';
import { StatusEnum } from 'project/enum/status.enum';

import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import {
  ICreateEmployeeExamHistory,
  useMutCreateEmployeeHisExam,
} from 'core/services/hooks/mutations/manager/employee-history-exam/useMutCreateEmployeeHisExam/useMutCreateEmployeeHisExam';
import { useMutUpdateEmployeeHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateEmployeeHisExam/useMutUpdateEmployeeHisExam';
import { useFetchQueryClinic } from 'core/services/hooks/queries/useQueryClinic';
import { queryClient } from 'core/services/queryClient';
import { sortData } from 'core/utils/sorts/data.sort';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';

export const useResumeStep = ({
  data,
  onSubmitData,
  setData,
  onCloseUnsaved: onCloseUnsavedMain,
  employee,
  onClose,
  ...rest
}: IUseEditEmployee) => {
  const { setError, control, reset, setValue, clearErrors } = useFormContext();
  const { nextStep, stepCount, goToStep, previousStep } = useWizard();
  const { fetchClinic } = useFetchQueryClinic();
  const createMutation = useMutCreateEmployeeHisExam();
  const updateMutation = useMutUpdateEmployeeHisExam();

  const onCloseUnsaved = async () => {
    onCloseUnsavedMain(() => reset());
  };

  const lastStep = async () => {
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    const submit = {
      companyId: data.companyId,
      examType: data.examType,
      employeeId: data.employeeId,
      examsData: [] as ICreateEmployeeExamHistory['examsData'],
      changeHierarchyAnyway: data.changeHierarchyAnyway,
      changeHierarchyDate: data.changeHierarchyDate,
      clinicObs: data.clinicObs,
    } as ICreateEmployeeExamHistory;

    data.examsData.forEach(
      ({
        doneDate,
        time,
        time2,
        id,
        clinic,
        validityInMonths,
        scheduleType,
        ...examSchedule
      }) => {
        if (!doneDate) return;
        if (!time) return;
        if (!clinic?.id) return;
        if (!examSchedule.isSelected) return;

        const status =
          scheduleType === ClinicScheduleTypeEnum.ASK
            ? StatusEnum.PENDING
            : StatusEnum.PROCESSING;

        if (examSchedule.isAttendance) {
          submit.examId = id;
          submit.clinicId = clinic?.id;
          submit.doneDate = doneDate;
          submit.time = time2 ? `${time} - ${time2}` : time;
          submit.scheduleType = scheduleType;
          submit.status = status;
          submit.validityInMonths = validityInMonths || 0;
          return;
        }

        submit.examsData?.push({
          examId: id,
          clinicId: clinic?.id,
          doneDate,
          time,
          scheduleType,
          status,
          clinicObs: data.obs,
          validityInMonths,
        });
      },
    );

    await createMutation
      .mutateAsync(submit)
      .then(() => onClose())
      .catch(() => null);
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

  const lastComplementaryDate = data.examsData
    .map((schedule) => {
      if (!schedule.isSelected || schedule.isAttendance) return;
      if (!schedule.doneDate) return;
      return dayjs(schedule.doneDate).add(schedule.dueInDays || 0, 'd');
    })
    .filter((i) => i)
    .sort((a, b) => sortData(a, b))[0];

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
    ...rest,
  };
};
