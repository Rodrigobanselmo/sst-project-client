import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import dayjs from 'dayjs';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { useMutFindExamByHierarchy } from 'core/services/hooks/mutations/checklist/exams/useMutFindExamByHierarchy/useMutUpdateExamRisk';
import {
  useFetchQueryHisScheduleExam,
  useQueryHisScheduleExam,
} from 'core/services/hooks/queries/useQueryHisScheduleExam/useQueryHisScheduleExam';
import { queryClient } from 'core/services/queryClient';
import { isShouldDemissionBlock } from 'core/utils/helpers/demissionalBlockCalc';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';

export const useEmployeeStep = ({
  data,
  onSubmitData,
  setData,
  onCloseUnsaved: onClose,
  employee,
  newHierarchy,
  isPendingExams,
  fetchClinic,
  getClinic,
  ...rest
}: IUseEditEmployee) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
  const { nextStep, stepCount, goToStep } = useWizard();

  const findExamsMutation = useMutFindExamByHierarchy();
  const { fetchHisScheduleExam } = useFetchQueryHisScheduleExam();

  const fields: string[] = ['examType'];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    goToStep(stepCount - 1);
  };

  const handleValidSubmit = async () => {
    const hierarchyId = newHierarchy
      ? data.hierarchy?.id
      : employee?.hierarchyId;

    const company = employee?.company;

    const riskDataHierarchy = await findExamsMutation
      .mutateAsync({
        hierarchyId,
        employeeId: data.employeeId,
        companyId: data.companyId,
        ...(isPendingExams && { isPendingExams: true }),
      })
      .catch(() => null);

    if (riskDataHierarchy?.data)
      setData((data) => {
        const actualExams = [...data.examsData];
        riskDataHierarchy.data.map((db_data) => {
          if (actualExams.find((examData) => examData.id === db_data.exam?.id))
            return;

          const isDismissal = data.examType === ExamHistoryTypeEnum.DEMI;
          const isReturn = data.examType === ExamHistoryTypeEnum.RETU;

          const origin = db_data.origins?.find((origin) => {
            if (origin?.skipEmployee) return false;

            if (isReturn) if (!origin.isReturn) return false;

            if (isDismissal) if (!origin.isDismissal) return false;

            return true;
          });

          if (db_data.exam && origin) {
            const examData = {
              expiredDate: origin?.expiredDate,
              isSelected: !origin?.expiredDate || !!origin?.closeToExpired,
              validityInMonths: origin?.validityInMonths,
            };

            if (isDismissal) {
              examData.isSelected = true;
              examData.expiredDate = null;

              if (
                origin.expiredDate &&
                company &&
                isShouldDemissionBlock(company, {
                  expiredDate: origin.expiredDate,
                  validityInMonths: origin.validityInMonths,
                })
              ) {
                examData.isSelected = false;
              }
            }

            if (isReturn) {
              examData.isSelected = true;
              examData.expiredDate = null;

              const examToExpire = riskDataHierarchy.data.some((origins) => {
                if (origins.exam?.isAttendance) return;

                return origins.origins?.some((origin) => {
                  return (
                    !origin?.skipEmployee &&
                    origin?.isPeriodic &&
                    (!origin?.expiredDate || origin?.closeToExpired)
                  );
                });
              });

              if (examToExpire && db_data?.exam?.isAttendance)
                examData.validityInMonths = 0;
            }

            actualExams.push({
              id: db_data.exam.id,
              name: db_data.exam.name,
              isAttendance: db_data.exam.isAttendance,
              status: StatusEnum.PROCESSING,
              ...examData,
            });
          }
        });

        return { ...data, examsData: actualExams };
      });

    nextStep();
  };

  const handleEditPendingSubmit = async () => {
    const schedulesExams = await fetchHisScheduleExam({
      companyID: data.companyId,
      query: { employeeId: employee?.id || 0, allExams: true },
      take: 100,
    });

    const hierarchy = schedulesExams.data.find(
      (schedules) => schedules.hierarchy,
    )?.hierarchy;

    const obs = schedulesExams.data.find(
      (schedules) => schedules.clinicObs && !schedules?.exam?.isAttendance,
    )?.clinicObs;

    const clinicObs = schedulesExams.data.find(
      (schedules) => schedules.clinicObs && schedules?.exam?.isAttendance,
    )?.clinicObs;

    const getData = async () => {
      const actualExams = [...data.examsData];
      await Promise.all(
        schedulesExams.data.map(async (employeeHistory) => {
          if (
            actualExams.find(
              (examData) => examData.id === employeeHistory.exam?.id,
            )
          )
            return;

          if (!employeeHistory?.exam) return;
          if (!employeeHistory.exam.id) return;
          if (!employeeHistory.exam.name) return;
          if (!employeeHistory.clinicId) return;

          const clinicData = await fetchClinic(employeeHistory.clinicId);
          const examClinic = clinicData?.clinicExams?.find(
            (examClinic) => examClinic.examId == employeeHistory?.exam?.id,
          );

          const isPending =
            employeeHistory.scheduleType == ClinicScheduleTypeEnum.ASK;

          actualExams.push({
            id: employeeHistory.exam.id,
            name: employeeHistory.exam.name,
            isAttendance: employeeHistory.exam.isAttendance,
            status: employeeHistory.status,
            ...(isPending && {
              doneDateAsk: employeeHistory.doneDate,
              timeAsk: employeeHistory.time,
            }),
            ...(!isPending && {
              doneDate: employeeHistory.doneDate,
              time: employeeHistory.time,
            }),
            scheduleId: employeeHistory.id,
            isSelected: employeeHistory.status === StatusEnum.PENDING,
            ...(clinicData && {
              dueInDays: examClinic?.dueInDays,
              scheduleRange: examClinic?.scheduleRange,
              scheduleType: examClinic?.scheduleType,
              clinic: clinicData,
            }),
          });
        }),
      );

      return { ...data, hierarchy, obs, clinicObs, examsData: actualExams };
    };

    if (schedulesExams?.data) {
      const newData = await getData();
      schedulesExams;
      setData(newData);
    }

    nextStep();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (newHierarchy) {
      if (!data.hierarchy?.id) {
        setData({
          ...data,
          errors: { ...data.errors, hierarchy: true },
        });
        return;
      }
    }

    if (isValid) {
      // eslint-disable-next-line no-empty-pattern
      const {} = getValues();
      data.isPendingExams ? handleEditPendingSubmit() : handleValidSubmit();
    }
  };

  useEffect(() => {
    if (!data.examsData.length && employee && isPendingExams)
      handleEditPendingSubmit();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  return {
    onSubmit,
    control,
    onCloseUnsaved,
    lastStep,
    data,
    setData,
    setValue,
    employee,
    newHierarchy,
    isPendingExams,
    ...rest,
  };
};

// ...(data.examType === ExamHistoryTypeEnum.PERI && {
//   isPeriodic: true,
// }),
// ...(data.examType === ExamHistoryTypeEnum.CHAN && { isChange: true }),
// ...(data.examType === ExamHistoryTypeEnum.ADMI && {
//   isAdmission: true,
// }),
// ...(data.examType === ExamHistoryTypeEnum.RETU && { isReturn: true }),
// ...(data.examType === ExamHistoryTypeEnum.DEMI && {
//   isDismissal: true,
// }),
