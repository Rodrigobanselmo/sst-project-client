import { useState } from 'react';

export const useSetState = <T>(initial?: T[]) => {
  const [set, setSet] = useState<Set<T>>(new Set(initial));
  return {
    Set: set,
    replace: (newSet: T[]) => setSet(new Set(newSet)),
    add: (el: T) =>
      setSet((set) => {
        if (set.has(el)) return set;
        set.add(el);
        return new Set(set);
      }),
    delete: (el: T) => {
      setSet((set) => {
        if (!set.has(el)) return set;
        set.delete(el);
        return new Set(set);
      });
    },
    has: (el: T) => set.has(el),
    clear: () => setSet(new Set()),
    [Symbol.iterator]: () => set.values(),
    forEach: (
      callbackfn: (value: T, value2: T, set: Set<T>) => void,
      thisArg?: any,
    ) => set.forEach(callbackfn, thisArg),
    keys: () => set.keys(),
    values: () => set.values(),
    get size() {
      return set.size;
    },
  };
};
