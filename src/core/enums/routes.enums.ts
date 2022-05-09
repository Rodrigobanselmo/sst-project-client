export enum RoutesEnum {
  LOGIN = '/',
  DASHBOARD = '/dashboard',
  TEAM = '/dashboard/equipe',
  PROFILE = '/dashboard/perfil',
  PUBLIC = '/publico',
  CHECKLIST = '/dashboard/checklist',
  COMPANIES = '/dashboard/empresas',
  HIERARCHY = '/dashboard/empresas/:companyId/hierarquia',
  RISK_DATA = '/dashboard/empresas/:companyId/hierarquia?riskGroupId=:riskGroupId',
  DATABASE = '/dashboard/dados',
  PGR = '/dashboard/documentos/pgr',

  DND_TREE_DEMO = '/dashboard/test/dnd-tree',
  MODAL = '/dashboard/test/modal',
}
