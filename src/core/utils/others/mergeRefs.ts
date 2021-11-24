/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
export function mergeRefs<T extends { current: unknown } | ((ref: T) => void)>(
  ...inputRefs: T[]
) {
  const filteredInputRefs = inputRefs.filter(Boolean);

  if (filteredInputRefs.length <= 1) {
    return filteredInputRefs[0];
  }

  return function mergedRefs(ref: T) {
    filteredInputRefs.forEach((inputRef) => {
      if (typeof inputRef === 'function') {
        inputRef(ref);
      } else {
        inputRef.current = ref;
      }
    });
  };
}
