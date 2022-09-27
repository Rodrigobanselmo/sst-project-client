import { useMemo } from 'react';

import { useRouter } from 'next/router';

import { brandNameConstant } from 'core/constants/brand.constant';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

enum RoutesParamsEnum {
  COMPANY = '[companyId]',
  WORKSPACE = '[workspaceId]',
}

type IRouteMap = Record<
  string,
  {
    name: string;
    action: () => void;
  }
>;

export const useLocation = () => {
  const { query, pathname, push } = useRouter();
  const { data: company } = useQueryCompany();

  const routeMap = useMemo<IRouteMap>(() => {
    const companyId = company.id || (query.companyId as string);
    const companyName = getCompanyName(company);

    return {
      ['[companyId]']: {
        name: companyName || 'empresa',
        action: () => {
          if (company.isClinic)
            push(RoutesEnum.CLINIC.replace(':companyId', companyId));

          if (!company.isClinic)
            push(RoutesEnum.COMPANY.replace(':companyId', companyId));
        },
      },
    };
  }, [company, push, query.companyId]);

  const routes = useMemo(() => {
    const routesPath = pathname
      .split('/')
      .map((route) => routeMap?.[route]?.name ?? route)
      .filter((route) => route);

    const routesToMap = [...routesPath];

    if (routesPath.length <= 1) {
      routesToMap.unshift(brandNameConstant.toLowerCase());
    }
    return routesPath;
  }, [pathname, routeMap]);

  // const handleChangeRoute = (index: number) => {
  //   const route = routes.slice(0, index + 1).join('/');

  //   return `/${route.replace(companyName || 'empresa', companyId || '')}`;
  // };
};
