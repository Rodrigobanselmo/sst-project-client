/* eslint-disable @typescript-eslint/no-explicit-any */
import deepEqual from 'deep-equal';

interface IDuplicateOptions {
  simpleCompare?: boolean;
  removeFields?: string[];
  removeById?: string;
}

export function removeDuplicate<T = any>(
  array: T[],
  options?: IDuplicateOptions,
) {
  if (options?.simpleCompare || typeof array[0] === 'string')
    return array.filter(
      (item, index, self) => index === self.findIndex((t) => t == item),
    );

  if (options?.removeById)
    return array.filter(
      (item: any, index, self) =>
        index ===
        self.findIndex(
          (t: any) =>
            t[options?.removeById as string] ==
            item[(options as any)?.removeById as string],
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
