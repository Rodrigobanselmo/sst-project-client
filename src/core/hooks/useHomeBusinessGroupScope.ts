import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

import {
  BUSINESS_GROUP_ID_QUERY_KEY,
  HOME_SCOPE_COMPANY,
  HOME_SCOPE_GROUP,
  HOME_SCOPE_QUERY_KEY,
  isHomeCompanyPage,
} from 'core/constants/home-business-group-scope.constants';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export function useHomeBusinessGroupScope() {
  const router = useRouter();
  const { pathname, query } = router;
  const { data: company } = useQueryCompany();

  const isHomePage = isHomeCompanyPage(pathname);
  const routeCompanyId = (query.companyId as string) || company?.id || '';

  const businessGroupFromCompany = company?.group;
  const businessGroupId = businessGroupFromCompany?.id ?? null;
  const businessGroupName = businessGroupFromCompany?.name ?? null;
  const hasBusinessGroup = !!businessGroupId;

  const queryHomeScope = query[HOME_SCOPE_QUERY_KEY] as string | undefined;
  const queryBusinessGroupId = Number(query[BUSINESS_GROUP_ID_QUERY_KEY]);

  const isGroupConsolidated = useMemo(() => {
    if (!isHomePage || !hasBusinessGroup) return false;
    if (queryHomeScope !== HOME_SCOPE_GROUP) return false;
    if (!queryBusinessGroupId || Number.isNaN(queryBusinessGroupId)) {
      return false;
    }

    return queryBusinessGroupId === businessGroupId;
  }, [
    businessGroupId,
    hasBusinessGroup,
    isHomePage,
    queryBusinessGroupId,
    queryHomeScope,
  ]);

  const effectiveCompanyId = isGroupConsolidated ? null : routeCompanyId || null;

  const applyGroupConsolidatedScope = useCallback(() => {
    if (!isHomePage || !businessGroupId) return;

    const nextQuery = { ...router.query };
    nextQuery[HOME_SCOPE_QUERY_KEY] = HOME_SCOPE_GROUP;
    nextQuery[BUSINESS_GROUP_ID_QUERY_KEY] = String(businessGroupId);
    delete nextQuery.tabWorkspaceId;

    void router.replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true },
    );
  }, [businessGroupId, isHomePage, router]);

  const applyCompanyScope = useCallback(() => {
    if (!isHomePage) return;

    const nextQuery = { ...router.query };
    nextQuery[HOME_SCOPE_QUERY_KEY] = HOME_SCOPE_COMPANY;
    delete nextQuery[BUSINESS_GROUP_ID_QUERY_KEY];

    void router.replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true },
    );
  }, [isHomePage, router]);

  return {
    isHomePage,
    hasBusinessGroup,
    businessGroupId,
    businessGroupName,
    isGroupConsolidated,
    routeCompanyId,
    effectiveCompanyId,
    applyGroupConsolidatedScope,
    applyCompanyScope,
    memberCompanies: businessGroupFromCompany?.companies ?? [],
  };
}
