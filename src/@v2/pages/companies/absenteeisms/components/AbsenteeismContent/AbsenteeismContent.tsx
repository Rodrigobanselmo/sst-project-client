import { useMemo } from 'react';

import { TabUniqueName } from '@v2/components/organisms/STabs/Implementations/STabsUrl/enums/tab-unique-name.enum';
import { STabsParams } from '@v2/components/organisms/STabs/Implementations/STabsUrl/STabsParams';
import { STabOption } from '@v2/components/organisms/STabs/STabs.types';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { ModalAddAbsenteeism } from 'components/organisms/modals/ModalAddAbsenteeism/ModalAddAbsenteeism';
import {
  ModalEditEmployee,
  StackModalEditEmployee,
} from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { AbsenteeismsTable } from 'components/organisms/tables/AbsenteeismTable';
import { PermissionEnum } from 'project/enum/permission.enum';
import { AbsenteeismDashboard } from '../AbsenteeismDashboard/AbsenteeismDashboard';

export const AbsenteeismContent = ({ companyId }: { companyId: string }) => {
  const { isAuthSuccess } = useAuthShow();

  const hasMetricsPermission = isAuthSuccess({
    permissions: [PermissionEnum.ABSENTEEISM_METRICS],
  });

  const tabOptions = useMemo(() => {
    const options: STabOption<string>[] = [
      {
        label: 'Absenteísmo',
        value: 'lista',
        component: <AbsenteeismsTable />,
      },
    ];

    if (hasMetricsPermission) {
      options.push({
        label: 'Metricas',
        value: 'metricas',
        component: <AbsenteeismDashboard companyId={companyId} />,
      });
    }

    return options;
  }, [hasMetricsPermission, companyId]);

  return (
    <>
      {/* -//! remove need to change to new format, refactor users table */}
      <ModalAddAbsenteeism />
      <ModalEditEmployee />
      <StackModalEditEmployee />
      {/* -//! remove */}

      <STabsParams
        paramName={TabUniqueName.ABSENTEEISMS}
        options={tabOptions}
      />
    </>
  );
};
