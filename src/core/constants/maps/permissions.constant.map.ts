/* eslint-disable quotes */
import { PermissionEnum } from 'project/enum/permission.enum';

export interface IPermissionsOption {
  value: PermissionEnum;
  label: string;
  info: string;
  crud?: string[]; // c r u d p
}
interface IPermissionsOptions
  extends Record<PermissionEnum, IPermissionsOption> {}

export const permissionsConstantMap = {
  [PermissionEnum.MASTER]: {
    value: PermissionEnum.MASTER,
    label: 'Master',
    info: 'Acesso complemento a plataforma',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.USER]: {
    value: PermissionEnum.USER,
    label: 'Gerenciamento de usuários',
    info: 'Acesso ao gerenciamento de usuários',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.ACCESS_GROUP]: {
    value: PermissionEnum.ACCESS_GROUP,
    label: 'Grupos de permissões',
    info: 'Acesso ao gerenciamento dos grupos de permissões',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.EPI]: {
    value: PermissionEnum.EPI,
    label: "EPI's",
    info: "Gerenciamento dos EPI's",
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.MANAGEMENT]: {
    value: PermissionEnum.MANAGEMENT,
    label: 'Gerenciamento da empresa',
    info: 'Acesso para visualização de todos os dados vinculados a empresa',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.COMPANY]: {
    value: PermissionEnum.COMPANY,
    label: 'Dados cadastrais da empresa',
    info: 'Acesso aos dados de cadastro da empresa (Não possui acesso a gestão de risco)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.PROFESSIONALS]: {
    value: PermissionEnum.PROFESSIONALS,
    label: 'Gerenciamento dos profissionais',
    info: 'Gerenciamento dos profissionais da empresa (tecnicos, engenheiros, medicos e etc)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.EMPLOYEE]: {
    value: PermissionEnum.EMPLOYEE,
    label: 'Gerenciamento de funcionários',
    info: 'Acesso aos dados de cadastro da funcionário',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.EMPLOYEE_HISTORY]: {
    value: PermissionEnum.EMPLOYEE_HISTORY,
    label: 'Histórico do funcionários',
    info: 'Gerenciamento do historico do funcionário (exames e lotação)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.RISK]: {
    value: PermissionEnum.RISK,
    label: 'Fatores de risco',
    info: 'Gerenciamento dos Fatores de risco e perigos',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.GS]: {
    value: PermissionEnum.GS,
    label: 'Fonte geradora',
    info: 'Gerenciamento das Fontes Geradoras dos riscos',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.REC_MED]: {
    value: PermissionEnum.REC_MED,
    label: 'Recomendações e medidas de controle',
    info: 'Gerenciamento das recomendações e medidas de controle referente aos riscos',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.RISK_DATA]: {
    value: PermissionEnum.RISK_DATA,
    label: 'Gestão de riscos da empresa',
    info: "Poder vincular fatores de risco, fonte geradora, exames e etc aos cargos e GSE's da empresa",
    crud: ['r', 'cu', 'd'],
  },
  [PermissionEnum.PGR]: {
    value: PermissionEnum.PGR,
    label: 'Módulo PGR (Visualizar e gerar novos documentos)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.PCMSO]: {
    value: PermissionEnum.PCMSO,
    label: 'Módulo PCMSO (Visualizar e gerar novos documentos)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.ACTION_PLAN]: {
    value: PermissionEnum.ACTION_PLAN,
    label: 'Plano de ação (PGR)',
    info: 'Somente o gerenciamento do plano de ação da empresa',
    crud: ['r', 'cu'],
  },
  [PermissionEnum.CHARACTERIZATION]: {
    value: PermissionEnum.CHARACTERIZATION,
    label: 'Caracterização básica',
    info: 'Gerenciamento dos ambientes, posto de trabalho, atividades e etc da empresa',
    crud: ['r', 'cu', 'd'],
  },
  [PermissionEnum.EXAM]: {
    value: PermissionEnum.EXAM,
    label: 'Exames',
    info: 'gerenciamento dos exames cadastrados da empresa',
    crud: ['r', 'cu'],
  },
  [PermissionEnum.RISK_DOC_INFO]: {
    value: PermissionEnum.RISK_DOC_INFO,
    label: 'Relevância dos Risco',
    info: 'Pode alterar para qual documentos o risco irá fazer parte',
    crud: ['r', 'cu'],
  },
  [PermissionEnum.EXAM_RISK]: {
    value: PermissionEnum.EXAM_RISK,
    label: 'Exames / Riscos',
    info: 'gerenciamento dos exames padrões cadastrados nos riscos das empresas',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.CLINIC_SCHEDULE]: {
    value: PermissionEnum.CLINIC_SCHEDULE,
    label: 'Controle de Agendamento (Clínica)',
    info: 'gerenciamento de exames pela clínica',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.COMPANY_SCHEDULE]: {
    value: PermissionEnum.COMPANY_SCHEDULE,
    label: 'Agendamento de Exames',
    info: 'Agendamento de exames nas clínicas cadastradas',
    crud: ['c', 'r', 'u', 'd'],
  },
} as IPermissionsOptions;

export const CRUD_LIST = [
  { type: 'r', text: 'Ler' },
  { type: 'c', text: 'Criar' },
  { type: 'u', text: 'Editar' },
  { type: 'cu', text: 'Criar e Editar' },
  { type: 'cud', text: 'Criar, Editar e Remover' },
  { type: 'd', text: 'Remover' },
];
