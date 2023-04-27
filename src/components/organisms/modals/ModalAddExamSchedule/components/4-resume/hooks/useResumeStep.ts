import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { IExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/types';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { RoutesEnum } from 'core/enums/routes.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import {
  ICreateEmployeeExamHistory,
  useMutCreateEmployeeHisExam,
} from 'core/services/hooks/mutations/manager/employee-history-exam/useMutCreateEmployeeHisExam/useMutCreateEmployeeHisExam';
import {
  IUpdateManyScheduleExamHistory,
  useMutUpdateManyScheduleHisExam,
} from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import { useFetchQueryClinic } from 'core/services/hooks/queries/useQueryClinic';
import { sortDate } from 'core/utils/sorts/data.sort';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';

export const useResumeStep = ({
  data,
  setData,
  onCloseUnsaved: onCloseUnsavedMain,
  employee,
  onClose,
  isPendingExams,
  company,
  ...rest
}: IUseEditEmployee) => {
  const { control, reset, setValue, setError, setFocus } = useFormContext();
  const { stepCount, goToStep, previousStep } = useWizard();
  const { fetchClinic } = useFetchQueryClinic();
  const createMutation = useMutCreateEmployeeHisExam();
  const updateManyMutation = useMutUpdateManyScheduleHisExam();
  const { enqueueSnackbar } = useSnackbar();

  const onCloseUnsaved = async () => {
    onCloseUnsavedMain(() => reset());
  };

  const lastStep = async () => {
    goToStep(stepCount - 1);
  };

  const onDownloadGuide = (companyId: string, employeeId: number) => {
    const path = RoutesEnum.PDF_GUIDE.replace(
      ':employeeId',
      String(employeeId),
    ).replace(':companyId', companyId);

    window.open(path, '_blank');
  };

  const submitCreateSchedule = async () => {
    const submit = {
      companyId: data.companyId,
      examType: data.examType,
      employeeId: data.employeeId,
      examsData: [] as ICreateEmployeeExamHistory['examsData'],
      changeHierarchyAnyway: data.changeHierarchyAnyway,
      changeHierarchyDate: data.changeHierarchyDate,
      clinicObs: data.clinicObs,
      hierarchyId: rest.skipHierarchySelect || data?.hierarchy?.id,
      subOfficeId: data?.subOffice?.id,
    } as ICreateEmployeeExamHistory;

    const askDoneDate = [
      ExamHistoryTypeEnum.ADMI,
      ExamHistoryTypeEnum.OFFI,
    ].includes(data.examType as ExamHistoryTypeEnum);

    if (
      askDoneDate &&
      data.changeHierarchyAnyway &&
      !data.changeHierarchyDate
    ) {
      return setError('doneDate', {
        message: 'Campo obrigatório',
      });
    }

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
          scheduleType === ClinicScheduleTypeEnum.ASK && !company?.isConsulting
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

    const noExams = data.examsData.some((data) => data.isSelected);

    const downloadGuide =
      (submit.examsData?.length &&
        submit.examsData.every((exam) => exam.status !== StatusEnum.PENDING)) ||
      (!submit.examsData?.length && submit.status !== StatusEnum.PENDING);

    await createMutation
      .mutateAsync(submit)
      .then(() => {
        if (downloadGuide && noExams)
          onDownloadGuide(submit.companyId, submit.employeeId);
        else {
          if (!noExams)
            enqueueSnackbar(
              'Esperando finalizar pedido de agenda para baixar guia de encaminhamento',
              {
                variant: 'warning',
                autoHideDuration: 5000,
              },
            );
        }

        onClose();
      })
      .catch(() => null);
  };

  const submitUpdateSchedule = async () => {
    const submit = {
      data: [],
      companyId: data.companyId,
    } as IUpdateManyScheduleExamHistory;

    data.examsData.forEach(
      ({
        doneDate,
        scheduleId,
        time,
        id,
        clinic,
        scheduleType,
        ...examSchedule
      }) => {
        if (!doneDate) return;
        if (!employee) return;
        if (!scheduleId) return;
        if (!time) return;
        if (!clinic?.id) return;
        if (!examSchedule.isSelected) return;

        submit.data?.push({
          id: scheduleId,
          employeeId: employee.id,
          examId: id,
          clinicId: clinic?.id,
          doneDate,
          time,
          scheduleType,
          examType: data.examType,
          status: StatusEnum.PROCESSING,
        });
      },
    );
    await updateManyMutation
      .mutateAsync(submit)
      .then(() => onClose())
      .catch(() => null);
  };

  const onSubmit = async () => {
    if (!isPendingExams) submitCreateSchedule();
    if (isPendingExams) submitUpdateSchedule();
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
    .sort((a, b) => sortDate(a, b))[0];

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
