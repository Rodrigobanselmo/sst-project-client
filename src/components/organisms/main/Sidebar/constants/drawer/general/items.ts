import { MdDashboard } from 'react-icons/md';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { RoleEnum } from 'project/enum/roles.enums';

import SAccessGroupIcon from 'assets/icons/SAccessGroupIcon';
import { SCalendarIcon } from 'assets/icons/SCalendarIcon';
import SClinicIcon from 'assets/icons/SClinicIcon';
import SCompanyGroupIcon from 'assets/icons/SCompanyGroupIcon';
import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDatabaseIcon from 'assets/icons/SDatabaseIcon';
import SExamIcon from 'assets/icons/SExamIcon';
import SProfessionalIcon from 'assets/icons/SProfessionalIcon';
import SProfileIcon from 'assets/icons/SProfileIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';
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
  Icon: SAccessGroupIcon,
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
  roles: [RoleEnum.COMPANY],
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
  showIf: {
    isConsulting: true,
    isCompany: true,
  },
};

const oneClinicsData = {
  text: 'Clinica',
  Icon: SClinicIcon,
  description: 'Visualizar clínica',
  id: 'lfrXasdfdsfeww3eDx',
  href: RoutesEnum.CLINIC,
  roles: [RoleEnum.CLINICS],
  shouldMatchExactHref: true,
  showIf: {
    isClinic: true,
  },
};

const companiesData = {
  text: 'Empresa',
  Icon: SCompanyIcon,
  description: 'Visualizar sua empresa',
  id: 'lfrXadsdeDx',
  href: RoutesEnum.COMPANY,
  roles: [RoleEnum.COMPANY],
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
  roles: [RoleEnum.COMPANY, RoleEnum.USER],
  shouldMatchExactHref: true,
};

const exams = {
  text: 'Exames',
  Icon: SExamIcon,
  description: 'Visualizar os exames médicos cadastrados',
  id: 'wedewvcewrwerewd',
  href: RoutesEnum.EXAMS,
  roles: [RoleEnum.EXAM],
  shouldMatchExactHref: true,
};

const risks = {
  text: 'Fatores de Risco',
  Icon: SRiskFactorIcon,
  description: 'Visualizar os riscos cadastrados',
  id: '23f23ivb328vjfdsdsfd',
  href: RoutesEnum.RISKS,
  roles: [RoleEnum.SECURITY],
  shouldMatchExactHref: true,
};

const schedule = {
  text: 'Agenda',
  Icon: SCalendarIcon,
  description: 'Visualizar agenda',
  id: 'dewhiuhewwerjkewnriwe',
  href: RoutesEnum.SCHEDULE,
  roles: [RoleEnum.SCHEDULE_EXAM],
  shouldMatchExactHref: true,
};

const esocial = {
  text: '',
  image: '/images/esocial-full-logo.png',
  description: 'Gerenciar eventos do eSocial',
  id: 'pmdeiorwnvmoewnvoewewfew',
  href: RoutesEnum.ESOCIAL,
  // roles: [RoleEnum.ESOCIAL],
  shouldMatchExactHref: false,
};

export const generalArray = [
  dashboard,
  profile,
  team,
  schedule,
  allCompaniesData,
  companiesData,
  checklist,
  importExportData,
  accessGroups,
  companyGroups,
  professionals,
  allClinicsData,
  oneClinicsData,
  exams,
  risks,
  esocial,
];
