type IQueryParamsValue = string | number | boolean | null | undefined | object;

export type IObjectToQueryParamsProps = Record<
  string,
  IQueryParamsValue | IQueryParamsValue[]
>;

export function objectToQueryParams(
  obj: IObjectToQueryParamsProps,
  prefix = '',
) {
  const str: string[] = [];

  for (const key in obj) {
    if (key in obj) {
      const value = obj[key];
      const newPrefix = prefix ? `${prefix}[${key}]` : key;

      if (typeof value === 'object' && !Array.isArray(value)) {
        str.push(objectToQueryParams(value as any, newPrefix));
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            str.push(objectToQueryParams(item, `${newPrefix}[${index}]`));
          } else {
            str.push(
              `${encodeURIComponent(
                `${newPrefix}[${index}]`,
              )}=${encodeURIComponent(item)}`,
            );
          }
        });
      } else if (value !== undefined) {
        str.push(
          `${encodeURIComponent(newPrefix)}=${encodeURIComponent(value)}`,
        );
      }
    }
  }

  return str.join('&');
}
