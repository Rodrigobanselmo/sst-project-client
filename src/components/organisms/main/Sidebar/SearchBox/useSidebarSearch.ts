import { KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { useApplyHeaderCompanyChange } from 'components/organisms/main/Header/hooks/useApplyHeaderCompanyChange';
import { useApplyHomeScopeChange } from 'components/organisms/main/Header/hooks/useApplyHomeScopeChange';
import { RoutesParamsEnum } from 'components/organisms/main/Header/Location/hooks/useLocation';
import { getCompanyWorkspaceHomePath } from 'core/constants/company-breadcrumb.constants';
import {
  isHomeCompanyPage,
  shouldRestrictCompanySelectorToBusinessGroup,
} from 'core/constants/home-business-group-scope.constants';
import { useAuth } from 'core/contexts/AuthContext';
import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import { useHomeBusinessGroupScope } from 'core/hooks/useHomeBusinessGroupScope';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { ICompany } from 'core/interfaces/api/ICompany';
import {
  IQueryCompaniesTypes,
  useQueryCompanies,
} from 'core/services/hooks/queries/useQueryCompanies';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useRouter } from 'next/router';

import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';

import { IDrawerSection } from '../SideBarNav/hooks/useDrawerItems';
import {
  buildDeepFeatures,
  collectVisibleNavIds,
  filterSearchFeatures,
  flattenDrawerFeatures,
  getSearchOptionId,
  mergeSearchFeatures,
  moveActiveIndex,
  SidebarSearchFeature,
} from './sidebar-search.util';

const COMPANIES_SEARCH_TAKE = 12;
const COMPANY_QUERY_MIN_LENGTH = 2;
const COMPANY_SEARCH_DEBOUNCE_MS = 250;

export type SidebarSearchResultRow =
  | { kind: 'feature'; id: string; feature: SidebarSearchFeature }
  | { kind: 'company'; id: string; company: ICompany };

export function useSidebarSearch(params: {
  sections: IDrawerSection[];
  resolveHref: (href?: string) => string | undefined;
}) {
  const { sections, resolveHref } = params;
  const { searchQuery, setSearchQuery } = useSidebarDrawer();
  const router = useRouter();
  const { pathname, query } = router;
  const { refreshUser } = useAuth();
  const { data: company } = useQueryCompany();
  const { isMasterAdmin } = usePermissionsAccess();
  const { workspaceId: tabWorkspaceId } = useTabWorkspaceId();
  const { hasBusinessGroup, businessGroupId } = useHomeBusinessGroupScope();
  const { applyCompanyChange } = useApplyHeaderCompanyChange();
  const { applyHomeCompanySelection } = useApplyHomeScopeChange();

  const companyId = (query.companyId as string) || company?.id || '';
  const includeCompany = pathname.includes(RoutesParamsEnum.COMPANY);
  const includeClinic = pathname.includes(RoutesParamsEnum.CLINIC);
  const isHomePage = isHomeCompanyPage(pathname);
  const restrictSelectorToBusinessGroup =
    shouldRestrictCompanySelectorToBusinessGroup({
      isCompanyRoute: includeCompany,
      hasBusinessGroup,
      businessGroupId,
    });

  const queryText = searchQuery.trim();
  const [debouncedCompanyQuery, setDebouncedCompanyQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedCompanyQuery(queryText);
    }, COMPANY_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [queryText]);

  const companiesQueryType: IQueryCompaniesTypes = isMasterAdmin
    ? ''
    : '/by-user';

  const shouldFetchCompanies =
    debouncedCompanyQuery.length >= COMPANY_QUERY_MIN_LENGTH;

  const { companies, isLoading: isLoadingCompanies } = useQueryCompanies(
    1,
    {
      isClinic: includeClinic,
      // `disabled: true` neste hook cancela o fetch (mesmo pé do header).
      disabled: !shouldFetchCompanies,
      search: shouldFetchCompanies ? debouncedCompanyQuery : undefined,
      ...(restrictSelectorToBusinessGroup && businessGroupId
        ? { groupId: businessGroupId }
        : {}),
    },
    COMPANIES_SEARCH_TAKE,
    companiesQueryType,
  );

  const drawerFeatures = useMemo(
    () => flattenDrawerFeatures(sections, resolveHref),
    [resolveHref, sections],
  );

  const features = useMemo(() => {
    if (!queryText) return [] as SidebarSearchFeature[];

    const deepFeatures = buildDeepFeatures({
      companyId,
      tabWorkspaceId,
      visibleNavIds: collectVisibleNavIds(drawerFeatures),
    });

    return filterSearchFeatures(
      mergeSearchFeatures(drawerFeatures, deepFeatures),
      queryText,
    );
  }, [companyId, drawerFeatures, queryText, tabWorkspaceId]);

  const companyResults = shouldFetchCompanies ? companies : [];

  const rows = useMemo<SidebarSearchResultRow[]>(() => {
    return [
      ...features.map((feature) => ({
        kind: 'feature' as const,
        id: feature.id,
        feature,
      })),
      ...companyResults.map((item) => ({
        kind: 'company' as const,
        id: `company:${item.id}`,
        company: item,
      })),
    ];
  }, [companyResults, features]);

  useEffect(() => {
    setActiveIndex(0);
  }, [queryText, rows.length]);

  const clearSearch = useCallback(() => setSearchQuery(''), [setSearchQuery]);

  const selectFeature = useCallback(
    (feature: SidebarSearchFeature) => {
      clearSearch();
      void router.push(feature.href);
    },
    [clearSearch, router],
  );

  const selectCompany = useCallback(
    async (selected: ICompany) => {
      clearSearch();

      if (includeCompany && isHomePage) {
        await applyHomeCompanySelection(selected, businessGroupId);
        return;
      }

      if (includeCompany) {
        await applyCompanyChange(selected);
        return;
      }

      await refreshUser(selected.id);
      void router.push(getCompanyWorkspaceHomePath(selected.id));
    },
    [
      applyCompanyChange,
      applyHomeCompanySelection,
      businessGroupId,
      clearSearch,
      includeCompany,
      isHomePage,
      refreshUser,
      router,
    ],
  );

  const selectActive = useCallback(() => {
    const row = rows[activeIndex];
    if (!row) return;
    if (row.kind === 'feature') selectFeature(row.feature);
    else void selectCompany(row.company);
  }, [activeIndex, rows, selectCompany, selectFeature]);

  const onSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!queryText) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => moveActiveIndex(index, 1, rows.length));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => moveActiveIndex(index, -1, rows.length));
        return;
      }

      if (event.key === 'Enter') {
        if (!rows.length) return;
        event.preventDefault();
        selectActive();
      }
    },
    [queryText, rows.length, selectActive],
  );

  return {
    queryText,
    features,
    companies: companyResults,
    rows,
    activeIndex,
    setActiveIndex,
    activeOptionId: rows.length ? getSearchOptionId(activeIndex) : undefined,
    isLoadingCompanies: shouldFetchCompanies && isLoadingCompanies,
    currentCompanyId: companyId,
    selectFeature,
    selectCompany,
    clearSearch,
    onSearchKeyDown,
  };
}
