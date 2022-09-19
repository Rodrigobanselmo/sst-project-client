/* eslint-disable quotes */
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

export interface IRolesOption {
  value: RoleEnum;
  label: string;
  info: string;
  permissions?: PermissionEnum[];
  order?: number;
}
interface IRolesOptions extends Record<RoleEnum, IRolesOption> {}

export const rolesConstantMap = {
  [RoleEnum.MASTER]: {
    value: RoleEnum.MASTER,
    label: 'Master',
    info: 'acesso complemento a plataforma',
    permissions: [PermissionEnum.MASTER],
    order: 0,
  },
  [RoleEnum.USER]: {
    value: RoleEnum.USER,
    label: 'Usuários',
    info: 'acesso a todos os recursos de usuário (convites, permissões, etc)',
    permissions: [PermissionEnum.USER, PermissionEnum.ACCESS_GROUP],
    order: 1,
  },
  [RoleEnum.CONTRACTS]: {
    value: RoleEnum.CONTRACTS,
    label: 'Empresas Contratantes',
    info: 'Gerenciamento de empresas cotratantes',
    permissions: [] as any,
    order: 1000,
  },
  [RoleEnum.MANAGEMENT]: {
    value: RoleEnum.MANAGEMENT,
    label: 'Empresa (SST)',
    info: 'Gerenciamento de todos os recursos de empresa (GSE, cargos, exames, riscos, documentos, etc)',
    permissions: [
      PermissionEnum.MANAGEMENT,
      PermissionEnum.COMPANY,
      PermissionEnum.RISK,
      PermissionEnum.GS,
      PermissionEnum.REC_MED,
      PermissionEnum.RISK_DATA,
      PermissionEnum.PGR,
      PermissionEnum.PCMSO,
      PermissionEnum.ACTION_PLAN,
      PermissionEnum.EPI,
      PermissionEnum.CHARACTERIZATION,
      PermissionEnum.EMPLOYEE,
      PermissionEnum.EMPLOYEE_HISTORY,
      PermissionEnum.RISK_DOC_INFO,
    ],
    order: 2,
  },
  [RoleEnum.COMPANY]: {
    value: RoleEnum.COMPANY,
    label: 'Empresa',
    info: 'Gerenciamento dos principais dados de sua empresa (cargos, funcionários, documentos, etc)',
    permissions: [
      PermissionEnum.COMPANY,
      PermissionEnum.PGR,
      PermissionEnum.PCMSO,
      PermissionEnum.ACTION_PLAN,
      PermissionEnum.EPI,
      PermissionEnum.CHARACTERIZATION,
      PermissionEnum.EMPLOYEE,
      PermissionEnum.EMPLOYEE_HISTORY,
    ],
    order: 2,
  },
  [RoleEnum.EPI]: {
    value: RoleEnum.EPI,
    label: "EPI's",
    info: "Gerenciamento dos EPI's",
    permissions: [PermissionEnum.COMPANY, PermissionEnum.EPI],
    order: 3,
  },
  [RoleEnum.ACTION_PLAN]: {
    value: RoleEnum.ACTION_PLAN,
    label: 'Plano de Ação',
    info: 'Somente gerenciamento do Plano de Ação',
    permissions: [PermissionEnum.COMPANY, PermissionEnum.ACTION_PLAN],
    order: 3,
  },
  [RoleEnum.DATABASE]: {
    value: RoleEnum.DATABASE,
    label: 'Banco de dados',
    info: 'controle do banco de dados (importação e exportação de dados)',
    permissions: [] as any,
    order: 1000,
  },
  [RoleEnum.EXAM]: {
    value: RoleEnum.EXAM,
    label: 'Exames',
    info: 'gerenciamento de exames e sua relação aos fatores de risco',
    permissions: [PermissionEnum.EXAM, PermissionEnum.EXAM_RISK],
    order: 1000,
  },

  [RoleEnum.SCHEDULE_EXAM]: {
    value: RoleEnum.SCHEDULE_EXAM,
    label: 'Agenda',
    info: 'agendamento de exames para os funcionários',
    permissions: [
      PermissionEnum.COMPANY_SCHEDULE,
      PermissionEnum.COMPANY,
      PermissionEnum.EMPLOYEE,
      PermissionEnum.EXAM,
    ] as any,
    order: 1000,
  },
  [RoleEnum.CLINICS]: {
    value: RoleEnum.CLINICS,
    label: 'Clínicas',
    info: 'acesso aos recurso das clínicas (prestadores), podendo gerenciar os exames, medicos e dados da clínica',
    permissions: [
      PermissionEnum.COMPANY,
      PermissionEnum.CLINIC_SCHEDULE,
      PermissionEnum.EXAM,
      PermissionEnum.PROFESSIONALS,
    ],
    order: 1000,
  },
} as IRolesOptions;

// [RoleEnum.MANAGEMENT]: {
//   value: RoleEnum.MANAGEMENT,
//   label: 'Sua empresa',
//   info: 'pode ver e editar os dados de sua empresa (adcionar e editar funcionários, estabelecimentos, documentos e etc)',
//   permissions: [PermissionEnum.MANAGEMENT],
//   order: 1000,
// },

// [RoleEnum.CHECKLIST]: {
//   value: RoleEnum.CHECKLIST,
//   label: 'Checklist',
//   info: 'Criação e edição de checklists',
//   permissions: [PermissionEnum.MANAGEMENT],
//   order: 1000,
// },
