import {
  CharacterizationEnum,
  mapCharacterization,
} from './characterization.enums';

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
  COMPANY_PGR = '/dashboard/empresas/:companyId/documentos/pgr',
  COMPANY_PGR_DOCUMENT = '/dashboard/empresas/:companyId/documentos/pgr/:docId',
  PGR = '/dashboard/documentos/pgr',
  DND_TREE_DEMO = '/dashboard/test/dnd-tree',
  MODAL = '/dashboard/test/modal',
  CHARACTERIZATIONS = '/dashboard/empresas/:companyId/:workspaceId',
}
