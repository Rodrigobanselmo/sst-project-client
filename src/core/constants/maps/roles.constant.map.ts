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
    permissions: [PermissionEnum.CONTRACTS] as any,
    order: 1000,
  },
  [RoleEnum.COMPANY]: {
    value: RoleEnum.COMPANY,
    label: 'Empresa',
    info: 'Gerenciamento dos principais recursos de sua empresa (cargos, funcionários, profissionais, etc)',
    permissions: [
      PermissionEnum.COMPANY,
      PermissionEnum.EMPLOYEE,
      PermissionEnum.EMPLOYEE_HISTORY,
      PermissionEnum.HOMO_GROUP,
      PermissionEnum.PROFESSIONALS,
      PermissionEnum.PROF_RESP,
    ],
    order: 2,
  },
  [RoleEnum.SECURITY]: {
    value: RoleEnum.SECURITY,
    label: 'Segurança',
    info: 'Gerenciamento de todos os recursos de empresa relacionado a segurança do tranalho (riscos, recomendações, PGR, caracterização dos ambientes, etc)',
    permissions: [
      PermissionEnum.RISK,
      PermissionEnum.GS,
      PermissionEnum.REC_MED,
      PermissionEnum.RISK_DATA,
      PermissionEnum.PGR,
      PermissionEnum.ACTION_PLAN,
      PermissionEnum.CHARACTERIZATION,
    ],
    order: 2,
  },
  [RoleEnum.MEDICINE]: {
    value: RoleEnum.MEDICINE,
    label: 'Medicina',
    info: 'Gerenciamento de todos os recursos de empresa relacionado a medicina do tranalho (exames, clinicas, PCMSO, etc)',
    permissions: [
      PermissionEnum.PCMSO,
      PermissionEnum.EXAM,
      PermissionEnum.EXAM_RISK,
      PermissionEnum.RISK_DATA,
      PermissionEnum.RISK,
    ],
    order: 2,
  },
  [RoleEnum.DOCUMENTS]: {
    value: RoleEnum.DOCUMENTS,
    label: 'Documentos',
    info: 'Gerenciamento dos documentos da empresa (envio de documentos, vencimentos, riscos presentes)',
    permissions: [PermissionEnum.DOCUMENTS, PermissionEnum.RISK_DOC_INFO],
    order: 3,
  },
  [RoleEnum.ABSENTEEISM]: {
    value: RoleEnum.ABSENTEEISM,
    label: 'Absenteísmo',
    info: 'Gerenciamento dos afastamentos e faltas da empresa',
    permissions: [PermissionEnum.ABSENTEEISM],
    order: 3,
  },
  [RoleEnum.CAT]: {
    value: RoleEnum.CAT,
    label: 'CAT (eSocial)',
    info: 'Gerenciamento e envio da CAT (eSocial)',
    permissions: [PermissionEnum.CAT, PermissionEnum.PROFESSIONALS],
    order: 3,
  },
  [RoleEnum.EPI]: {
    value: RoleEnum.EPI,
    label: "EPI's",
    info: "Gerenciamento dos EPI's",
    permissions: [PermissionEnum.EPI],
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
    permissions: [
      PermissionEnum.EXAM,
      PermissionEnum.EXAM_RISK,
      PermissionEnum.PROTOCOL,
    ],
    order: 1000,
  },
  [RoleEnum.SCHEDULE_EXAM]: {
    value: RoleEnum.SCHEDULE_EXAM,
    label: 'Agenda',
    info: 'agendamento de exames para os funcionários',
    permissions: [PermissionEnum.COMPANY_SCHEDULE, PermissionEnum.EXAM] as any,
    order: 1000,
  },
  [RoleEnum.EMPLOYEE]: {
    value: RoleEnum.EMPLOYEE,
    label: 'Funcionários',
    info: 'gerenciamento dos funcionários (lotação e exames)',
    permissions: [
      PermissionEnum.EMPLOYEE,
      PermissionEnum.EMPLOYEE_HISTORY,
    ] as any,
    order: 1000,
  },
  [RoleEnum.CLINICS]: {
    value: RoleEnum.CLINICS,
    label: 'Clínicas',
    info: 'acesso aos recurso das clínicas (prestadores), podendo gerenciar os exames, médicos e dados da clínica',
    permissions: [
      PermissionEnum.COMPANY,
      PermissionEnum.CLINIC,
      PermissionEnum.CLINIC_SCHEDULE,
      PermissionEnum.EMPLOYEE_HISTORY_FILE,
      PermissionEnum.EXAM,
      PermissionEnum.EXAM_CLINIC,
      PermissionEnum.PROFESSIONALS,
    ],
    order: 1000,
  },
  [RoleEnum.ESOCIAL]: {
    value: RoleEnum.ESOCIAL,
    label: 'eSocial',
    info: 'acesso aos recursos do eSocial (geração e envio do XML)',
    permissions: [PermissionEnum.ESOCIAL],
    order: 1000,
  },
  [RoleEnum.NOTIFICATION]: {
    value: RoleEnum.NOTIFICATION,
    label: 'Notificações',
    info: 'Envio de notificações',
    permissions: [] as any,
    order: 1000,
  },
  [RoleEnum.ESOCIAL_EDIT]: {
    value: RoleEnum.ESOCIAL_EDIT,
    label: 'Editar Histórico eSocial',
    info: 'Póssivel editar dados que irão afetar eventos já enviados ao eSocial (Retificação e Exclusão de eventos)',
    permissions: [] as any,
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
