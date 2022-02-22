/* eslint-disable @typescript-eslint/no-explicit-any */
import deepEqual from 'deep-equal';

interface IDuplicateOptions {
  simpleCompare?: boolean;
  removeFields?: string[];
}

export function removeDuplicate(
  array: Record<string, any>[],
  options?: IDuplicateOptions,
) {
  if (options?.simpleCompare)
    return array.filter(
      (item, index, self) => index === self.findIndex((t) => t == item),
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
