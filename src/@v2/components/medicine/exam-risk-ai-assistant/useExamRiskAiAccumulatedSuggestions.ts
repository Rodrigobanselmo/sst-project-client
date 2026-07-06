import { useCallback, useMemo, useState } from 'react';

import { mergeAccumulatedItems } from './exam-risk-ai-assistant-accumulated.util';

export const useExamRiskAiAccumulatedSuggestions = <T, K extends string = string>(
  getKey: (item: T) => K,
) => {
  const [items, setItems] = useState<T[]>([]);

  const keys = useMemo(() => new Set(items.map(getKey)), [items, getKey]);

  const addItems = useCallback(
    (incoming: T[], isAllowed: (item: T) => boolean): number => {
      const eligible = incoming.filter(isAllowed);
      if (!eligible.length) return 0;

      let added = 0;
      setItems((current) => {
        const seen = new Set(current.map(getKey));
        const toAdd = eligible.filter((item) => {
          const key = getKey(item);
          if (seen.has(key)) return false;
          seen.add(key);
          added += 1;
          return true;
        });
        return toAdd.length ? [...current, ...toAdd] : current;
      });
      return added;
    },
    [getKey],
  );

  const removeItem = useCallback(
    (key: K) => {
      setItems((current) => current.filter((item) => getKey(item) !== key));
    },
    [getKey],
  );

  const clear = useCallback(() => setItems([]), []);

  const isAccumulated = useCallback((key: K) => keys.has(key), [keys]);

  return {
    items,
    keys,
    addItems,
    removeItem,
    clear,
    isAccumulated,
    count: items.length,
  };
};
