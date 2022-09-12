import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { useMutFindExamByHierarchy } from 'core/services/hooks/mutations/checklist/exams/useMutFindExamByHierarchy/useMutUpdateExamRisk';

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

      const riskDataHierarchy = await findExamsMutation
        .mutateAsync({
          hierarchyId,
          employeeId: data.employeeId,
          companyId: data.companyId,
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

            const origin = db_data.origins?.find(
              (origin) => !origin?.skipEmployee,
            );

            if (db_data.exam && origin)
              actualExams.push({
                id: db_data.exam.id,
                name: db_data.exam.name,
                isAttendance: db_data.exam.isAttendance,
                status: StatusEnum.PROCESSING,
                validityInMonths: origin?.validityInMonths,
                expiredDate: origin?.expiredDate,
                isSelected: !origin?.expiredDate || !!origin?.closeToExpired,
              });
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
