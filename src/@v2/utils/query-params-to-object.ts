type IQueryParamsValue = string | object;

export type IQueryParamsToObjectProps = Record<
  string,
  IQueryParamsValue | IQueryParamsValue[]
>;

export function queryParamsToObject(
  queryString: string,
): IQueryParamsToObjectProps {
  const params = new URLSearchParams(queryString);
  const obj = {};

  params.forEach((value, key) => {
    const keys = key.split(/\[|\]/).filter(Boolean);
    let current = obj;

    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        const isNumber = value && !isNaN(Number(value));
        if (isNumber) return (current[k] = Number(value));

        const valueLower = value.toLocaleLowerCase();
        const isBoolean = valueLower === 'true' || valueLower === 'false';
        if (isBoolean) return (current[k] = valueLower === 'true');

        current[k] = value;
      } else {
        if (!current[k]) {
          current[k] = isNaN(Number(keys[i + 1])) ? {} : [];
        }
        current = current[k];
      }
    });
  });

  return obj;
}
