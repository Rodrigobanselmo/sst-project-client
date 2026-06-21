export enum UserAccessScopeEnum {
  SINGLE = 'SINGLE',
  ALL_GROUP = 'ALL_GROUP',
  SELECTED = 'SELECTED',
}

export const userAccessScopeLabels: Record<UserAccessScopeEnum, string> = {
  [UserAccessScopeEnum.SINGLE]: 'Apenas esta empresa',
  [UserAccessScopeEnum.ALL_GROUP]: 'Todas as empresas do grupo',
  [UserAccessScopeEnum.SELECTED]: 'Selecionar empresas do grupo',
};
