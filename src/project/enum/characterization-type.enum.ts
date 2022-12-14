export enum CharacterizationTypeEnum {
  WORKSTATION = 'WORKSTATION',
  EQUIPMENT = 'EQUIPMENT',
  ACTIVITIES = 'ACTIVITIES',
  SUPPORT = 'SUPPORT',
  OPERATION = 'OPERATION',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  GENERAL = 'GENERAL',
}

export const getIsEnvironment = (type?: CharacterizationTypeEnum) => {
  if (!type) return false;
  return [
    CharacterizationTypeEnum.GENERAL,
    CharacterizationTypeEnum.ADMINISTRATIVE,
    CharacterizationTypeEnum.OPERATION,
    CharacterizationTypeEnum.SUPPORT,
  ].includes(type);
};
