import { useEffect } from 'react';

import { useFetchVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/hooks/useFetchVisualIdentity';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  canApplyVisualIdentity,
  peekLastKnownVisualIdentityCompanyId,
  rememberVisualIdentityCompanyId,
  resetVisualIdentityCompanyIdMemory,
  resolveVisualIdentityFetchCompanyId,
} from 'core/utils/company/resolve-visual-identity-context';

function routeCompanyIdFromQuery(companyId: unknown): string | undefined {
  return typeof companyId === 'string' && companyId ? companyId : undefined;
}

export function useResolvedVisualIdentity() {
  const { user, router } = useGetCompanyId();

  const fetchCompanyId = resolveVisualIdentityFetchCompanyId({
    isRouterReady: router.isReady,
    selectedCompanyId: routeCompanyIdFromQuery(router.query.companyId),
    sessionCompanyId: user?.companyId,
    lastKnownCompanyId: user?.id
      ? peekLastKnownVisualIdentityCompanyId()
      : '',
  });

  useEffect(() => {
    if (!user?.id) {
      resetVisualIdentityCompanyIdMemory();
      return;
    }

    if (fetchCompanyId) {
      rememberVisualIdentityCompanyId(fetchCompanyId);
    }
  }, [user?.id, fetchCompanyId]);

  const query = useFetchVisualIdentity({ companyId: fetchCompanyId });
  const applied = canApplyVisualIdentity({
    visualIdentity: query.visualIdentity,
  })
    ? query.visualIdentity
    : undefined;

  return {
    ...query,
    fetchCompanyId,
    visualIdentity: applied,
  };
}
