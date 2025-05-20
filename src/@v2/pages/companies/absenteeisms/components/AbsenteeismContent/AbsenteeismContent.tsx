import { TaskTable } from '@v2/components/organisms/STable/implementation/STaskTable/implementation/TaskTable/TaskTable';
import { TabUniqueName } from '@v2/components/organisms/STabs/Implementations/STabsUrl/enums/tab-unique-name.enum';
import { STabsParams } from '@v2/components/organisms/STabs/Implementations/STabsUrl/STabsParams';
import { ModalAddAbsenteeism } from 'components/organisms/modals/ModalAddAbsenteeism/ModalAddAbsenteeism';
import { ModalEditEmployee } from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { StackModalViewUsers } from 'components/organisms/modals/ModalPdfView/ModalPdfView';
import { AbsenteeismsTable } from 'components/organisms/tables/AbsenteeismTable';
import { AbsenteeismDashboard } from '../AbsenteeismDashboard/AbsenteeismDashboard';

export const AbsenteeismContent = ({ companyId }: { companyId: string }) => {
  return (
    <>
      {/* -//! remove need to change to new format, refactor users table */}
      <ModalAddAbsenteeism />
      <ModalEditEmployee />
      {/* -//! remove */}

      <STabsParams
        paramName={TabUniqueName.ABSENTEEISMS}
        options={[
          {
            label: 'Absenteísmo',
            value: 'lista',
            component: <AbsenteeismsTable />,
          },
          {
            label: 'Metricas',
            value: 'metricas',
            component: <AbsenteeismDashboard companyId={companyId} />,
          },
        ]}
      />
    </>
  );
};
