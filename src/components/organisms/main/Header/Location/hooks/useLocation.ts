import { useCallback, useMemo } from 'react';

import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';

import { brandNameConstant } from 'core/constants/brand.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

export enum RoutesParamsEnum {
  BRAND = 'BRAND',
  DOCUMENTS = 'seus_documentos',
  COMPANY = '[companyId]',
  CLINIC = 'clinicas',
  DOC = '[docId]',
  STAGE = '[stage]',
  PGR = 'pgr',
  PCMSO = 'pcmso',
  WORKSPACE = '[workspaceId]',
  CHARACTERIZATION = '[characterization]',
}

type IRouteMapValue = {
  name: string;
  value: string;
  onDropSelect?: () => void;
  action?: () => string | void;
};

type IRouteMap = Record<RoutesParamsEnum, IRouteMapValue | null>;

export const useLocation = () => {
  const { query, pathname, push, asPath } = useRouter();
  const { data: company } = useQueryCompany();
  const { onStackOpenModal } = useModal();
  const companyId = useMemo(
    () => company.id || (query.companyId as string),
    [company.id, query.companyId],
  );

  const onSelectCompany = useCallback(
    (cb: (company: ICompany) => void) => {
      onStackOpenModal(ModalEnum.COMPANY_SELECT, {
        multiple: false,
        onSelect: (company: ICompany) => {
          cb(company);
        },
      } as Partial<typeof initialCompanySelectState>);
    },
    [onStackOpenModal],
  );

  const onSelectWorkspace = useCallback(
    (cb: (workspace: IWorkspace) => void, companyId: string) => {
      onStackOpenModal(ModalEnum.WORKSPACE_SELECT, {
        multiple: false,
        companyId,
        onSelect: (workspace: IWorkspace) => {
          cb(workspace);
        },
      } as Partial<typeof initialWorkspaceSelectState>);
    },
    [onStackOpenModal],
  );

  const onSelectDoc = useCallback(
    (cb: (rgd: IRiskGroupData) => void, companyId: string) => {
      onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
        multiple: false,
        companyId,
        onSelect: (rgd: IRiskGroupData) => {
          cb(rgd);
        },
      } as Partial<typeof initialDocPgrSelectState>);
    },
    [onStackOpenModal],
  );

  const onDropSelect = useCallback(() => {
    const includeCompany = pathname.includes(RoutesParamsEnum.COMPANY);
    const includeWorkspace = pathname.includes(RoutesParamsEnum.WORKSPACE);
    const includeDoc =
      pathname.includes(RoutesParamsEnum.DOCUMENTS) || query.riskGroupId;
    if (!includeCompany) return;

    const onChangeRoute = ({
      company,
      workspace,
      doc,
    }: {
      company: ICompany;
      workspace?: IWorkspace;
      doc?: IRiskGroupData;
    }) => {
      const queryParams = asPath
        .split('?')[1]
        ?.split('&')
        .map((q) =>
          q.includes('riskGroupId=')
            ? doc?.id
              ? `riskGroupId=${doc?.id}`
              : ''
            : q,
        )
        .join('&');

      push(
        '/' +
          pathname
            .replace(RoutesParamsEnum.COMPANY, company.id)
            .replace(RoutesParamsEnum.WORKSPACE, workspace?.id || '')
            .replace(
              RoutesParamsEnum.CHARACTERIZATION,
              (query?.characterization as string) || '',
            )
            .replace(RoutesParamsEnum.DOC, doc?.id || '') +
          '?' +
          queryParams,
      );
    };

    onSelectCompany((company) => {
      if (includeWorkspace) {
        onSelectWorkspace((workspace) => {
          if (includeDoc) {
            onSelectDoc((doc) => {
              onChangeRoute({ company, workspace, doc });
            }, company.id);
          } else {
            onChangeRoute({ company, workspace });
          }
        }, company.id);
      } else if (includeDoc) {
        onSelectDoc((doc) => {
          onChangeRoute({ company, doc });
        }, company.id);
      } else {
        onChangeRoute({ company });
      }
    });
  }, [
    asPath,
    onSelectCompany,
    onSelectDoc,
    onSelectWorkspace,
    pathname,
    push,
    query?.characterization,
    query.riskGroupId,
  ]);

  const routeMap = useMemo<IRouteMap>(() => {
    const docId = query.docId as string;
    const companyName = getCompanyName(company);

    return {
      [RoutesParamsEnum.WORKSPACE]: {
        value: RoutesParamsEnum.WORKSPACE,
        name: '',
      },
      [RoutesParamsEnum.DOCUMENTS]: {
        value: RoutesParamsEnum.DOCUMENTS,
        name: '',
      },
      [RoutesParamsEnum.CHARACTERIZATION]: {
        value: RoutesParamsEnum.CHARACTERIZATION,
        name: query?.characterization as string,
      },
      [RoutesParamsEnum.DOC]: {
        value: RoutesParamsEnum.DOC,
        name: '',
      },
      [RoutesParamsEnum.CLINIC]: {
        value: RoutesParamsEnum.CLINIC,
        name: RoutesParamsEnum.CLINIC,
      },
      [RoutesParamsEnum.PGR]: {
        value: RoutesParamsEnum.PGR,
        name: 'PGR',
        action: () =>
          RoutesEnum.PGR_DOCUMENT.replace(':companyId', companyId).replace(
            ':riskGroupId',
            docId,
          ),
      },
      [RoutesParamsEnum.PCMSO]: {
        value: RoutesParamsEnum.PCMSO,
        name: 'PCMSO',
        action: () =>
          RoutesEnum.PCMSO_DOCUMENT.replace(':companyId', companyId).replace(
            ':riskGroupId',
            docId,
          ),
      },
      [RoutesParamsEnum.BRAND]: {
        value: '',
        name: brandNameConstant.toLowerCase(),
      },
      [RoutesParamsEnum.COMPANY]: {
        value: companyId,
        name: companyName || 'empresa',
        onDropSelect: () => onDropSelect(),
        action: () => {
          if (company.isClinic)
            return RoutesEnum.CLINIC.replace(':companyId', companyId);

          if (!company.isClinic)
            return RoutesEnum.COMPANY.replace(':companyId', companyId);
        },
      },
      [RoutesParamsEnum.STAGE]: {
        value: '',
        name: '',
      },
    };
  }, [company, companyId, onDropSelect, query?.characterization, query.docId]);

  const routes = useMemo(() => {
    const notIncluded = [
      {
        pathname: '/dashboard/empresas/[companyId]/novo/[stage]',
        value: 'novo',
      },
    ]
      .map((v) => v.pathname == pathname && v.value)
      .filter((v) => v);

    const routesPath = pathname
      .split('/')
      .map(
        (route) =>
          routeMap?.[route as RoutesParamsEnum] ?? {
            name: route,
            value: route,
          },
      )
      .filter((route) => route && ![...notIncluded].includes(route.value));

    if (routesPath.length <= 1 && routeMap[RoutesParamsEnum.BRAND]) {
      routesPath.unshift(routeMap[RoutesParamsEnum.BRAND] as any);
    }
    return routesPath;
  }, [pathname, routeMap]);

  const getRoutePath = (routeValue: IRouteMapValue, index: number) => {
    if (routeValue?.action) {
      const path = routeValue.action();
      if (path) return path;
    }

    const route = routes
      .map((r) => r.value)
      .slice(0, index + 1)
      .filter((i) => i)
      .join('/');

    return route;
  };

  return { getRoutePath, routes };
};
