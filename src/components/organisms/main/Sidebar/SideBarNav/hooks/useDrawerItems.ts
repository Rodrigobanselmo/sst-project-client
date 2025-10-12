import { MdDashboard } from 'react-icons/md';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { initialReportSelectState } from 'components/organisms/modals/ModalReportSelect/ModalReportSelect';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import { SAbsenteeismIcon } from 'assets/icons/SAbsenteeismIcon';
import SAccessGroupIcon from 'assets/icons/SAccessGroupIcon';
import { SCalendarIcon } from 'assets/icons/SCalendarIcon';
import SClinicIcon from 'assets/icons/SClinicIcon';
import SCompanyGroupIcon from 'assets/icons/SCompanyGroupIcon';
import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDatabaseIcon from 'assets/icons/SDatabaseIcon';
import { SEmployeeIcon } from 'assets/icons/SEmployeeIcon';
import SExamIcon from 'assets/icons/SExamIcon';
import SProfessionalIcon from 'assets/icons/SProfessionalIcon';
import SProfileIcon from 'assets/icons/SProfileIcon';
import SReportIcon from 'assets/icons/SReportIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';
import SScheduleBlockIcon from 'assets/icons/SScheduleBlockIcon/SScheduleBlockIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { DrawerItemsEnum } from './drawer.enum';
import { PermissionCompanyEnum } from 'project/enum/permissionsCompany';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import { SIconForm } from '@v2/assets/icons/modules/SIconForm/SIconForm';
import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import ListAltIcon from 'assets/icons/SProtocolIcon';

export interface IDrawerBase {
  text: string;
  search?: string;
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  removeWithRoles?: RoleEnum[];
  showIf?: {
    isClinic?: boolean;
    isConsulting?: boolean;
    isCompany?: boolean;
    isDocuments?: boolean;
    isSchedule?: boolean;
    isAbs?: boolean;
    isEsocial?: boolean;
    isCat?: boolean;
    isForms?: boolean;
  };
  hideIf?: {
    isClinic?: boolean;
    isConsulting?: boolean;
    isCompany?: boolean;
    isDocuments?: boolean;
    isSchedule?: boolean;
    isAbs?: boolean;
    isEsocial?: boolean;
    isCat?: boolean;
    isForms?: boolean;
  };
}

export interface IDrawerItems extends IDrawerBase {
  description: string;
  Icon?: any;
  image?: string;
  imageType?: 'cat' | 'esocial';
  href?: string;
  shouldMatchExactHref?: boolean;
  onClick?: () => void;
  items?: IDrawerItems[];
}

export interface IDrawerSection {
  data: IDrawerBase;
  items: IDrawerItems[];
}

type IDrawerItemsMap = Record<DrawerItemsEnum, IDrawerItems>;

export const useDrawerItems = () => {
  const { isMasterAdmin } = usePermissionsAccess();
  const { onAccessFilterBase } = useAccess();
  const { userCompanyId } = useGetCompanyId();
  const { data: company } = useQueryCompany(userCompanyId);
  const { onStackOpenModal } = useModal();

  const items: IDrawerItemsMap = {
    [DrawerItemsEnum.dashboard]: {
      text: isMasterAdmin || company.isConsulting ? 'Home' : 'Plano de ação',
      description: 'HOME',
      Icon: MdDashboard,
      href: RoutesEnum.DASHBOARD,
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.documents]: {
      text: 'Documentos',
      Icon: SDocumentIcon,
      description: 'Documentos',
      href: RoutesEnum.DOCUMENTS,
      shouldMatchExactHref: false,
      roles: [RoleEnum.DOCUMENTS],
    },
    [DrawerItemsEnum.profile]: {
      text: 'Perfil',
      description: 'Perfil de usuário',
      Icon: SProfileIcon,
      href: RoutesEnum.PROFILE,
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.team]: {
      text: 'Gerenciar usuários',
      description: 'Gerenciar usuários e suas permirssões de acesso',
      Icon: STeamIcon,
      href: RoutesEnum.TEAM,
      shouldMatchExactHref: true,
      roles: [RoleEnum.USER],
    },
    [DrawerItemsEnum.accessGroups]: {
      text: 'Grupo de Permissões',
      description: 'Criar grupo de permirssões de acesso',
      Icon: SAccessGroupIcon,
      href: RoutesEnum.TEAM_GROUPS,
      roles: [RoleEnum.USER],
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.companyGroups]: {
      text: 'Grupo Empresarial',
      description: 'Gerenciamento dos grupos empresariais',
      Icon: SCompanyGroupIcon,
      href: RoutesEnum.COMPANY_GROUP,
      roles: [RoleEnum.COMPANY],
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.checklist]: {
      text: 'Checklist',
      description:
        'Criação e edição de checklists para captação de dados de campo',
      Icon: LibraryAddCheckIcon,
      href: RoutesEnum.CHECKLIST,
      roles: [RoleEnum.CHECKLIST],
    },
    [DrawerItemsEnum.importExportData]: {
      text: 'Banco de dados',
      description: 'Criação e edição das tabelas presentes no banco de dados',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.allCompaniesData]: {
      text: 'Empresas',
      description: 'Visualizar empresas cadastradas',
      Icon: SCompanyIcon,
      href: RoutesEnum.COMPANIES,
      roles: [RoleEnum.CONTRACTS],
      shouldMatchExactHref: true,
      showIf: {
        isConsulting: true,
      },
    },
    [DrawerItemsEnum.allClinicsData]: {
      text: 'Clinicas',
      description: 'Visualizar clínicas cadastradas',
      Icon: SClinicIcon,
      href: RoutesEnum.CLINICS,
      roles: [RoleEnum.CLINICS],
      shouldMatchExactHref: true,
      showIf: {
        isConsulting: true,
        isCompany: true,
      },
    },
    [DrawerItemsEnum.oneClinicsData]: {
      text: 'Clinica',
      description: 'Visualizar clínica',
      Icon: SClinicIcon,
      href: RoutesEnum.CLINIC,
      roles: [RoleEnum.CLINICS],
      shouldMatchExactHref: true,
      showIf: {
        isClinic: true,
      },
    },
    [DrawerItemsEnum.companiesData]: {
      text: 'Empresa',
      description: 'Visualizar sua empresa',
      Icon: SCompanyIcon,
      href: RoutesEnum.COMPANY,
      roles: [RoleEnum.COMPANY],
      shouldMatchExactHref: true,
      hideIf: {
        isConsulting: true,
      },
    },
    [DrawerItemsEnum.professionals]: {
      text: 'Profissionais',
      description:
        'Visualizar os profissionais (médiocos, engenheiros, etc) de sua empresa',
      Icon: SProfessionalIcon,
      href: RoutesEnum.PROFESSIONALS,
      roles: [RoleEnum.COMPANY, RoleEnum.USER],
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.exams]: {
      text: 'Exames',
      description: 'Visualizar os exames médicos cadastrados',
      Icon: SExamIcon,
      href: RoutesEnum.EXAMS,
      roles: [RoleEnum.EXAM],
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.risks]: {
      text: 'Fatores de Risco',
      description: 'Visualizar os riscos cadastrados',
      Icon: SRiskFactorIcon,
      href: RoutesEnum.RISKS,
      roles: [RoleEnum.SECURITY],
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.schedule]: {
      text: 'Agenda',
      description: 'Visualizar agenda',
      Icon: SCalendarIcon,
      href: RoutesEnum.SCHEDULE,
      roles: [RoleEnum.SCHEDULE_EXAM],
      shouldMatchExactHref: true,
      showIf: {
        isSchedule: true,
      },
    },
    [DrawerItemsEnum.esocial]: {
      text: 'eSocial',
      image: '/images/esocial-full-logo.png',
      imageType: 'esocial',
      description: 'Gerenciar eventos do eSocial',
      href: RoutesEnum.ESOCIAL,
      roles: [RoleEnum.ESOCIAL],
      shouldMatchExactHref: false,
      showIf: {
        isEsocial: true,
      },
      // text: '',
      // image: '/images/esocial-full-logo.png',
    },
    [DrawerItemsEnum.absenteeism]: {
      text: 'Absenteísmo',
      description: 'Gerenciamento de faltas e afastamentos temporarios',
      Icon: SAbsenteeismIcon,
      href: RoutesEnum.ABSENTEEISM,
      roles: [RoleEnum.ABSENTEEISM],
      shouldMatchExactHref: false,
      showIf: {
        isAbs: true,
      },
    },
    [DrawerItemsEnum.cat]: {
      text: 'CAT',
      imageType: 'cat',
      image: '/images/cat-colored.png',
      description: 'Emissão CAT',
      href: RoutesEnum.CAT,
      roles: [RoleEnum.CAT],
      shouldMatchExactHref: false,
      showIf: {
        isCat: true,
      },
    },
    [DrawerItemsEnum.block]: {
      text: 'Bloqueio de agenda',
      description:
        'Bloquear a agenda de clínicas em caso de feriados ou adversidades',
      Icon: SScheduleBlockIcon,
      href: RoutesEnum.SCHEDULE_BLOCK,
      roles: [RoleEnum.SCHEDULE_EXAM],
      permissions: [PermissionEnum.SCHEDULE_BLOCK],
      shouldMatchExactHref: false,
    },
    [DrawerItemsEnum.report]: {
      text: 'Relatórios',
      description: 'Gerar relatórios ',
      Icon: SReportIcon,
      onClick: () =>
        onStackOpenModal(
          ModalEnum.REPORT_SELECT,
          {} as Partial<typeof initialReportSelectState>,
        ),
      roles: [RoleEnum.COMPANY, RoleEnum.CONTRACTS, RoleEnum.EMPLOYEE],
      shouldMatchExactHref: false,
    },
    [DrawerItemsEnum.employee]: {
      text: 'Funcionários',
      description: 'Visualização de funcionários da empresa',
      Icon: SEmployeeIcon,
      roles: [RoleEnum.COMPANY, RoleEnum.CONTRACTS, RoleEnum.EMPLOYEE],
      permissions: [PermissionEnum.EMPLOYEE],
      shouldMatchExactHref: false,
      hideIf: {
        isConsulting: true,
      },
      href: RoutesEnum.EMPLOYEES,
    },
    [DrawerItemsEnum.registers]: {
      text: 'Cadastro',
      description: 'cadastro de tabelas da empresa',
      roles: [RoleEnum.COMPANY, RoleEnum.CONTRACTS, RoleEnum.EMPLOYEE],
    },
    [DrawerItemsEnum.actions]: {
      text: 'Ações Rápidas',
      description: 'Atalhos para outras funcionalidades',
      roles: [RoleEnum.COMPANY, RoleEnum.CONTRACTS, RoleEnum.EMPLOYEE],
    },

    [DrawerItemsEnum.companyPage]: {
      text: 'Empresa (Antigo)',
      description: 'Visualizar sua empresa',
      Icon: SCompanyIcon,
      href: RoutesEnum.COMPANY_PAGE,
      roles: [RoleEnum.MASTER],
      // roles: [RoleEnum.COMPANY],
      removeWithRoles: [RoleEnum.CONTRACTS],
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.forms]: {
      text: 'Formulários',
      description: 'Gerenciamento de formulários e questionários',
      Icon: ListAltIcon,
      href: PageRoutes.FORMS.FORMS_APPLICATION.LIST.replace(
        '[companyId]',
        ':companyId',
      ).replace('[formTab]', FORM_TAB_ENUM.APPLIED),
      permissions: [PermissionEnum.FORM],
      shouldMatchExactHref: false,
      showIf: {
        isForms: true,
      },
    },
  };

  const onFilterBase = (item: IDrawerBase) => onAccessFilterBase(item, company);

  const onFilterSections = (sections: IDrawerSection[]) => {
    return sections
      .filter((section) => onFilterBase(section.data))
      .map((section) => {
        return {
          ...section,
          items: section.items.filter((item) => onFilterBase(item)),
        };
      });
  };

  const general: IDrawerSection = {
    data: {
      search: 'Geral principal dashboard home',
      text: 'Geral',
      roles: [],
    },
    items: [
      items[DrawerItemsEnum.dashboard],
      items[DrawerItemsEnum.documents],
      items[DrawerItemsEnum.team],
      items[DrawerItemsEnum.schedule],
      items[DrawerItemsEnum.companiesData],
      items[DrawerItemsEnum.companyPage],
      items[DrawerItemsEnum.allCompaniesData],
      items[DrawerItemsEnum.oneClinicsData],
      items[DrawerItemsEnum.allClinicsData],
      items[DrawerItemsEnum.employee],
      items[DrawerItemsEnum.importExportData],
      items[DrawerItemsEnum.forms],
    ],
  };

  const launches: IDrawerSection = {
    data: {
      search: 'Lançamentos',
      text: 'Lançamentos',
      roles: [],
      showIf: {
        isCompany: true,
        isConsulting: true,
      },
    },
    items: [
      items[DrawerItemsEnum.absenteeism],
      items[DrawerItemsEnum.cat],
      items[DrawerItemsEnum.esocial],
    ],
  };

  const snippets: IDrawerSection = {
    data: {
      search: 'Atalhos',
      text: 'Atalhos',
      roles: [],
    },
    items: [
      {
        ...items[DrawerItemsEnum.registers],
        items: [
          items[DrawerItemsEnum.risks],
          items[DrawerItemsEnum.exams],
          items[DrawerItemsEnum.professionals],
        ],
      },
      {
        ...items[DrawerItemsEnum.actions],
        items: [
          items[DrawerItemsEnum.block],
          items[DrawerItemsEnum.report],
          items[DrawerItemsEnum.accessGroups],
          items[DrawerItemsEnum.profile],
        ],
      },
    ],
  };

  return {
    sections: onFilterSections([general, launches, snippets]),
  };
};
