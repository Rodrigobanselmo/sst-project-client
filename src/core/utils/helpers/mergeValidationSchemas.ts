/* eslint-disable @typescript-eslint/no-explicit-any */

export const mergeValidationSchemas = (...schemas: any[]) => {
  const [first, ...rest] = schemas;

  const merged = rest.reduce(
    (mergedSchemas, schema) => mergedSchemas.concat(schema),
    first,
  );

  return merged;
};
