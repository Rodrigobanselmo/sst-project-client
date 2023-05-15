import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { initialEditEmployeeState } from 'components/organisms/modals/ModalEditEmployee/hooks/useEditEmployee';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { useMutFindExamByHierarchy } from 'core/services/hooks/mutations/checklist/exams/useMutFindExamByHierarchy/useMutUpdateExamRisk';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';
import {
  useFetchQueryHisScheduleExam,
  useQueryHisScheduleExam,
} from 'core/services/hooks/queries/useQueryHisScheduleExam/useQueryHisScheduleExam';
import { queryClient } from 'core/services/queryClient';
import { isShouldDemissionBlock } from 'core/utils/helpers/demissionalBlockCalc';

import { IUseEditEmployee } from '../../../hooks/useEditExamEmployee';

export const useEmployeeStep = ({
  data,
  setData,
  onCloseUnsaved: onClose,
  employee,
  newHierarchy,
  isPendingExams,
  fetchClinic,
  userAllow,
  getIsToBlockDismissal,
  onStackOpenModal,
  skipHierarchySelect,
  company,
  ...rest
}: IUseEditEmployee) => {
  const { trigger, getValues, control, setError, reset, setValue, setFocus } =
    useFormContext();
  const { nextStep, stepCount, goToStep, activeStep } = useWizard();
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
    const isAdmission = data.examType === ExamHistoryTypeEnum.ADMI;
    const isPeriodic = data.examType === ExamHistoryTypeEnum.PERI;

    let jumpCompleteStep = false;

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
            if (isChange) if (!origin.isChange) return false;
            if (isAdmission) if (!origin.isAdmission) return false;
            if (isPeriodic || isOffice) if (!origin.isPeriodic) return false;

            return true;
          });

          if (db_data.exam && origin) {
            const examData = {
              expiredDate: origin?.closeToExpired ? null : origin?.expiredDate,
              isSelected:
                !origin?.expiredDate ||
                new Date() > origin.expiredDate ||
                !!origin?.closeToExpired,
              validityInMonths: origin?.validityInMonths,
            };

            if (isDismissal) {
              examData.isSelected = true;
              examData.expiredDate = null;
            }

            // if (isOffice || isChange) {
            //   if (db_data.exam.isAttendance) {
            //     examData.isSelected = true;
            //     examData.expiredDate = null;
            //   }
            // }

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

        const hasComplementaryExamToAsk = actualExams.some(
          (actualExams) => !actualExams.isAttendance && actualExams.isSelected,
        );

        // add clinic exam if any exam is selected and is not periodic
        {
          const isNOTPeriodicWithComplementary =
            !isPeriodic && hasComplementaryExamToAsk;
          const isPeriodicWithComplementaryAndLastExamIsReturn =
            isPeriodic &&
            hasComplementaryExamToAsk &&
            employee?.lastDoneExam?.examType === ExamHistoryTypeEnum.RETU;

          if (
            isPeriodicWithComplementaryAndLastExamIsReturn ||
            isNOTPeriodicWithComplementary
          ) {
            const clinicExamIndex = actualExams.findIndex(
              (actualExams) => actualExams.isAttendance,
            );

            if (clinicExamIndex != -1) {
              actualExams[clinicExamIndex].isSelected = true;
              actualExams[clinicExamIndex].expiredDate = null;
            }
          }
        }

        if (userAllow) {
          if (!hasComplementaryExamToAsk) jumpCompleteStep = true;
        }

        const hierarchyHistory = employee?.hierarchyHistory?.[0];

        const isActualHierarchyDismissal =
          hierarchyHistory?.motive === EmployeeHierarchyMotiveTypeEnum.DEM;
        const changeHierarchyDate = isActualHierarchyDismissal
          ? hierarchyHistory?.startDate
          : null;

        return {
          ...data,
          ...(isDismissal &&
            changeHierarchyDate && {
              changeHierarchyDate,
            }),
          examsData: actualExams,
        };
      });

    if (jumpCompleteStep) {
      goToStep(activeStep + 2);
    } else nextStep();
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

          const clinicData = await fetchClinic(employeeHistory.clinicId).catch(
            () => null,
          );
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
      setData(newData);
    }

    nextStep();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);
    const [sex, birthday, name, email, phone, rg] = getValues([
      'sex',
      'birthday',
      'name',
      'email',
      'phone',
      'rg',
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

    if (newHierarchy && !skipHierarchySelect) {
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

      await updateEmployee
        .mutateAsync({
          id: employee?.id,
          name,
          sex: sex as any,
          companyId: data.companyId,
          email,
          phone,
          rg,
          ...(data.birthday && { birthday: data.birthday }),
        })
        .catch((err) => {});

      data.isPendingExams ? handleEditPendingSubmit() : handleValidSubmit();
    }
  };

  const handleSelectEmployee = (employee: IEmployee, onClose?: () => void) => {
    employee?.id &&
      setData((old) => ({
        ...old,
        companyId: employee.companyId,
        employeeId: employee.id,
        examType: undefined,
        examsData: [],
      }));

    onClose?.();
  };

  const handleAddEmployee = () => {
    onStackOpenModal<Partial<typeof initialEditEmployeeState>>(
      ModalEnum.EMPLOYEES_ADD,
      {
        onCreate: handleSelectEmployee,
      },
    );
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
    skipHierarchySelect,
    handleSelectEmployee,
    handleAddEmployee,
    ...rest,
    loading:
      rest.loading || updateEmployee.isLoading || findExamsMutation.isLoading,
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
