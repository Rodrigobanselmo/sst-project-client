import { useRouter } from 'next/router';
import { useCallback } from 'react';

import {
  BUSINESS_GROUP_ID_QUERY_KEY,
  HOME_COMPANY_PAGE_PATHNAME,
  HOME_SCOPE_COMPANY,
  HOME_SCOPE_GROUP,
  HOME_SCOPE_QUERY_KEY,
  isHomeCompanyPage,
} from 'core/constants/home-business-group-scope.constants';
import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { ICompany } from 'core/interfaces/api/ICompany';

import { useApplyHeaderCompanyChange } from './useApplyHeaderCompanyChange';

export function useApplyHomeScopeChange() {
  const router = useRouter();
  const { applyCompanyChange } = useApplyHeaderCompanyChange();

  const applyAllGroupCompaniesScope = useCallback(
    (businessGroupId: number) => {
      const routeCompanyId = router.query.companyId as string | undefined;

      if (isHomeCompanyPage(router.pathname)) {
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
        return;
      }

      if (!routeCompanyId) return;

      void router.push({
        pathname: HOME_COMPANY_PAGE_PATHNAME,
        query: {
          companyId: routeCompanyId,
          stage: CompanyActionEnum.COMPANY_GROUP_PAGE,
          [HOME_SCOPE_QUERY_KEY]: HOME_SCOPE_GROUP,
          [BUSINESS_GROUP_ID_QUERY_KEY]: String(businessGroupId),
        },
      });
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

      void applyCompanyChange(selectedCompany, { queryOverrides: homeQueryOverrides });
    },
    [applyCompanyChange, router],
  );

  return {
    applyAllGroupCompaniesScope,
    applyHomeCompanySelection,
  };
}
