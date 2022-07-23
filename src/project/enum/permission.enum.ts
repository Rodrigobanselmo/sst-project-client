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
  EPI = '3',
  MANAGEMENT = '4',
  RISK = '4.0',
  GS = '4.1',
  REC_MED = '4.2',
  RISK_DATA = '4.3',
  PGR = '4.4',
  ACTION_PLAN = '4.4.1',
}
