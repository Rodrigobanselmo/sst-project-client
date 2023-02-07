import {
  clinicFilterList,
  doneExamsFilterList,
  expiredExamFilterList,
  FilterFieldEnum,
} from 'components/atoms/STable/components/STableFilter/constants/filter.map';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';

export interface IReportJson {
  name: string;
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  reports: {
    roles?: RoleEnum[];
    permissions?: PermissionEnum[];
    name: string;
    ask: FilterFieldEnum[];
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
    ],
  },
];
