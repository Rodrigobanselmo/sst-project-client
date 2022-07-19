import { RoleEnum } from 'project/enum/roles.enums';

export interface IRolesOption {
  value: RoleEnum;
  label: string;
  info: string;
}
const map = new Map<RoleEnum, IRolesOption>();

const newRoleMap = () => {
  map.set(RoleEnum.MASTER, {
    value: RoleEnum.MASTER,
    label: 'Master',
    info: 'acesso complemento a plataforma',
  });

  map.set(RoleEnum.USER, {
    value: RoleEnum.USER,
    label: 'Gerenciamento de usuários',
    info: 'acesso a todos os recursos de usuário (convidar novos usuários, editar permissões, remover usuários, etc)',
  });

  map.set(RoleEnum.CONTRACTS, {
    value: RoleEnum.CONTRACTS,
    label: 'Empresas contratantes',
    info: 'manejo de empresas cotratantes (criação e edição de contratos com outras empresas, edição de documentos e etc)',
  });

  map.set(RoleEnum.DATABASE, {
    value: RoleEnum.DATABASE,
    label: 'Impotação e exportação de dados do sistema',
    info: 'controle do banco de dados (importação de dados, exportação de dados e etc)',
  });

  map.set(RoleEnum.DOCS, {
    value: RoleEnum.DOCS,
    label: 'Versionamento de documentos',
    info: 'gerar novas versões de documentos',
  });

  map.set(RoleEnum.MANAGEMENT, {
    value: RoleEnum.MANAGEMENT,
    label: 'Sua empresa',
    info: 'pode ver e editar os dados de sua empresa (adcionar e editar empregados, estabelecimentos, documentos e etc)',
  });

  map.set(RoleEnum.RISK, {
    value: RoleEnum.RISK,
    label: 'Fatores de risco',
    info: 'adicionar e editar fatores de risco',
  });

  map.set(RoleEnum.CHECKLIST, {
    value: RoleEnum.CHECKLIST,
    label: 'Checklist',
    info: 'Criação e edição de checklists',
  });
  return map;
};

export const rolesConstantMap = newRoleMap();
