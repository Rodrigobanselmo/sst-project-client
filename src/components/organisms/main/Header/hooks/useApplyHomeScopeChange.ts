import { useRouter } from 'next/router';
import { useCallback } from 'react';

import {
  BUSINESS_GROUP_ID_QUERY_KEY,
  HOME_SCOPE_COMPANY,
  HOME_SCOPE_GROUP,
  HOME_SCOPE_QUERY_KEY,
} from 'core/constants/home-business-group-scope.constants';
import { ICompany } from 'core/interfaces/api/ICompany';

import { useApplyHeaderCompanyChange } from './useApplyHeaderCompanyChange';

export function useApplyHomeScopeChange() {
  const router = useRouter();
  const { applyCompanyChange } = useApplyHeaderCompanyChange();

  const applyAllGroupCompaniesScope = useCallback(
    (businessGroupId: number) => {
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
    },
    [router],
  );

  const applyHomeCompanySelection = useCallback(
    (selectedCompany: ICompany, businessGroupId?: number | null) => {
      const homeQueryOverrides = {
        [HOME_SCOPE_QUERY_KEY]: HOME_SCOPE_COMPANY,
        [BUSINESS_GROUP_ID_QUERY_KEY]: undefined,
        tabWorkspaceId: undefined,
      };

      if (selectedCompany.id === router.query.companyId) {
        const nextQuery = { ...router.query, ...homeQueryOverrides };
        delete nextQuery[BUSINESS_GROUP_ID_QUERY_KEY];
        delete nextQuery.tabWorkspaceId;

        void router.replace(
          {
            pathname: router.pathname,
            query: nextQuery,
          },
          undefined,
          { shallow: true },
        );
        return;
      }

      applyCompanyChange(selectedCompany, { queryOverrides: homeQueryOverrides });
    },
    [applyCompanyChange, router],
  );

  return {
    applyAllGroupCompaniesScope,
    applyHomeCompanySelection,
  };
}
