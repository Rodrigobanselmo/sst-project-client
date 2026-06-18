export type DocTableColumnId =
  | 'name'
  | 'description'
  | 'workspace'
  | 'family'
  | 'version'
  | 'created'
  | 'status'
  | 'actions';

export type DocTableSortBy =
  | 'NAME'
  | 'DESCRIPTION'
  | 'WORKSPACE'
  | 'FAMILY'
  | 'VERSION'
  | 'CREATED'
  | 'STATUS';

export type DocTableFamilyFilter = 'all' | 'test' | 'official';
