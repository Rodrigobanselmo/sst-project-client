export const enumToArray = (enumType: Object, type: 'key' | 'value') => {
  return Object.entries(enumType)
    .filter(([key]) => !~~key && key !== '0')
    .map(([key, value]) => (type === 'key' ? key : String(value)));
};
