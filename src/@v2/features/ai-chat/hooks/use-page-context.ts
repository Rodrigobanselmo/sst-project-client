import { useMemo } from 'react';
import { useRouter } from 'next/router';

export interface PageContext {
  /** Current company ID from the route /dashboard/empresas/[companyId]/... */
  companyId?: string;
  /** The current route path */
  path?: string;
  /** Selected homogeneous group ID from URL query params */
  homogeneousGroupId?: string;
}

/**
 * Extracts page context from the current route for AI context awareness.
 * The AI agent can use this to understand what the user is looking at.
 */
export function usePageContext(): PageContext {
  const router = useRouter();

  return useMemo(() => {
    const companyId = router.query.companyId as string | undefined;
    const ghoId = router.query.ghoId as string | undefined;

    return {
      companyId: companyId || undefined,
      homogeneousGroupId: ghoId || undefined,
      path: router.pathname || undefined,
    };
  }, [router.query.companyId, router.query.ghoId, router.pathname]);
}
