export enum ApiRoutesEnum {
  ABSENTEEISMS = '/absenteeism/:companyId',
  OS = '/os/:companyId',
  CATS = '/cat/:companyId',
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
  PROFESSIONAL_RESP = '/company/:companyId/professionals-responsible',
  DATABASE_TABLE = '/files/database-tables',
  DOCUMENTS_PGR = '/documents/pgr',
  DOCUMENTS_PCMSO = '/documents/pcmso',
  DOCUMENTS_PGR_ATTACHMENTS = '/documents/pgr/:docId/attachment',
  DOCUMENTS_PCMSO_ATTACHMENTS = '/documents/pcmso/:docId/attachment',
  DOCUMENTS_PGR_PLAN = '/documents/pgr/action-plan',
  DOCUMENT_PCMSO = '/document-pcmso',
  DOCUMENT = '/company/:companyId/document',
  DOC_VERSIONS = '/document-version/:companyId',
  DOWNLOAD_CNAE = '/files/cnae',
  DOWNLOAD_EMPLOYEES = '/files/company/employees/download',
  DOWNLOAD_HIERARCHIES = '/files/company/hierarchies/download',
  DOWNLOAD_UNIQUE_EMPLOYEES = '/files/company/download/unique',
  EMPLOYEES = '/employee',
  EMPLOYEE_HISTORY_HIER = '/employee-history/hierarchy',
  EMPLOYEE_HISTORY_EXAM = '/employee-history/exam',
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
  PROTOCOL = '/protocol',
  PROTOCOL_RISK = '/protocol/risk',
  CLINIC_EXAM = '/clinic-exam',
  RISK = '/risk',
  RISK_DATA = '/risk-data',
  RISK_DATA_REC = '/risk-data-rec',
  RISK_DOC_INFO = '/risk-doc-info',
  RISK_GROUP_DATA = '/risk-group-data',
  SESSION = '/session',
  SESSION_GOOGLE = '/session/google',
  UPLOAD_CNAE = '/files/cnae',
  UPLOAD_EMPLOYEES = '/files/company/employees/upload',
  UPLOAD_HIERARCHY = '/files/company/hierarchies/upload',
  UPLOAD_UNIQUE_EMPLOYEES = '/files/company/upload/unique',
  USERS = '/users',
  PDF_GUIDE = '/documents/pdf/guide',
  PDF_KIT = '/documents/pdf/kit',
  PDF_EVALUATION = '/documents/pdf/prontuario-evaluation',
  PDF_OS = '/documents/pdf/os',
  COMPANY_DASHBOARD = '/company/:companyId/dashboard',
  ESOCIAL_EVENT_2210 = 'esocial/events/2210',
  ESOCIAL_EVENT_2220 = 'esocial/events/2220',
  ESOCIAL_EVENT_2230 = 'esocial/events/2230',
  ESOCIAL_EVENT_2240 = 'esocial/events/2240',
  ESOCIAL_EVENT_ALL = 'esocial/events/all',
  ESOCIAL18TABLES = 'esocial/table-18',
  ESOCIAL20TABLES = 'esocial/table-20',
  ESOCIAL17TABLES = 'esocial/table-17',
  ESOCIAL13TABLES = 'esocial/table-13',
  ESOCIAL1415TABLES = 'esocial/table-14-15',
  ESOCIAL15TABLES = 'esocial/table-15',
  ESOCIAL6TABLES = 'esocial/table-6',
  ESOCIAL24TABLES = 'esocial/table-24',
  CITIES = 'esocial/cities',
  CITIES_ADDRESS_COMPANY = 'esocial/cities-address',
  CID = 'esocial/cid',
  CBO = 'esocial/cbo',
  ABSENTEEISM_MOTIVES = 'esocial/absenteeism-motives',
  SCHEDULE_BLOCKS = 'schedule-block/:companyId',
  // ESOCIAL18TABLES = 'esocial/table-18',
  NOTIFICATION = '/notification',

  // Report
  REPORT_CLINIC = '/files/report/clinic/:companyId',
  REPORT_EXPIRED_EXAM = '/files/report/expired-exam/:companyId',
  REPORT_DONE_EXAM = '/files/report/done-exam/:companyId',
}
