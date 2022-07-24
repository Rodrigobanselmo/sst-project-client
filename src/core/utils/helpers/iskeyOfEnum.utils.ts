export const isKeyOfEnum = (key: string, enums: object) => {
  return Object.keys(enums).some((x) => x === key);
};
