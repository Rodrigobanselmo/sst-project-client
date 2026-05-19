import type { ParsedUrlQuery } from 'querystring';

import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

/** Estabelecimento opcional no header (`tabWorkspaceId`). Vazio = toda a empresa. */
export function useTabWorkspaceId() {
  const router = useRouter();
  const workspaceId = useMemo(() => {
    const fromTab = router.query.tabWorkspaceId as string | undefined;
    const fromRoute = router.query.workspaceId as string | undefined;
    return fromTab || fromRoute || undefined;
  }, [router.query.tabWorkspaceId, router.query.workspaceId]);

  const setWorkspaceId = useCallback(
    (id: string | undefined) => {
      const nextQuery = { ...router.query } as ParsedUrlQuery;
      if (id) nextQuery.tabWorkspaceId = id;
      else delete nextQuery.tabWorkspaceId;

      void router.replace(
        { pathname: router.pathname, query: nextQuery },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  return { workspaceId, setWorkspaceId, hasWorkspaceSelected: !!workspaceId };
}
