import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/view-risk-type.constant';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/view-data-type.constant';

export interface PageContext {
  /** Current company ID from the route /dashboard/empresas/[companyId]/... */
  companyId?: string;
  /** The current route path */
  path?: string;
  /** Selected homogeneous group ID from URL query params */
  homogeneousGroupId?: string;
  /** Selected hierarchy ID from URL query params (when viewing hierarchy/simple view) */
  hierarchyId?: string;
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
    const viewData = router.query.viewData as string | undefined;

    const isHierarchy = viewData === ViewsDataEnum.HIERARCHY;

    return {
      companyId: companyId || undefined,
      homogeneousGroupId: !isHierarchy ? ghoId || undefined : undefined,
      hierarchyId: isHierarchy ? ghoId || undefined : undefined,
      path: router.pathname || undefined,
    };
  }, [
    router.query.companyId,
    router.query.ghoId,
    router.query.viewData,
    router.pathname,
  ]);
}
