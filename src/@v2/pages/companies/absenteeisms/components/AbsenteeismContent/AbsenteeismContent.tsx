import { TaskTable } from '@v2/components/organisms/STable/implementation/STaskTable/implementation/TaskTable/TaskTable';
import { ModalAddAbsenteeism } from 'components/organisms/modals/ModalAddAbsenteeism/ModalAddAbsenteeism';
import { ModalEditEmployee } from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { StackModalViewUsers } from 'components/organisms/modals/ModalPdfView/ModalPdfView';
import { AbsenteeismsTable } from 'components/organisms/tables/AbsenteeismTable';

export const AbsenteeismContent = ({ companyId }: { companyId: string }) => {
  return (
    <>
      {/* -//! remove need to change to new format, refactor users table */}
      <ModalAddAbsenteeism />
      <ModalEditEmployee />
      {/* -//! remove */}

      <AbsenteeismsTable />
    </>
  );
};
