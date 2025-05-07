import { TaskTable } from '@v2/components/organisms/STable/implementation/STaskTable/implementation/TaskTable/TaskTable';
import { StackModalViewUsers } from 'components/organisms/modals/ModalPdfView/ModalPdfView';

export const TasksContent = ({ companyId }: { companyId: string }) => {
  return (
    <>
      {/* -//! remove need to change to new format, refactor users table */}
      <StackModalViewUsers />
      {/* -//! remove */}

      <TaskTable companyId={companyId} />
    </>
  );
};
