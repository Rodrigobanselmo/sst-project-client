export enum ApiRoutesEnum {
  AUTH_GROUP = '/auth/group/:companyId',
  CEP = '/company/cep',
  CHARACTERIZATIONS = '/company/:companyId/workspace/:workspaceId/characterizations',
  CHARACTERIZATIONS_PHOTO = '/company/:companyId/workspace/:workspaceId/characterizations/photo',
  CHECKLIST = '/checklist',
  CNAES = '/company/cnae',
  CNPJ = '/company/cnpj',
  COMPANIES = '/company',
  COMPANY = '/company/:companyId',
  COMPANY_GROUP = '/company/:companyId/group',
  CONTACTS = '/company/:companyId/contact',
  DATABASE_TABLE = '/files/database-tables',
  DOCUMENTS_PGR = '/documents/pgr',
  DOCUMENTS_PGR_ATTACHMENTS = '/documents/pgr/:docId/attachment',
  DOCUMENTS_PGR_PLAN = '/documents/pgr/action-plan',
  DOWNLOAD_CNAE = '/files/cnae',
  DOWNLOAD_EMPLOYEES = '/files/company/employees/download',
  DOWNLOAD_HIERARCHIES = '/files/company/hierarchies/download',
  DOWNLOAD_UNIQUE_EMPLOYEES = '/files/company/download/unique',
  EMPLOYEES = '/employee',
  EMPLOYEES_DELETE_SUB_OFFICE = '/employee/:employeeId/sub-office/:subOfficeId/:companyId',
  ENVIRONMENTS = '/company/:companyId/workspace/:workspaceId/environments',
  ENVIRONMENTS_PHOTO = '/company/:companyId/workspace/:workspaceId/environments/photo',
  EPI = '/epi',
  GENERATE_SOURCE = '/generate-source',
  GHO = '/homogeneous-groups',
  HIERARCHY = '/hierarchy',
  INVITES = '/invites',
  ME = '/users/me',
  PROFESSIONALS = '/professionals',
  REC_MED = '/rec-med',
  EXAM = '/exam',
  EXAM_RISK = '/exam/risk',
  CLINIC_EXAM = '/clinic-exam',
  RISK = '/risk',
  RISK_DATA = '/risk-data',
  RISK_DATA_REC = '/risk-data-rec',
  RISK_GROUP_DATA = '/risk-group-data',
  RISK_GROUP_DOCS = '/risk-group-data/documents/:riskGroupId/pgr/:companyId',
  SESSION = '/session',
  SESSION_GOOGLE = '/session/google',
  UPLOAD_CNAE = '/files/cnae',
  UPLOAD_EMPLOYEES = '/files/company/employees/upload',
  UPLOAD_HIERARCHY = '/files/company/hierarchies/upload',
  UPLOAD_UNIQUE_EMPLOYEES = '/files/company/upload/unique',
  USERS = '/users',
}
