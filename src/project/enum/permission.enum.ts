// x-c - create
// x-r - read
// x-u - update
// x-d - delete
// x-cr - create/read
// x-crud - all operations

// 1 - users
// 1-crud-A
// 1-crud
// 1-A
// 1

export enum PermissionEnum {
  MASTER = 'master',
  USER = '1',
  ACCESS_GROUP = '1.1',
  PROFESSIONALS = '1.2',
  COMPANY = '2',
  EMPLOYEE = '2.1',
  EMPLOYEE_HISTORY = '2.2',
  COMPANY_SCHEDULE = '2.3',
  EMPLOYEE_HISTORY_FILE = '2.4',
  EPI = '3',
  RISK = '4.0',
  GS = '4.1',
  REC_MED = '4.2',
  RISK_DATA = '4.3',
  PGR = '4.4',
  ACTION_PLAN = '4.5',
  CHARACTERIZATION = '4.6',
  PCMSO = '4.7',
  EXAM_RISK = '4.8',
  EXAM_CLINIC = '4.9',
  CLINIC_SCHEDULE = '5',
  HOMO_GROUP = '6',
  EXAM = '7',
  RISK_DOC_INFO = '8',
  COMPANY_GROUPS = '9',
  DOCUMENTS = '10',
  CONTRACTS = '11',
  CLINIC = '12',
  PROTOCOL = '13',
  ESOCIAL = '14',
  PROF_RESP = '15',
  CAT = '16',
  ABSENTEEISM = '17',
  SCHEDULE_BLOCK = '18',
  ALERT = '19',
}
