export enum ApiRoutesEnum {
  HIERARCHY = '/hierarchy',
  GHO = '/homogeneous-groups',
  EPI = '/epi',
  EMPLOYEES = '/employee',
  COMPANIES = '/company',
  COMPANY = '/company/:companyId',
  CNPJ = '/company/cnpj',
  CEP = '/company/cep',
  DATABASE_TABLE = '/files/database-tables',
  DOWNLOAD_EMPLOYEES = '/files/company/employees/download',
  UPLOAD_EMPLOYEES = '/files/company/employees/upload',
  DOWNLOAD_HIERARCHIES = '/files/company/hierarchies/download',
  UPLOAD_HIERARCHY = '/files/company/hierarchies/upload',
  DOWNLOAD_UNIQUE_EMPLOYEES = '/files/company/download/unique',
  UPLOAD_UNIQUE_EMPLOYEES = '/files/company/upload/unique',
  ME = '/users/me',
  USERS = '/users',
  INVITES = '/invites',
  SESSION = '/session',
  CHECKLIST = '/checklist',
  RISK = '/risk',
  RISK_DATA = '/risk-data',
  RISK_GROUP_DATA = '/risk-group-data',
  RISK_GROUP_DOCS = '/risk-group-data/documents',
  ENVIRONMENTS = '/company/:companyId/workspace/:workspaceId/environments',
  ENVIRONMENTS_PHOTO = '/company/:companyId/workspace/:workspaceId/environments/photo',
  CHARACTERIZATIONS = '/company/:companyId/workspace/:workspaceId/characterizations',
  CHARACTERIZATIONS_PHOTO = '/company/:companyId/workspace/:workspaceId/characterizations/photo',
  REC_MED = '/rec-med',
  GENERATE_SOURCE = '/generate-source',
  DOCUMENTS_PGR = '/documents/pgr',
}
