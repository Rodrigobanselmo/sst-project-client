export type AbsenteeismTableColumnId =
  | 'employee'
  | 'company'
  | 'motive'
  | 'date'
  | 'timeAway'
  | 'edit';

/** Alinhado a `AbsenteeismListSortByEnum` na API. */
export type AbsenteeismListSortBy =
  | 'EMPLOYEE_NAME'
  | 'COMPANY_NAME'
  | 'MOTIVE_DESC'
  | 'START_DATE'
  | 'TIME_SPENT';
