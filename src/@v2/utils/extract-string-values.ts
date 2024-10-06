type NestedObject = {
  [key: string]: string | NestedObject | string[];
};

export function extractStringValues(obj: NestedObject): string[] {
  const values: string[] = [];

  function extract(obj: NestedObject) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        values.push(obj[key] as string);
      } else if (typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          const array = obj[key] as string[];
          array.forEach((item: string) => {
            if (typeof item === 'string') {
              values.push(item);
            }
          });
        } else {
          extract(obj[key] as NestedObject);
        }
      }
    }
  }

  extract(obj);
  return values;
}
