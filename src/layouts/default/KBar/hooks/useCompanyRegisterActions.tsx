import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';
import {
  Action,
  createAction as kbarCreateAction,
  useRegisterActions,
} from 'kbar';
import { useRouter } from 'next/router';
import { concatKeywords, keywords } from '../constants/keywords.constant';
import { useModal } from 'core/hooks/useModal';
import { ModalEnum } from 'core/enums/modal.enums';
import { useEmployeeActions } from 'core/hooks/actions-push/useEmployeeActions';
import { useCompanyActions } from 'core/hooks/actions-push/useCompanyActions';
import { RoutesEnum } from 'core/enums/routes.enums';
import { ISAuthShow } from 'components/molecules/SAuthShow/types';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useUserActions } from 'core/hooks/actions-push/useUserActions';
import { useGhoActions } from 'core/hooks/actions-push/useGhoActions';
import { useCharacterizationActions } from 'core/hooks/actions-push/useCharacterizationActions';
import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { SCompanyIcon } from 'assets/icons/SCompanyIcon';
import { SEmployeeIcon } from 'assets/icons/SEmployeeIcon';
import { SHierarchyIcon } from 'assets/icons/SHierarchyIcon';
import STeamIcon from 'assets/icons/STeamIcon';
import { useTheme } from '@emotion/react';
import { SGhoIcon } from 'assets/icons/SGhoIcon';
import { SCharacterizationIcon } from 'assets/icons/SCharacterizationIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';
import { useRiskActions } from 'core/hooks/actions-push/useRiskActions';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

export type IKBarActionsProps = Action & {
  authProps?: ISAuthShow;
};

export const useCompanyRegisterActions = () => {
  const history = useRouter();
  const { data: company } = useQueryCompany();
  const companyName = getCompanyName(company);
  const { onStackOpenModal } = useModal();
  const theme = useTheme();

  const { onAddEmployee, onImportEmployee, onEditEmployee } =
    useEmployeeActions();

  const { onViewUser } = useUserActions();
  const { onViewGho } = useGhoActions();
  const { onViewCharacterization } = useCharacterizationActions();
  const { onOpenRiskModal, onViewRisk, onViewCompanyRisks } = useRiskActions();

  const {
    onAddCompany,
    onEditApplyServiceCompany,
    onEditCompany,
    onAddWorspace,
    onEditWorspace,
    onSelectCompany,
  } = useCompanyActions();

  const createAction = ({
    authProps,
    ...props
  }: Omit<IKBarActionsProps, 'id'>) => ({
    ...kbarCreateAction(props),
    authProps,
  });

  const employeeActions: IKBarActionsProps[] = [
    {
      id: 'employee',
      section: 'Empresa',
      name: 'Funcionários',
      icon: <SEmployeeIcon sx={{ color: 'gray.500' }} />,
      keywords: concatKeywords([keywords.company.employee]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
      },
    },
    createAction({
      section: 'Funcionários',
      name: 'Visualizar',
      parent: 'employee',
      keywords: concatKeywords([
        keywords.commom.view,
        keywords.company.employee,
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
      },
      perform: () =>
        history.push({
          pathname: RoutesEnum.EMPLOYEES.replace(':companyId', company.id),
        }),
    }),
    createAction({
      section: 'Funcionários',
      name: 'Adicionar',
      parent: 'employee',
      keywords: concatKeywords([
        keywords.commom.add,
        keywords.company.employee,
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
        cruds: 'c',
      },
      perform: () => onAddEmployee({ shouldPush: true }),
    }),
    createAction({
      section: 'Funcionários',
      name: 'Adicionar por planilha',
      subtitle: 'Adicionar novos funcionário por planilha',
      parent: 'employee',
      keywords: concatKeywords([
        keywords.commom.add,
        keywords.company.employee,
        keywords.commom.import,
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
        cruds: 'cu',
      },
      perform: () => onImportEmployee({ shouldPush: true }),
    }),
    createAction({
      section: 'Funcionários',
      name: 'Editar',
      parent: 'employee',
      keywords: concatKeywords([
        keywords.commom.edit,
        keywords.company.employee,
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
        cruds: 'u',
      },
      perform: () => onEditEmployee(),
    }),
  ];

  const companyActions: IKBarActionsProps[] = [
    {
      id: 'company',
      name: 'Empresa',
      section: 'Empresa',
      icon: <SCompanyIcon sx={{ color: 'gray.500' }} />,
      keywords: concatKeywords([keywords.company.company]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.COMPANY],
      },
    },
    createAction({
      name: 'Adicionar empresa',
      section: 'Empresa',
      subtitle: 'Adicionar uma nova empresa',
      keywords: concatKeywords([keywords.commom.add, keywords.company.company]),
      perform: () => onAddCompany({ shouldPush: true }),
      parent: 'company',
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.COMPANY],
        cruds: 'c',
      },
    }),
    createAction({
      name: 'Selecionar outra empresa',
      section: 'Empresa',
      keywords: concatKeywords([
        keywords.commom.view,
        keywords.company.company,
      ]),
      perform: () => onSelectCompany(),
      parent: 'company',
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.COMPANY],
      },
    }),
    createAction({
      name: 'Editar dados da empresa',
      section: companyName,
      keywords: concatKeywords([
        keywords.commom.edit,
        keywords.company.company,
      ]),
      perform: () => onEditCompany(),
      parent: 'company',
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.COMPANY],
        cruds: 'u',
      },
    }),
    createAction({
      name: 'Editar quais empresas tem acesso',
      section: companyName,
      parent: 'company',
      keywords: concatKeywords([
        keywords.commom.edit,
        keywords.company.company,
        'acesso gerencia quem tem consultoria',
      ]),
      perform: () => onEditApplyServiceCompany({ shouldPush: true }),
      authProps: {
        permissions: [PermissionEnum.MASTER],
        cruds: 'u',
      },
    }),
    createAction({
      name: 'Adicionar estabelecimentos',
      section: companyName,
      parent: 'company',
      keywords: concatKeywords([
        keywords.commom.add,
        keywords.company.workspace,
      ]),
      perform: () => onAddWorspace(),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.COMPANY],
        cruds: 'c',
      },
    }),
    createAction({
      name: 'Editar estabelecimentos',
      section: companyName,
      parent: 'company',
      keywords: concatKeywords([
        keywords.commom.edit,
        keywords.company.workspace,
      ]),
      perform: () => onEditWorspace(),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.COMPANY],
        cruds: 'u',
      },
    }),
  ];

  const hierarchyActions: IKBarActionsProps[] = [
    {
      id: 'hierarchy',
      section: 'Empresa',
      name: 'Cargos e setores',
      icon: <SHierarchyIcon sx={{ color: 'gray.500' }} />,
      keywords: concatKeywords([keywords.company.hierarchy]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
      },
    },
    createAction({
      section: 'Cargos e setores',
      name: 'Visualizar',
      parent: 'hierarchy',
      keywords: concatKeywords([
        keywords.commom.view,
        keywords.company.hierarchy,
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
      },
      perform: () =>
        history.push({
          pathname: RoutesEnum.HIERARCHY.replace(':companyId', company.id),
        }),
    }),
    createAction({
      section: 'Cargos e setores',
      name: 'Adicionar',
      parent: 'hierarchy',
      keywords: concatKeywords([
        keywords.commom.add,
        keywords.company.hierarchy,
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
        cruds: 'c',
      },
      perform: () =>
        history.push({
          pathname: RoutesEnum.HIERARCHY.replace(':companyId', company.id),
        }),
    }),
    // createAction({
    //   section: 'Cargos e setores',
    //   name: 'Adicionar por planilha',
    //   parent: 'hierarchy',
    //   keywords: concatKeywords([
    //     keywords.commom.add,
    //     keywords.company.hierarchy,
    //     keywords.commom.import,
    //   ]),
    //   authProps: {
    //     permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
    //     cruds: 'cu',
    //   },
    //   perform: async () => {
    //     await history.push({
    //       pathname: RoutesEnum.HIERARCHY.replace(':companyId', company.id),
    //     });
    //   },
    // }),
    createAction({
      section: 'Cargos e setores',
      name: 'Editar',
      parent: 'hierarchy',
      keywords: concatKeywords([
        keywords.commom.edit,
        keywords.company.hierarchy,
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.EMPLOYEE],
        cruds: 'u',
      },
      perform: () =>
        history.push({
          pathname: RoutesEnum.HIERARCHY.replace(':companyId', company.id),
        }),
    }),
  ];

  const userActions: IKBarActionsProps[] = [
    {
      id: 'users',
      section: 'Empresa',
      name: 'Usuários',
      icon: <STeamIcon color={theme.palette.gray[500]} fontSize={22} />,
      keywords: concatKeywords([keywords.company.user]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.USER],
      },
    },
    createAction({
      section: 'Usuários',
      name: 'Visualizar',
      parent: 'users',
      keywords: concatKeywords([keywords.commom.view, keywords.company.user]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.USER],
      },
      perform: onViewUser,
    }),
    createAction({
      section: 'Usuários',
      name: 'Adicionar',
      parent: 'users',
      keywords: concatKeywords([keywords.commom.add, keywords.company.user]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.USER],
        cruds: 'c',
      },
      perform: onViewUser,
    }),
    createAction({
      section: 'Usuários',
      name: 'Editar',
      parent: 'users',
      keywords: concatKeywords([keywords.commom.edit, keywords.company.user]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.USER],
        cruds: 'u',
      },
      perform: onViewUser,
    }),
  ];

  const gseActions: IKBarActionsProps[] = [
    {
      id: 'gse',
      section: 'Empresa',
      name: 'Grupos similares de exposição',
      icon: <SGhoIcon sx={{ color: 'gray.500' }} />,
      keywords: concatKeywords([keywords.company.gse]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.USER],
      },
    },
    createAction({
      section: 'Grupos similares de exposição',
      name: 'Visualizar',
      parent: 'gse',
      keywords: concatKeywords([keywords.commom.view, keywords.company.gse]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.USER],
      },
      perform: () => onViewGho(),
    }),
    createAction({
      section: 'Grupos similares de exposição',
      name: 'Adicionar',
      parent: 'gse',
      keywords: concatKeywords([keywords.commom.add, keywords.company.gse]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.USER],
        cruds: 'c',
      },
      perform: () => onViewGho(),
    }),
    createAction({
      section: 'Grupos similares de exposição',
      name: 'Editar',
      parent: 'gse',
      keywords: concatKeywords([keywords.commom.edit, keywords.company.gse]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.USER],
        cruds: 'u',
      },
      perform: () => onViewGho(),
    }),
  ];

  const characterizationActions: IKBarActionsProps[] = [
    {
      id: 'characterization',
      section: 'Empresa',
      name: 'Caracterizações',
      icon: <SCharacterizationIcon sx={{ color: 'gray.500' }} />,
      keywords: concatKeywords([keywords.company.characterizationAll]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
      },
    },
    createAction({
      section: 'Ambientes',
      name: 'Visualizar ambientes',
      parent: 'characterization',
      keywords: concatKeywords([
        keywords.commom.view,
        keywords.commom.edit,
        keywords.company.characterization,
        'ambientes',
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
      },
      perform: () => onViewCharacterization({}),
    }),
    createAction({
      section: 'Ambientes',
      name: 'Adicionar ambientes',
      parent: 'characterization',
      keywords: concatKeywords([
        keywords.commom.add,
        keywords.company.characterization,
        'ambientes',
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
        cruds: 'c',
      },
      perform: () => onViewCharacterization({}),
    }),

    createAction({
      section: 'Posto de trabalho',
      name: 'Visualizar posto de trabalho',
      parent: 'characterization',
      keywords: concatKeywords([
        keywords.commom.edit,
        keywords.commom.view,
        keywords.company.characterization,
        'postos de trabalhos',
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
      },
      perform: () =>
        onViewCharacterization({ type: CharacterizationEnum.WORKSTATION }),
    }),
    createAction({
      section: 'Posto de trabalho',
      name: 'Adicionar posto de trabalho',
      parent: 'characterization',
      keywords: concatKeywords([
        keywords.commom.add,
        keywords.company.characterization,
        'postos de trabalhos',
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
        cruds: 'c',
      },
      perform: () =>
        onViewCharacterization({ type: CharacterizationEnum.WORKSTATION }),
    }),

    createAction({
      section: 'Atividade',
      name: 'Visualizar atividade',
      parent: 'characterization',
      keywords: concatKeywords([
        keywords.commom.edit,
        keywords.commom.view,
        keywords.company.characterization,
        'atividades',
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
      },
      perform: () =>
        onViewCharacterization({ type: CharacterizationEnum.ACTIVITIES }),
    }),
    createAction({
      section: 'Atividade',
      name: 'Adicionar atividade',
      parent: 'characterization',
      keywords: concatKeywords([
        keywords.commom.add,
        keywords.company.characterization,
        'atividades',
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
        cruds: 'c',
      },
      perform: () =>
        onViewCharacterization({ type: CharacterizationEnum.ACTIVITIES }),
    }),

    createAction({
      section: 'Equipamento',
      name: 'Visualizar equipamento',
      parent: 'characterization',
      keywords: concatKeywords([
        keywords.commom.edit,
        keywords.commom.view,
        keywords.company.characterization,
        'equipamentos',
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
      },
      perform: () =>
        onViewCharacterization({ type: CharacterizationEnum.EQUIPMENT }),
    }),
    createAction({
      section: 'Equipamento',
      name: 'Adicionar equipamento',
      parent: 'characterization',
      keywords: concatKeywords([
        keywords.commom.add,
        keywords.company.characterization,
        'equipamentos',
      ]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.CHARACTERIZATION],
        cruds: 'c',
      },
      perform: () =>
        onViewCharacterization({ type: CharacterizationEnum.EQUIPMENT }),
    }),
  ];

  const riskActions: IKBarActionsProps[] = [
    {
      id: 'riskFactor',
      section: 'Empresa',
      name: 'Fatores de risco',
      icon: <SRiskFactorIcon sx={{ color: 'gray.500' }} />,
      keywords: concatKeywords([keywords.company.gse]),
      authProps: {
        permissions: [
          PermissionEnum.MASTER,
          PermissionEnum.RISK,
          PermissionEnum.RISK_DATA,
        ],
      },
    },
    createAction({
      section: 'Fatores de risco',
      name: 'Criar novo',
      parent: 'riskFactor',
      keywords: concatKeywords([keywords.commom.add, keywords.company.risk]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.RISK],
      },
      perform: () => onViewRisk(),
    }),
    createAction({
      section: 'Fatores de risco',
      name: 'Todos os riscos vinculados',
      parent: 'riskFactor',
      keywords: concatKeywords([keywords.commom.add, keywords.company.risk]),
      authProps: {
        permissions: [PermissionEnum.MASTER, PermissionEnum.RISK],
      },
      perform: () => onViewCompanyRisks(),
    }),
    ...[
      {
        name: 'Vincular por cargos e setores',
        key: keywords.company.hierarchy,
        viewsDataInit: ViewsDataEnum.HIERARCHY,
      },
      {
        name: 'Vincular por cargo desenvolvido',
        key: 'cargos desenvolvidos pelo funcionarios',
        viewsDataInit: ViewsDataEnum.HIERARCHY,
        addByEmployee: true,
      },
      {
        name: 'Vincular por funcionários',
        key: keywords.company.employee,
        viewsDataInit: ViewsDataEnum.HIERARCHY,
        addByEmployee: true,
      },
      {
        name: 'Vincular por ambientes',
        key: 'ambientes',
        viewsDataInit: ViewsDataEnum.ENVIRONMENT,
      },
      {
        name: 'Vincular por posto de trabalho',
        key: 'postos de trabalhos',
        viewsDataInit: ViewsDataEnum.CHARACTERIZATION,
      },
      {
        name: 'Vincular por atividades',
        key: 'atividades',
        viewsDataInit: ViewsDataEnum.CHARACTERIZATION,
      },
      {
        name: 'Vincular por equipamentos',
        key: 'equipamentos',
        viewsDataInit: ViewsDataEnum.CHARACTERIZATION,
      },
      {
        name: 'Vincular por grupos similares de exposição',
        key: keywords.company.gse,
        viewsDataInit: ViewsDataEnum.GSE,
      },
    ].map(({ viewsDataInit, name, addByEmployee, key }) =>
      createAction({
        section: 'Fatores de risco',
        name,
        parent: 'riskFactor',
        keywords: concatKeywords([
          keywords.commom.coonnect,
          keywords.commom.add,
          keywords.company.risk,
          key,
          'por',
        ]),
        authProps: {
          permissions: [PermissionEnum.MASTER, PermissionEnum.RISK_DATA],
          cruds: 'cu',
        },
        perform: () =>
          onOpenRiskModal({ viewsDataInit, resetSearch: true, addByEmployee }),
      }),
    ),
  ];

  useRegisterActions(
    [
      ...companyActions,
      ...employeeActions,
      ...hierarchyActions,
      ...userActions,
      ...riskActions,
      ...characterizationActions,
      ...gseActions,
    ],
    [company],
  );
};
