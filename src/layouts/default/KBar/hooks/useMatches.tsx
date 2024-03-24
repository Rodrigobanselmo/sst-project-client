import * as React from 'react';
import Fuse from 'fuse.js';
import { ActionImpl, Priority, useKBar } from 'kbar';
import { useThrottledValue } from 'kbar/lib/utils';
import { KBarResultListProps } from '../KBarResultList';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

export const NO_GROUP = {
  name: 'none',
  priority: Priority.NORMAL,
};

function order(a, b) {
  return b.priority - a.priority;
}

type SectionName = string;

export function useMatches() {
  const { isAuthSuccess } = useAuthShow();
  const { search, actions, rootActionId } = useKBar((state) => ({
    search: state.searchQuery,
    actions: state.actions,
    rootActionId: state.currentRootActionId,
  }));

  const rootResults = React.useMemo(() => {
    return Object.keys(actions)
      .reduce((acc, actionId) => {
        const action = actions[actionId];
        if (!action.parent && !rootActionId) {
          acc.push(action);
        }
        if (action.id === rootActionId) {
          for (let i = 0; i < action.children.length; i++) {
            acc.push(action.children[i]);
          }
        }
        return acc;
      }, [] as ActionImpl[])
      .sort(order);
  }, [actions, rootActionId]);

  const getDeepResults = React.useCallback((actions: ActionImpl[]) => {
    const actionsClone: ActionImpl[] = [];
    for (let i = 0; i < actions.length; i++) {
      actionsClone.push(actions[i]);
    }
    return (function collectChildren(
      actions: ActionImpl[],
      all = actionsClone,
    ) {
      for (let i = 0; i < actions.length; i++) {
        if (actions[i].children.length > 0) {
          const childsChildren = actions[i].children;
          for (let i = 0; i < childsChildren.length; i++) {
            all.push(childsChildren[i]);
          }
          collectChildren(actions[i].children, all);
        }
      }
      return all;
    })(actions);
  }, []);

  const emptySearch = !search;

  const filtered = React.useMemo(() => {
    let results: KBarResultListProps[] = rootResults;
    if (emptySearch) {
      results = rootResults;
    } else {
      results = getDeepResults(rootResults);
    }

    return results.filter((action) => isAuthSuccess(action.authProps || {}));
  }, [rootResults, emptySearch, getDeepResults, isAuthSuccess]);

  const matches = useInternalMatches(filtered, search);

  const results = React.useMemo(() => {
    const map: Record<SectionName, { priority: number; action: ActionImpl }[]> =
      {};
    const list: { priority: number; name: SectionName }[] = [];
    let ordered: { name: SectionName; actions: ActionImpl[] }[] = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const action = match.action;
      const score = match.score || Priority.NORMAL;

      const section = {
        name:
          typeof action.section === 'string'
            ? action.section
            : action.section?.name || NO_GROUP.name,
        priority:
          typeof action.section === 'string'
            ? score
            : action.section?.priority || 0 + score,
      };

      if (!map[section.name]) {
        map[section.name] = [];
        list.push(section);
      }

      map[section.name].push({
        priority: action.priority + score,
        action,
      });
    }

    ordered = list.sort(order).map((group) => ({
      name: group.name,
      actions: map[group.name].sort(order).map((item) => item.action),
    }));

    const results: (string | ActionImpl)[] = [];
    for (let i = 0; i < ordered.length; i++) {
      const group = ordered[i];
      if (group.name !== NO_GROUP.name) results.push(group.name);
      for (let i = 0; i < group.actions.length; i++) {
        results.push(group.actions[i]);
      }
    }
    return results;
  }, [matches]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoRootActionId = React.useMemo(() => rootActionId, [results]);

  return React.useMemo(
    () => ({
      results,
      rootActionId: memoRootActionId,
    }),
    [memoRootActionId, results],
  );
}

type Match = {
  action: ActionImpl;
  score: number;
};

function useInternalMatches(filtered: ActionImpl[], search: string) {
  const value = React.useMemo(
    () => ({
      filtered,
      search,
    }),
    [filtered, search],
  );

  const { filtered: throttledFiltered, search: throttledSearch } =
    useThrottledValue(value);

  return React.useMemo(() => {
    if (throttledSearch.trim() === '') {
      return throttledFiltered.map((action) => ({ score: 0, action }));
    }

    const keysArray = stringNormalize(throttledSearch)
      .split(' ')
      .filter(Boolean);

    let matches: Match[] = [];

    const filteredArray = throttledFiltered.filter((item) => {
      const itemKeywords = item.keywords?.split(' ') || [];
      return keysArray.every((key) =>
        itemKeywords.some((keyword) => keyword.includes(key)),
      );
    });

    matches = filteredArray.map((action) => ({
      score: 0,
      action,
    }));

    return matches;
  }, [throttledFiltered, throttledSearch]) as Match[];
}
