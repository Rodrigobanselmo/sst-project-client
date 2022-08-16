/* eslint-disable @typescript-eslint/no-explicit-any */
import deepEqual from 'deep-equal';

interface IDuplicateOptions {
  simpleCompare?: boolean;
  removeFields?: string[];
  removeById?: string | string[];
}

export function removeDuplicate<T = any>(
  array: T[],
  options?: IDuplicateOptions,
) {
  if (options?.simpleCompare || typeof array[0] === 'string')
    return array.filter(
      (item, index, self) => index === self.findIndex((t) => t == item),
    );

  const removeById = options?.removeById;

  if (removeById && Array.isArray(removeById))
    return array.filter(
      (item: any, index, self) =>
        index ===
        self.findIndex((t: any) =>
          (removeById as string[])?.some(
            (removeById) =>
              t[removeById as string] == item[removeById as string],
          ),
        ),
    );

  if (removeById)
    return array.filter(
      (item: any, index, self) =>
        index ===
        self.findIndex(
          (t: any) => t[removeById as string] == item[removeById as string],
        ),
    );

  return array.filter(
    (item, index, self) =>
      index ===
      self.findIndex((t) => {
        const itemCopy = { ...item };
        const tCopy = { ...t };

        if (options?.removeFields)
          options.removeFields.forEach((field) => {
            delete (itemCopy as any)[field];
            delete (tCopy as any)[field];
          });

        return deepEqual(t, item);
      }),
  );
}
