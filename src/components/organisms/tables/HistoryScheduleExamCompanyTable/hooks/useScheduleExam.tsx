import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import { initialEditEmployeeState } from 'components/organisms/modals/ModalEditEmployee/hooks/useEditEmployee';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';

export const useScheduleExam = () => {
  const { onStackOpenModal } = useModal();

  const onAdd = () => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE);
  };

  const onReSchedule = (data: Partial<IEmployeeExamsHistory>) => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE, {
      examType: data.examType,
      hierarchyId: data.hierarchyId,
      subOfficeId: data.subOfficeId,
      companyId: data?.employee?.companyId,
      employeeId: data?.employee?.id,
    } as Partial<typeof initialExamScheduleState>);
  };

  const onEditEmployee = (employee: IEmployee) => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD, {
      id: employee.id,
      companyId: employee.companyId,
    } as typeof initialEditEmployeeState);
  };

  return { onAdd, onReSchedule, onStackOpenModal, onEditEmployee };
};
