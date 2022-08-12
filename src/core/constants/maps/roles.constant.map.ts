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
  [RoleEnum.MANAGEMENT]: {
    value: RoleEnum.MANAGEMENT,
    label: 'Empresa',
    info: 'Gerenciamento de todos os recursos de empresa (empresa, GSE, cargos, exames, riscos, documentos, etc)',
    permissions: [
      PermissionEnum.MANAGEMENT,
      PermissionEnum.RISK,
      PermissionEnum.GS,
      PermissionEnum.REC_MED,
      PermissionEnum.RISK_DATA,
      PermissionEnum.PGR,
      PermissionEnum.ACTION_PLAN,
      PermissionEnum.EPI,
    ],
    order: 2,
  },
  [RoleEnum.EPI]: {
    value: RoleEnum.EPI,
    label: "EPI's",
    info: "Gerenciamento dos EPI's",
    permissions: [PermissionEnum.EPI],
    order: 3,
  },

  // [RoleEnum.CONTRACTS]: {
  //   value: RoleEnum.CONTRACTS,
  //   label: 'Empresas Contratantes',
  //   info: 'manejo de empresas cotratantes (criação e edição de contratos com outras empresas, edição de documentos e etc)',
  //   permissions: [PermissionEnum.MANAGEMENT],
  //   order: 1000,
  // },
  [RoleEnum.DOCS]: {
    value: RoleEnum.DOCS,
    label: 'documentos',
    info: 'gerar novas versões de documentos',
    permissions: [PermissionEnum.MANAGEMENT],
    order: 1000,
  },
  [RoleEnum.DATABASE]: {
    value: RoleEnum.DATABASE,
    label: 'Banco de dados',
    info: 'controle do banco de dados (importação e exportação de dados)',
    // permissions: [PermissionEnum.MANAGEMENT],
    order: 1000,
  },
  [RoleEnum.CLINICS]: {
    value: RoleEnum.CLINICS,
    label: 'Clínicas',
    info: 'acesso aos recursos das clínicas (prestadores)',
    permissions: [PermissionEnum.EXAM, PermissionEnum.CLINIC],
    order: 1000,
  },
} as IRolesOptions;

// [RoleEnum.MANAGEMENT]: {
//   value: RoleEnum.MANAGEMENT,
//   label: 'Sua empresa',
//   info: 'pode ver e editar os dados de sua empresa (adcionar e editar empregados, estabelecimentos, documentos e etc)',
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
