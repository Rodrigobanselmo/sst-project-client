/* eslint-disable @typescript-eslint/no-explicit-any */
import deepEqual from 'deep-equal';

interface IDuplicateOptions {
  simpleCompare?: boolean;
  removeFields?: string[];
  removeById?: string;
}

export function removeDuplicate(array: any[], options?: IDuplicateOptions) {
  if (options?.simpleCompare || typeof array[0] === 'string')
    return array.filter(
      (item, index, self) => index === self.findIndex((t) => t == item),
    );

  if (options?.removeById)
    return array.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t[options.removeById as string] ==
            item[options.removeById as string],
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
            delete itemCopy[field];
            delete tCopy[field];
          });

        return deepEqual(t, item);
      }),
  );
}
