import { TabUniqueName } from '@v2/components/organisms/STabs/Implementations/STabsUrl/enums/tab-unique-name.enum';
import { STabsParams } from '@v2/components/organisms/STabs/Implementations/STabsUrl/STabsParams';
import { ModalAddAbsenteeism } from 'components/organisms/modals/ModalAddAbsenteeism/ModalAddAbsenteeism';
import {
  ModalEditEmployee,
  StackModalEditEmployee,
} from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { AbsenteeismsTable } from 'components/organisms/tables/AbsenteeismTable';
import { AbsenteeismDashboard } from '../AbsenteeismDashboard/AbsenteeismDashboard';

export const AbsenteeismContent = ({ companyId }: { companyId: string }) => {
  return (
    <>
      {/* -//! remove need to change to new format, refactor users table */}
      <ModalAddAbsenteeism />
      <ModalEditEmployee />
      <StackModalEditEmployee />
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
