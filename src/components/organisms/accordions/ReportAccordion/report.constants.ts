import {
  clinicFilterList,
  examsFilterList,
  FilterFieldEnum,
} from 'components/atoms/STable/components/STableFilter/constants/filter.map';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

export interface IReportJson {
  name: string;
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  reports: {
    roles?: RoleEnum[];
    permissions?: PermissionEnum[];
    name: string;
    ask: FilterFieldEnum[];
  }[];
}

export const reports: IReportJson[] = [
  {
    name: 'Clínicas',
    roles: [],
    permissions: [],
    reports: [
      {
        name: 'Lista de Clínicas',
        ask: clinicFilterList,
      },
      {
        name: 'Exames Clínicas',
        ask: clinicFilterList,
      },
    ],
  },
  {
    name: 'Exames',
    roles: [],
    permissions: [],
    reports: [
      {
        name: 'Exames vencidos',
        ask: examsFilterList,
      },
    ],
  },
];
