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
  EPI = '3',
  MANAGEMENT = '4',
  RISK = '4.0',
  GS = '4.1',
  REC_MED = '4.2',
  RISK_DATA = '4.3',
  PGR = '4.4',
  ACTION_PLAN = '4.4.1',
  CLINIC = '5',
  EXAM = '5.1',

  COMPANY = '2',
  CREATE_COMPANY = '2.1',
  CONTRACT = '3',
  EMPLOYEE = '4',
  HOMO_GROUP = '55',
  CREATE_RISK = '10',
}
