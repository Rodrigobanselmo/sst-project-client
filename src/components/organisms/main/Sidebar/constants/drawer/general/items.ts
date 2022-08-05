import { MdDashboard } from 'react-icons/md';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { RoleEnum } from 'project/enum/roles.enums';

import SClinicIcon from 'assets/icons/SClinicIcon';
import SCompanyGroupIcon from 'assets/icons/SCompanyGroupIcon';
import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDatabaseIcon from 'assets/icons/SDatabaseIcon';
import SProfessionalIcon from 'assets/icons/SProfessionalIcon';
import SProfileIcon from 'assets/icons/SProfileIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { RoutesEnum } from '../../../../../../../core/enums/routes.enums';

const dashboard = {
  text: 'Home',
  Icon: MdDashboard,
  description: 'HOME',
  id: 'oRH0CjLLpN',
  href: RoutesEnum.DASHBOARD,
  shouldMatchExactHref: true,
};

const profile = {
  text: 'Perfil',
  Icon: SProfileIcon,
  description: 'Perfil de usuário',
  id: 'oRH0CjL234N',
  href: RoutesEnum.PROFILE,
  shouldMatchExactHref: true,
};

const team = {
  text: 'Gerenciar usuários',
  Icon: STeamIcon,
  description: 'Gerenciar usuários e suas permirssões de acesso',
  id: 'Tu09jfdGCC',
  href: RoutesEnum.TEAM,
  shouldMatchExactHref: true,
  roles: [RoleEnum.USER],
};

const accessGroups = {
  text: 'Grupo de Permissões',
  Icon: STeamIcon,
  description: 'Criar grupo de permirssões de acesso',
  id: 'Tu29j3dGCC',
  href: RoutesEnum.TEAM_GROUPS,
  roles: [RoleEnum.USER],
  shouldMatchExactHref: true,
};

const companyGroups = {
  text: 'Grupo Empresarial',
  Icon: SCompanyGroupIcon,
  description: 'Gerenciamento dos grupos empresariais',
  id: 'Tu29j3dGe32e32CC',
  href: RoutesEnum.COMPANY_GROUP,
  roles: [RoleEnum.MANAGEMENT],
  shouldMatchExactHref: true,
};

const checklist = {
  text: 'Checklist',
  Icon: LibraryAddCheckIcon,
  description: 'Criação e edição de checklists para captação de dados de campo',
  id: 'ZjP5CN0qar',
  href: RoutesEnum.CHECKLIST,
  roles: [RoleEnum.CHECKLIST],
};

const importExportData = {
  text: 'Banco de dados',
  Icon: SDatabaseIcon,
  description: 'Criação e edição das tabelas presentes no banco de dados',
  id: 'ZjP5Cs0eap',
  href: RoutesEnum.DATABASE,
  roles: [RoleEnum.MASTER],
};

const allCompaniesData = {
  text: 'Empresas',
  Icon: SCompanyIcon,
  description: 'Visualizar empresas cadastradas',
  id: 'lfrXaeDx',
  href: RoutesEnum.COMPANIES,
  roles: [RoleEnum.CONTRACTS],
  shouldMatchExactHref: true,
};

const allClinicsData = {
  text: 'Clinicas',
  Icon: SClinicIcon,
  description: 'Visualizar clínicas cadastradas',
  id: 'lfrXa78ew3eDx',
  href: RoutesEnum.CLINICS,
  roles: [RoleEnum.CLINICS],
  shouldMatchExactHref: true,
};

const companiesData = {
  text: 'Empresa',
  Icon: SCompanyIcon,
  description: 'Visualizar sua empresa',
  id: 'lfrXadsdeDx',
  href: RoutesEnum.COMPANY,
  roles: [RoleEnum.MANAGEMENT],
  removeWithRoles: [RoleEnum.CONTRACTS],
  shouldMatchExactHref: true,
};

const professionals = {
  text: 'Profissionais',
  Icon: SProfessionalIcon,
  description:
    'Visualizar os profissionais (médiocos, engenheiros, etc) de sua empresa',
  id: 'dqwdwqcewweqqweq',
  href: RoutesEnum.PROFESSIONALS,
  roles: [RoleEnum.PROFESSIONALS, RoleEnum.USER],
  shouldMatchExactHref: true,
};

export const generalArray = [
  dashboard,
  profile,
  team,
  allCompaniesData,
  companiesData,
  checklist,
  importExportData,
  accessGroups,
  companyGroups,
  professionals,
  allClinicsData,
];
