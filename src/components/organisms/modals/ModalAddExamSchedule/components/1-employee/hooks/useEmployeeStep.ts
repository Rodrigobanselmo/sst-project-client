import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import dayjs from 'dayjs';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutFindExamByHierarchy } from 'core/services/hooks/mutations/checklist/exams/useMutFindExamByHierarchy/useMutUpdateExamRisk';
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
  ...rest
}: IUseEditEmployee) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
  const { nextStep, stepCount, goToStep } = useWizard();

  const findExamsMutation = useMutFindExamByHierarchy();

  const fields: string[] = ['examType'];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (newHierarchy) {
      if (!data.sector?.id) {
        setData({
          ...data,
          errors: { ...data.errors, sector: true, hierarchy: true },
        });
        return;
      }
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

      const hierarchyId = newHierarchy
        ? data.hierarchy?.id
        : employee?.hierarchyId;

      const company = employee?.company;

      const riskDataHierarchy = await findExamsMutation
        .mutateAsync({
          hierarchyId,
          employeeId: data.employeeId,
          companyId: data.companyId,
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
        })
        .catch(() => null);

      if (riskDataHierarchy?.data)
        setData((data) => {
          const actualExams = [...data.examsData];
          riskDataHierarchy.data.map((db_data) => {
            if (
              actualExams.find((examData) => examData.id === db_data.exam?.id)
            )
              return;

            const isDismissal = data.examType === ExamHistoryTypeEnum.DEMI;
            const isReturn = data.examType === ExamHistoryTypeEnum.RETU;

            const origin = db_data.origins?.find((origin) => {
              if (origin?.skipEmployee) return false;

              if (isReturn) {
                if (!origin.isReturn) return false;
              }

              if (isDismissal) {
                if (!origin.isDismissal) return false;
              }

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
    }
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
    newHierarchy,
    ...rest,
  };
};
