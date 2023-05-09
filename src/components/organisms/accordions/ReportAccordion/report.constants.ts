import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import { IFilterIconProps } from 'components/atoms/STable/components/STableFilter/STableFilterIcon/types';
import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';
import { clinicFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/clinicFilterList';
import { expiredExamFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/expiredExamFilterList';
import { doneExamsFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/doneExamsFilterList';
import { complementaryFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/complementaryFilterList';

export interface IReportJson {
  name: string;
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  reports: {
    roles?: RoleEnum[];
    permissions?: PermissionEnum[];
    name: string;
    ask: IFilterIconProps['filters'];
    type: ReportTypeEnum;
  }[];
}

export const reports: IReportJson[] = [
  {
    name: 'Clínicas',
    roles: [RoleEnum.CLINICS],
    permissions: [],
    reports: [
      {
        name: 'Lista de Clínicas',
        ask: clinicFilterList,
        type: ReportTypeEnum.CLINICS,
      },
    ],
  },
  {
    name: 'Exames',
    roles: [RoleEnum.SCHEDULE_EXAM],
    reports: [
      {
        name: 'Exames vencidos',
        ask: expiredExamFilterList,
        type: ReportTypeEnum.EXPIRED_EXAM,
      },
      {
        name: 'Exames a vencer',
        ask: expiredExamFilterList,
        type: ReportTypeEnum.CLOSE_EXPIRED_EXAM,
      },
      {
        name: 'Exames realizados',
        ask: doneExamsFilterList,
        type: ReportTypeEnum.DONE_EXAM,
      },
      {
        name: 'Exames complementares',
        ask: complementaryFilterList,
        type: ReportTypeEnum.COMPLEMENTARY_EXAM,
      },
    ],
  },
];
