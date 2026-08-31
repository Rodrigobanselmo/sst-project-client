import { MdDashboard } from 'react-icons/md';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { initialReportSelectState } from 'components/organisms/modals/ModalReportSelect/ModalReportSelect';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { useRouter } from 'next/router';

import { SAbsenteeismIcon } from 'assets/icons/SAbsenteeismIcon';
import SAccessGroupIcon from 'assets/icons/SAccessGroupIcon';
import { SActionPlanIcon } from 'assets/icons/SActionPlanIcon';
import { SCalendarIcon } from 'assets/icons/SCalendarIcon';
import SClinicIcon from 'assets/icons/SClinicIcon';
import SCompanyGroupIcon from 'assets/icons/SCompanyGroupIcon';
import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDatabaseIcon from 'assets/icons/SDatabaseIcon';
import { SEmployeeIcon } from 'assets/icons/SEmployeeIcon';
import SExamIcon from 'assets/icons/SExamIcon';
import { SEpiIcon } from 'assets/icons/SEpiIcon';
import SProfessionalIcon from 'assets/icons/SProfessionalIcon';
import SProfileIcon from 'assets/icons/SProfileIcon';
import SReportIcon from 'assets/icons/SReportIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';
import SScheduleBlockIcon from 'assets/icons/SScheduleBlockIcon/SScheduleBlockIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { featureFlags } from '@v2/constants/feature-flags';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL } from 'core/constants/company-primary-navigation.constants';
import { SCharacterizationIcon } from 'assets/icons/SCharacterizationIcon';

import { DrawerItemsEnum } from './drawer.enum';
import { PermissionCompanyEnum } from 'project/enum/permissionsCompany';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import { SIconForm } from '@v2/assets/icons/modules/SIconForm/SIconForm';
import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import ListAltIcon from 'assets/icons/SProtocolIcon';
import type { SidebarSectionId } from 'core/hooks/useSidebarSectionExpansion.util';

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
  /** Prefixo para considerar ativo (independente do href final). */
  activePrefix?: string;
  shouldMatchExactHref?: boolean;
  onClick?: () => void;
  items?: IDrawerItems[];
  /** Quando true, subitens ficam visíveis junto com o pai (sem toggle próprio). */
  alwaysShowSubItems?: boolean;
}

export interface IDrawerSection {
  data: IDrawerBase & {
    /**
     * Quando true, a seção é renderizada sem título (ex.: Perfil isolado).
     * Standalone não participa do mecanismo de expansão persistente.
     */
    standalone?: boolean;
    /**
     * Chave estável da seção principal (persistência de expansão).
     * Ausente em itens isolados (ex.: Perfil).
     */
    id?: SidebarSectionId;
  };
  items: IDrawerItems[];
}

type IDrawerItemsMap = Record<DrawerItemsEnum, IDrawerItems>;

export const useDrawerItems = () => {
  const { isMasterAdmin } = usePermissionsAccess();
  const { onAccessFilterBase } = useAccess();
  const { userCompanyId } = useGetCompanyId();
  const { data: company } = useQueryCompany(userCompanyId);
  const { onStackOpenModal } = useModal();
  const { query } = useRouter();
  const hasActiveCompanyInRoute = !!query.companyId;

  const items: IDrawerItemsMap = {
    [DrawerItemsEnum.dashboard]: {
      text: 'Empresas',
      description: 'Listagem/seleção de empresas',
      Icon: MdDashboard,
      href: RoutesEnum.COMPANIES,
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.documents]: {
      text: 'Acervo Técnico',
      Icon: SDocumentIcon,
      description: 'Documentos arquivados, versionados e controle de vencimento',
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
      text: 'Gerenciar Usuários',
      description: 'Gerenciar usuários e suas permissões de acesso',
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
      text: 'Bibliotecas e Curadoria',
      description:
        'Bibliotecas, bases técnicas e curadoria do catálogo SimpleSST (MASTER)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.catalogEquivalences]: {
      text: 'Equivalências de Catálogo',
      description:
        'Consolidação de fontes geradoras e recomendações duplicadas ou equivalentes',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_CATALOG_EQUIVALENCES,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.frpsExplainabilityLibrary]: {
      text: 'Explicabilidade FRPS',
      description:
        'Biblioteca de conhecimento conceitual das fontes e recomendações do catálogo system',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_FRPS_EXPLAINABILITY_LIBRARY,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.biologicalIndicatorsGroup]: {
      text: 'Indicadores Biológicos',
      description: 'Tabelas de indicadores biológicos por fonte normativa',
      Icon: SDatabaseIcon,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.systemStandardsGroup]: {
      text: 'Risco × Exame',
      description:
        'Padrão SimpleSST de indicação de exames a partir dos fatores de risco',
      Icon: SDatabaseIcon,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.curationBasesGroup]: {
      text: 'Bases de curadoria',
      description:
        'Fontes técnicas ou oficiais que servem como matéria-prima para os padrões',
      Icon: SDatabaseIcon,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.eligibilityAnalysisGroup]: {
      text: 'Análises de elegibilidade',
      description:
        'Telas que comparam fontes e ajudam a decidir o que vira padrão SimpleSST',
      Icon: SDatabaseIcon,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.biologicalIndicators]: {
      text: 'NR-7 — Indicadores biológicos',
      description:
        'Base normativa brasileira de indicadores biológicos (fonte de curadoria)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_BIOLOGICAL_INDICATORS,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.esocialTable27]: {
      text: 'Tabela 27 eSocial',
      description:
        'Consulta dos procedimentos diagnósticos da Tabela 27 do eSocial',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_ESOCIAL_TABLE_27,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.examRiskRules]: {
      text: 'Biblioteca do Sistema',
      description:
        'Padrão SimpleSST de indicação de exames a partir dos fatores de risco (MASTER)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_EXAM_RISK_RULES,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.riskSubTypeCuration]: {
      text: 'Subtipos de risco',
      description:
        'Curadoria de subtipos do catálogo global e aplicação em massa (MASTER)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_RISK_SUB_TYPE_CURATION,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.esocialProcedures]: {
      text: 'eSocial T-27 — Procedimentos curados',
      description:
        'Curadoria SimpleSST sobre procedimentos da Tabela 27 do eSocial (MASTER)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_ESOCIAL_PROCEDURES,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.acgihBeiIndicators]: {
      text: 'ACGIH/BEI — Indicadores biológicos',
      description:
        'Base técnica de referência ACGIH/BEI de indicadores biológicos (MASTER)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_ACGIH_BEI_INDICATORS,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.acgihBeiComparison]: {
      text: 'ACGIH/BEI × NR-7 × Biblioteca',
      description:
        'Análise diagnóstica (read-only) entre ACGIH/BEI, NR-7 e a Biblioteca Risco × Exame (MASTER)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_ACGIH_BEI_COMPARISON,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.acgihBeiPromotionPreview]: {
      text: 'ACGIH/BEI — Promoção (preview)',
      description:
        'Preview somente leitura dos candidatos ACGIH/BEI que poderiam virar indicador oficial (MASTER)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_ACGIH_BEI_PROMOTION_PREVIEW,
      roles: [RoleEnum.MASTER],
    },
    [DrawerItemsEnum.acgihBeiRiskCorrelation]: {
      text: 'ACGIH/BEI — Correlação com Fatores de Risco',
      description:
        'Preview somente leitura da correlação entre ACGIH/BEI e os Fatores de Risco do sistema (MASTER)',
      Icon: SDatabaseIcon,
      href: RoutesEnum.DATABASE_ACGIH_BEI_RISK_CORRELATION,
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
      text: 'Clínicas',
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
      text: 'Clínica',
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
      text: 'Dados da empresa',
      description: 'Cadastro e configurações da empresa',
      Icon: SCompanyIcon,
      href: RoutesEnum.COMPANY_EDIT,
      roles: [RoleEnum.COMPANY],
      shouldMatchExactHref: false,
      hideIf: {
        isConsulting: true,
      },
    },
    [DrawerItemsEnum.companyHome]: {
      /**
       * Pai-link da Gestão da Empresa. Navega para `/novo/empresa`.
       * O ativo do grupo é calculado pelos matchers específicos dos filhos
       * (sem prefixo largo `/novo`). Sempre visível na sidebar expandida.
       */
      text: 'Home',
      description: 'Home operacional da empresa',
      Icon: MdDashboard,
      href: RoutesEnum.COMPANY_EDIT,
      roles: [],
      shouldMatchExactHref: false,
      alwaysShowSubItems: true,
    },
    [DrawerItemsEnum.companyManagementCompanyData]: {
      text: 'Dados da Empresa',
      description: 'Cadastro, estabelecimentos, permissões e configurações',
      Icon: SCompanyIcon,
      href: RoutesEnum.COMPANY_EDIT,
      activePrefix: RoutesEnum.COMPANY_EDIT,
      roles: [],
      shouldMatchExactHref: false,
    },
    [DrawerItemsEnum.companyManagementEmployees]: {
      text: 'Funcionários',
      description: 'Gestão de funcionários da empresa',
      Icon: SEmployeeIcon,
      href: RoutesEnum.COMPANY_EMPLOYEE,
      activePrefix: RoutesEnum.COMPANY_EMPLOYEE,
      roles: [],
      shouldMatchExactHref: false,
    },
    [DrawerItemsEnum.companyManagementCharacterization]: {
      text: 'Caracterização',
      description:
        'Riscos, elementos caracterizados, exames, protocolos e vínculos',
      Icon: SCharacterizationIcon,
      href: RoutesEnum.COMPANY_SST,
      activePrefix: RoutesEnum.COMPANY_SST,
      roles: [],
      shouldMatchExactHref: false,
    },
    [DrawerItemsEnum.companyManagementDocuments]: {
      text: 'Programas e Laudos',
      description: 'PGR, PCMSO, Periculosidade, Insalubridade, LTCAT e FRPS',
      Icon: SDocumentIcon,
      href: RoutesEnum.COMPANY_DOCUMENTS,
      activePrefix: RoutesEnum.COMPANY_DOCUMENTS,
      roles: [RoleEnum.DOCUMENTS],
      shouldMatchExactHref: false,
      showIf: {
        isDocuments: true,
      },
    },
    [DrawerItemsEnum.actionPlan]: {
      text: 'Plano de Ação',
      description: 'Gerenciamento do Plano de Ação (PGR)',
      Icon: SActionPlanIcon,
      href: RoutesEnum.ACTION_PLAN,
      permissions: [PermissionEnum.ACTION_PLAN],
      shouldMatchExactHref: false,
      showIf: {
        isCompany: true,
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
    [DrawerItemsEnum.episAndCa]: {
      text: 'EPI e CA',
      description:
        'Consulta da base de EPIs e Certificados de Aprovação (CAEPI/MTE)',
      Icon: SEpiIcon,
      href: RoutesEnum.EPIS_AND_CA,
      roles: [RoleEnum.SECURITY, RoleEnum.COMPANY, RoleEnum.EPI],
      shouldMatchExactHref: true,
    },
    [DrawerItemsEnum.risks]: {
      text: 'Fatores de Risco',
      description: 'Visualizar os riscos cadastrados',
      Icon: SRiskFactorIcon,
      href: RoutesEnum.RISKS,
      activePrefix: RoutesEnum.RISKS,
      roles: [RoleEnum.SECURITY],
      shouldMatchExactHref: false,
    },
    [DrawerItemsEnum.hoMethodsGroup]: {
      text: 'Métodos de HO',
      description: 'Cadastro técnico de métodos de Higiene Ocupacional.',
      Icon: ScienceOutlinedIcon,
      roles: [RoleEnum.SECURITY],
    },
    [DrawerItemsEnum.hoMethods]: {
      text: 'Químicos',
      description: 'Métodos de amostragem e análise para agentes químicos.',
      href: RoutesEnum.HO_METHODS,
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
      text: 'Bloqueio de Agenda',
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
      description: 'Gerar relatórios administrativos',
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
      // Legado /empregados — não entra mais na sidebar (canônico: Gestão → Funcionários).
      text: 'Funcionários (legado)',
      description: 'Rota legada /empregados — não renderizada na sidebar',
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
      // Grupo antigo sob Atalhos — seção Cadastros Técnicos substitui.
      text: 'Cadastro',
      description: 'Grupo legado (não renderizado como seção)',
      roles: [RoleEnum.COMPANY, RoleEnum.CONTRACTS, RoleEnum.EMPLOYEE],
    },
    [DrawerItemsEnum.actions]: {
      // Grupo antigo sob Atalhos — Administração / Perfil substituem.
      text: 'Ações Rápidas',
      description: 'Grupo legado (não renderizado como seção)',
      roles: [RoleEnum.COMPANY, RoleEnum.CONTRACTS, RoleEnum.EMPLOYEE],
    },

    [DrawerItemsEnum.companyPage]: {
      text: 'Empresa (Antigo)',
      description: 'Tela legada (não é a Home principal)',
      Icon: SCompanyIcon,
      href: RoutesEnum.COMPANY_PAGE,
      roles: [RoleEnum.MASTER],
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

  /** Filtra a árvore recursivamente; remove pais sem filhos e sem ação própria. */
  const filterItemsRecursive = (drawerItems: IDrawerItems[]): IDrawerItems[] => {
    return drawerItems.reduce<IDrawerItems[]>((acc, item) => {
      if (!onFilterBase(item)) return acc;

      const children = item.items
        ? filterItemsRecursive(item.items)
        : undefined;

      if (item.items) {
        const hasOwnAction = Boolean(item.href || item.onClick);
        if ((!children || children.length === 0) && !hasOwnAction) {
          return acc;
        }
        acc.push({ ...item, items: children });
        return acc;
      }

      acc.push(item);
      return acc;
    }, []);
  };

  const onFilterSections = (sections: IDrawerSection[]) => {
    return sections
      .filter((section) => onFilterBase(section.data))
      .map((section) => ({
        ...section,
        items: filterItemsRecursive(section.items),
      }))
      .filter((section) => section.items.length > 0);
  };

  /** Árvore MASTER de bibliotecas/curadoria (antes sob Geral → Banco de dados). */
  const librariesTree: IDrawerItems[] = [
    items[DrawerItemsEnum.catalogEquivalences],
    items[DrawerItemsEnum.frpsExplainabilityLibrary],
    ...(featureFlags.examRiskRuleLibrary
      ? [
          {
            ...items[DrawerItemsEnum.systemStandardsGroup],
            items: [
              items[DrawerItemsEnum.examRiskRules],
              ...(featureFlags.riskSubTypeCuration
                ? [items[DrawerItemsEnum.riskSubTypeCuration]]
                : []),
            ],
          },
        ]
      : featureFlags.riskSubTypeCuration
        ? [
            {
              ...items[DrawerItemsEnum.systemStandardsGroup],
              items: [items[DrawerItemsEnum.riskSubTypeCuration]],
            },
          ]
        : []),
    {
      ...items[DrawerItemsEnum.curationBasesGroup],
      items: [
        items[DrawerItemsEnum.biologicalIndicators],
        ...(featureFlags.acgihBeiIndicators
          ? [items[DrawerItemsEnum.acgihBeiIndicators]]
          : []),
        ...(featureFlags.esocialProcedureCuration
          ? [items[DrawerItemsEnum.esocialProcedures]]
          : []),
      ],
    },
    ...(featureFlags.acgihBeiComparison ||
    featureFlags.acgihBeiPromotionPreview ||
    featureFlags.acgihBeiRiskCorrelation
      ? [
          {
            ...items[DrawerItemsEnum.eligibilityAnalysisGroup],
            items: [
              ...(featureFlags.acgihBeiComparison
                ? [items[DrawerItemsEnum.acgihBeiComparison]]
                : []),
              ...(featureFlags.acgihBeiPromotionPreview
                ? [items[DrawerItemsEnum.acgihBeiPromotionPreview]]
                : []),
              ...(featureFlags.acgihBeiRiskCorrelation
                ? [items[DrawerItemsEnum.acgihBeiRiskCorrelation]]
                : []),
            ],
          },
        ]
      : []),
  ];

  const general: IDrawerSection = {
    data: {
      id: 'general',
      search: 'Geral principal dashboard home empresas agenda clinicas',
      text: 'Geral',
      roles: [],
    },
    items: [
      // Empresas permanece em Geral só onde já se aplica (MASTER/consultoria).
      ...(isMasterAdmin || company.isConsulting
        ? [items[DrawerItemsEnum.dashboard]]
        : []),
      items[DrawerItemsEnum.schedule],
      items[DrawerItemsEnum.oneClinicsData],
      items[DrawerItemsEnum.allClinicsData],
    ],
  };

  const companyManagement: IDrawerSection = {
    data: {
      id: 'companyManagement',
      search:
        'Gestão da Empresa dados funcionários caracterização programas acervo',
      text: COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL,
      roles: [],
      showIf: {
        isCompany: true,
        isConsulting: true,
      },
    },
    // MASTER/consultoria sem empresa na rota: não exibe links com companyId ambíguo.
    items:
      (isMasterAdmin || company.isConsulting) && !hasActiveCompanyInRoute
        ? []
        : [
            {
              ...items[DrawerItemsEnum.companyHome],
              items: [
                items[DrawerItemsEnum.companyManagementCompanyData],
                items[DrawerItemsEnum.companyManagementEmployees],
                items[DrawerItemsEnum.companyManagementCharacterization],
                items[DrawerItemsEnum.companyManagementDocuments],
                items[DrawerItemsEnum.documents],
              ],
            },
          ],
  };

  const operations: IDrawerSection = {
    data: {
      id: 'operations',
      search: 'Operações formulários plano ação absenteísmo cat esocial',
      text: 'Operações',
      roles: [],
      showIf: {
        isCompany: true,
        isConsulting: true,
      },
    },
    items: [
      items[DrawerItemsEnum.forms],
      items[DrawerItemsEnum.actionPlan],
      items[DrawerItemsEnum.absenteeism],
      items[DrawerItemsEnum.cat],
      items[DrawerItemsEnum.esocial],
    ],
  };

  const technicalRegisters: IDrawerSection = {
    data: {
      id: 'technicalRegistrations',
      search:
        'Cadastros Técnicos fatores risco métodos higiene exames epi profissionais',
      text: 'Cadastros Técnicos',
      roles: [],
    },
    items: [
      items[DrawerItemsEnum.risks],
      {
        ...items[DrawerItemsEnum.hoMethodsGroup],
        items: [items[DrawerItemsEnum.hoMethods]],
      },
      items[DrawerItemsEnum.exams],
      items[DrawerItemsEnum.episAndCa],
      items[DrawerItemsEnum.professionals],
    ],
  };

  const librariesAndCuration: IDrawerSection = {
    data: {
      id: 'librariesAndCuration',
      search: 'Bibliotecas Curadoria banco dados MASTER',
      text: 'Bibliotecas e Curadoria',
      roles: [RoleEnum.MASTER],
    },
    items: librariesTree,
  };

  const administration: IDrawerSection = {
    data: {
      id: 'administration',
      search:
        'Administração usuários permissões bloqueio agenda relatórios',
      text: 'Administração',
      roles: [],
    },
    items: [
      items[DrawerItemsEnum.team],
      items[DrawerItemsEnum.accessGroups],
      items[DrawerItemsEnum.block],
      items[DrawerItemsEnum.report],
    ],
  };

  /** Perfil isolado — sem título de seção expansível. */
  const profile: IDrawerSection = {
    data: {
      search: 'Perfil usuário',
      text: 'Perfil',
      standalone: true,
      roles: [],
    },
    items: [items[DrawerItemsEnum.profile]],
  };

  return {
    sections: onFilterSections([
      general,
      companyManagement,
      operations,
      technicalRegisters,
      librariesAndCuration,
      administration,
      profile,
    ]),
  };
};
