type IQueryParamsValue = string | number | boolean | undefined | object;

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
          str.push(objectToQueryParams(item, `${newPrefix}[${index}]`));
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
