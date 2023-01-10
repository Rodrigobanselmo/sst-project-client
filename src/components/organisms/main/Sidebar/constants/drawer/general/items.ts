import { MdDashboard } from 'react-icons/md';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import { SAbsenteeismIcon } from 'assets/icons/SAbsenteeismIcon';
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
import SScheduleBlockIcon from 'assets/icons/SScheduleBlockIcon/SScheduleBlockIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { RoutesEnum } from '../../../../../../../core/enums/routes.enums';
import { IDrawerLinksItems } from '../../types';

const dashboard: IDrawerLinksItems = {
  text: 'Home',
  Icon: MdDashboard,
  description: 'HOME',
  id: 'oRH0CjLLpN',
  href: RoutesEnum.DASHBOARD,
  shouldMatchExactHref: true,
};

const profile: IDrawerLinksItems = {
  text: 'Perfil',
  Icon: SProfileIcon,
  description: 'Perfil de usuário',
  id: 'oRH0CjL234N',
  href: RoutesEnum.PROFILE,
  shouldMatchExactHref: true,
};

const team: IDrawerLinksItems = {
  text: 'Gerenciar usuários',
  Icon: STeamIcon,
  description: 'Gerenciar usuários e suas permirssões de acesso',
  id: 'Tu09jfdGCC',
  href: RoutesEnum.TEAM,
  shouldMatchExactHref: true,
  roles: [RoleEnum.USER],
};

const accessGroups: IDrawerLinksItems = {
  text: 'Grupo de Permissões',
  Icon: SAccessGroupIcon,
  description: 'Criar grupo de permirssões de acesso',
  id: 'Tu29j3dGCC',
  href: RoutesEnum.TEAM_GROUPS,
  roles: [RoleEnum.USER],
  shouldMatchExactHref: true,
};

const companyGroups: IDrawerLinksItems = {
  text: 'Grupo Empresarial',
  Icon: SCompanyGroupIcon,
  description: 'Gerenciamento dos grupos empresariais',
  id: 'Tu29j3dGe32e32CC',
  href: RoutesEnum.COMPANY_GROUP,
  roles: [RoleEnum.COMPANY],
  shouldMatchExactHref: true,
};

const checklist: IDrawerLinksItems = {
  text: 'Checklist',
  Icon: LibraryAddCheckIcon,
  description: 'Criação e edição de checklists para captação de dados de campo',
  id: 'ZjP5CN0qar',
  href: RoutesEnum.CHECKLIST,
  roles: [RoleEnum.CHECKLIST],
};

const importExportData: IDrawerLinksItems = {
  text: 'Banco de dados',
  Icon: SDatabaseIcon,
  description: 'Criação e edição das tabelas presentes no banco de dados',
  id: 'ZjP5Cs0eap',
  href: RoutesEnum.DATABASE,
  roles: [RoleEnum.MASTER],
};

const allCompaniesData: IDrawerLinksItems = {
  text: 'Empresas',
  Icon: SCompanyIcon,
  description: 'Visualizar empresas cadastradas',
  id: 'lfrXaeDx',
  href: RoutesEnum.COMPANIES,
  roles: [RoleEnum.CONTRACTS],
  shouldMatchExactHref: true,
};

const allClinicsData: IDrawerLinksItems = {
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

const oneClinicsData: IDrawerLinksItems = {
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

const companiesData: IDrawerLinksItems = {
  text: 'Empresa',
  Icon: SCompanyIcon,
  description: 'Visualizar sua empresa',
  id: 'lfrXadsdeDx',
  href: RoutesEnum.COMPANY,
  roles: [RoleEnum.COMPANY],
  removeWithRoles: [RoleEnum.CONTRACTS],
  shouldMatchExactHref: true,
};

const professionals: IDrawerLinksItems = {
  text: 'Profissionais',
  Icon: SProfessionalIcon,
  description:
    'Visualizar os profissionais (médiocos, engenheiros, etc) de sua empresa',
  id: 'dqwdwqcewweqqweq',
  href: RoutesEnum.PROFESSIONALS,
  roles: [RoleEnum.COMPANY, RoleEnum.USER],
  shouldMatchExactHref: true,
};

const exams: IDrawerLinksItems = {
  text: 'Exames',
  Icon: SExamIcon,
  description: 'Visualizar os exames médicos cadastrados',
  id: 'wedewvcewrwerewd',
  href: RoutesEnum.EXAMS,
  roles: [RoleEnum.EXAM],
  shouldMatchExactHref: true,
};

const risks: IDrawerLinksItems = {
  text: 'Fatores de Risco',
  Icon: SRiskFactorIcon,
  description: 'Visualizar os riscos cadastrados',
  id: '23f23ivb328vjfdsdsfd',
  href: RoutesEnum.RISKS,
  roles: [RoleEnum.SECURITY],
  shouldMatchExactHref: true,
};

const schedule: IDrawerLinksItems = {
  text: 'Agenda',
  Icon: SCalendarIcon,
  description: 'Visualizar agenda',
  id: 'dewhiuhewwerjkewnriwe',
  href: RoutesEnum.SCHEDULE,
  roles: [RoleEnum.SCHEDULE_EXAM],
  shouldMatchExactHref: true,
};

const esocial: IDrawerLinksItems = {
  text: '',
  image: '/images/esocial-full-logo.png',
  description: 'Gerenciar eventos do eSocial',
  id: 'pmdeiorwnvmoewnvoewewfew',
  href: RoutesEnum.ESOCIAL,
  roles: [RoleEnum.ESOCIAL],
  shouldMatchExactHref: false,
};

const absenteeism: IDrawerLinksItems = {
  text: 'Absenteísmo',
  Icon: SAbsenteeismIcon,
  description: 'Gerenciamento de faltas e afastamentos temporarios',
  id: 'jkbhiuhgcduigbcwkjefhbchiuwe',
  href: RoutesEnum.ABSENTEEISM,
  roles: [RoleEnum.ABSENTEEISM],
  shouldMatchExactHref: false,
};

const cat: IDrawerLinksItems = {
  text: 'CAT',
  imageType: 'cat',
  image: '/images/cat-colored.png',
  // Icon: SAbsenteeismIcon,
  description: 'Emissão CAT',
  id: '1234325gfbfdrgr',
  href: RoutesEnum.CAT,
  roles: [RoleEnum.CAT],
  shouldMatchExactHref: false,
};

const block: IDrawerLinksItems = {
  text: 'Bloqueio de agenda',
  description:
    'Bloquear a agenda de clínicas em caso de feriados ou adversidades',
  Icon: SScheduleBlockIcon,
  id: 'dejkwbcieuwg7wiwhuwe',
  href: RoutesEnum.SCHEDULE_BLOCK,
  roles: [RoleEnum.SCHEDULE_EXAM],
  permissions: [PermissionEnum.SCHEDULE_BLOCK],
  shouldMatchExactHref: false,
};

export const generalArray = [
  dashboard,
  profile,
  team,
  schedule,
  block,
  allCompaniesData,
  companiesData,
  absenteeism,
  checklist,
  importExportData,
  // accessGroups,
  // companyGroups,
  professionals,
  allClinicsData,
  oneClinicsData,
  exams,
  risks,
  cat,
  esocial,
];
