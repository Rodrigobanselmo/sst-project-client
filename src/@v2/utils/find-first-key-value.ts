type NestedObject = { [key: string]: any };

export const findFirstNestedKeyValue = (
  obj: NestedObject,
  targetKey: string,
): any | null => {
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      const result = findFirstNestedKeyValue(obj[key], targetKey);
      if (result !== null) {
        return result;
      }
    } else if (key === targetKey) {
      return obj[key];
    }
  }
  return null;
};
