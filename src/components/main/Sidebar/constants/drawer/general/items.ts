import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { IoPeople } from '@react-icons/all-files/io5/IoPeople';
import { MdDashboard } from '@react-icons/all-files/md/MdDashboard';

import SCompany from 'assets/icons/SCompany';
import SDatabaseIcon from 'assets/icons/SDatabaseIcon';

import { RoutesEnum } from '../../../../../../core/enums/routes.enums';

const dashboard = {
  text: 'Home',
  Icon: MdDashboard,
  description: 'HOME',
  id: 'oRH0CjLLpN',
  href: RoutesEnum.DASHBOARD,
  shouldMatchExactHref: true,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const team = {
  text: 'Gerenciar usuários',
  Icon: IoPeople,
  description: 'Download dos dados obtidos em campo utilizando o App SimpleSST',
  id: 'Tu09jfdGCC',
  href: RoutesEnum.TEAM,
};

const checklist = {
  text: 'Checklist',
  Icon: LibraryAddCheckIcon,
  description: 'Criação e edição de checklists para captação de dados de campo',
  id: 'ZjP5CN0qar',
  href: RoutesEnum.CHECKLIST,
};

const importExportData = {
  text: 'Banco de dados',
  Icon: SDatabaseIcon,
  description: 'Criação e edição das tabelas presentes no banco de dados',
  id: 'ZjP5Cs0eap',
  href: RoutesEnum.DATABASE,
};

const allCompaniesData = {
  text: 'Empresas',
  Icon: SCompany,
  description: 'Visualizar suas empresas cadastradas',
  id: 'lfrXaeDx',
  href: RoutesEnum.COMPANIES,
};

export const generalArray = [
  dashboard,
  allCompaniesData,
  checklist,
  importExportData,
];
