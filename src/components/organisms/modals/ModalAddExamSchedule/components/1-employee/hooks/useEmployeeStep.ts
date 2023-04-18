import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import dayjs from 'dayjs';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { IdsEnum } from 'core/enums/ids.enums';
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
import { useSnackbar } from 'notistack';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';

export const useEmployeeStep = ({
  data,
  setData,
  onCloseUnsaved: onClose,
  employee,
  newHierarchy,
  isPendingExams,
  fetchClinic,
  ...rest
}: IUseEditEmployee) => {
  const { trigger, getValues, control, setError, reset, setValue, setFocus } =
    useFormContext();
  const { nextStep, stepCount, goToStep } = useWizard();
  const { enqueueSnackbar } = useSnackbar();
  const updateEmployee = useMutUpdateEmployee();

  const findExamsMutation = useMutFindExamByHierarchy();
  const { fetchHisScheduleExam } = useFetchQueryHisScheduleExam();

  useEffect(() => {
    if (!data.employeeId) {
      const button = document.getElementById(IdsEnum.EMPLOYEE_SELECT_ID);
      button?.click();
    }
  }, [data]);

  const fields: string[] = ['examType'];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    goToStep(stepCount - 1);
  };

  const handleValidSubmit = async () => {
    const hierarchyId = newHierarchy
      ? data.subOffice?.id || data.hierarchy?.id
      : employee?.hierarchyId;

    const company = employee?.company;
    const isDismissal = data.examType === ExamHistoryTypeEnum.DEMI;
    const isReturn = data.examType === ExamHistoryTypeEnum.RETU;
    const isOffice = data.examType === ExamHistoryTypeEnum.OFFI;
    const isChange = data.examType === ExamHistoryTypeEnum.CHAN;
    // const isPeriodic = data.examType === ExamHistoryTypeEnum.PERI;

    const riskDataHierarchy = await findExamsMutation
      .mutateAsync({
        hierarchyId,
        employeeId: data.employeeId,
        companyId: data.companyId,
        ...(isDismissal && { isDismissal: isDismissal }),
        ...(isOffice && { isOffice: isOffice }),
        ...(isPendingExams && { isPendingExams: true }),
      })
      .catch(() => null);

    if (riskDataHierarchy?.data)
      setData((data) => {
        const actualExams = [...data.examsData];
        riskDataHierarchy.data.map((db_data) => {
          if (actualExams.find((examData) => examData.id === db_data.exam?.id))
            return;

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

            if (isOffice || isChange) {
              if (db_data.exam.isAttendance) {
                examData.isSelected = true;
                examData.expiredDate = null;
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

        if (actualExams.some((actualExams) => actualExams.isSelected)) {
          const clinicExamIndex = actualExams.findIndex(
            (actualExams) => actualExams.isAttendance,
          );
          if (clinicExamIndex != -1)
            actualExams[clinicExamIndex].isSelected = true;
          actualExams[clinicExamIndex].expiredDate = null;
        }

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
            isAvaliation: employeeHistory.exam?.isAvaliation,
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
    const [sex, birthday, name, email, phone] = getValues([
      'sex',
      'birthday',
      'name',
      'email',
      'phone',
    ]);

    if (!sex || !birthday) {
      setFocus('sex');
      if (!sex) setError('sex', { message: 'Campo Obrigatório' });
      if (!birthday) setError('birthday', { message: 'Campo Obrigatório' });

      return enqueueSnackbar(
        'Preencha os dados do funcionário para prosseguir',
        {
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
          variant: 'warning',
        },
      );
    }

    if (newHierarchy) {
      if (!data.hierarchy?.id) {
        setData({
          ...data,
          errors: { ...data.errors, hierarchy: true },
        });
        return;
      }
    }

    if (isValid && employee?.id) {
      // eslint-disable-next-line no-empty-pattern
      const {} = getValues();

      await updateEmployee.mutateAsync({
        id: employee?.id,
        name,
        sex: sex as any,
        companyId: data.companyId,
        email,
        phone,
        ...(data.birthday && { birthday: data.birthday }),
      });

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
