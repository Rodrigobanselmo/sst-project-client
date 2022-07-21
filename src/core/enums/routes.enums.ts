export enum RoutesEnum {
  ONBOARD_NO_TEAM = '/acesso/empresa',
  ONBOARD_USER = '/acesso/usuario',
  ONBOARD = '/acesso',
  LOGIN = '/',
  DASHBOARD = '/dashboard',
  TEAM = '/dashboard/equipe/:companyId',
  PROFILE = '/dashboard/perfil',
  PUBLIC = '/publico',
  CHECKLIST = '/dashboard/checklist',
  COMPANIES = '/dashboard/empresas',
  HIERARCHY = '/dashboard/empresas/:companyId/hierarquia',
  RISK_DATA = '/dashboard/empresas/:companyId/hierarquia?riskGroupId=:riskGroupId',
  DATABASE = '/dashboard/dados',
  MANAGER_SYSTEM = '/dashboard/empresas/:companyId/gestao-sst',
  PGR_DOCUMENT = '/dashboard/empresas/:companyId/documentos/pgr/:riskGroupId',
  DND_TREE_DEMO = '/dashboard/test/dnd-tree',
  MODAL = '/dashboard/test/modal',
  ACTION_PLAN = '/dashboard/empresas/:companyId/:workspaceId/plano-de-acao/:riskGroupId',
  CHARACTERIZATIONS = '/dashboard/empresas/:companyId/:workspaceId',
  EMPLOYEES = '/dashboard/empresas/:companyId/empregados',
}
