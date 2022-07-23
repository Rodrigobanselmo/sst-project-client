import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { MdDashboard } from '@react-icons/all-files/md/MdDashboard';
import { RoleEnum } from 'project/enum/roles.enums';

import SCompany from 'assets/icons/SCompanyIcon';
import SDatabaseIcon from 'assets/icons/SDatabaseIcon';
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
  Icon: SCompany,
  description: 'Visualizar suas empresas cadastradas',
  id: 'lfrXaeDx',
  href: RoutesEnum.COMPANIES,
  roles: [RoleEnum.CONTRACTS],
};

export const generalArray = [
  dashboard,
  profile,
  team,
  allCompaniesData,
  checklist,
  importExportData,
  accessGroups,
];
