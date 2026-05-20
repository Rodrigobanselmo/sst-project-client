import { useCallback, useMemo } from 'react';

import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';

import { brandNameConstant } from 'core/constants/brand.constant';
import {
  CHARACTERIZATION_AMBIENTES_PATHNAME,
  CHARACTERIZATION_GSE_PATHNAME,
  CHARACTERIZATION_MODULE_LABEL,
  CHARACTERIZATION_MODULE_ROUTE_VALUE,
  COMPANY_SST_PATHNAME,
  getCharacterizationSstPath,
  getCharacterizationSubTabLabel,
  parseCharacterizationActiveTab,
} from 'core/constants/characterization-navigation.constants';
import {
  ABSENTEEISM_TAB_PATHNAME,
  ACTION_PLAN_PATHNAME,
  COMPANY_HOME_PATHNAME,
  COMPANY_STAGE_BREADCRUMB,
  DOCUMENTS_MODULE_ROUTE_VALUE,
  DOCUMENT_TYPE_BREADCRUMB_LABELS,
  FORM_TAB_BREADCRUMB_LABELS,
  FORMS_MODULE_ROUTE_VALUE,
  FORMS_TAB_PATHNAME,
  getDocumentsStagePath,
  getAbsenteeismListPath,
  getAbsenteeismMetricsPath,
  getFormsAppliedListPath,
  isCompanyFlowPathname,
  normalizeCompanyFlowBreadcrumbs,
} from 'core/constants/company-breadcrumb.constants';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { CompanyActionEnum } from 'core/enums/company-action.enum';
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
            return RoutesEnum.COMPANY.replace(':companyId', companyId).replace(
              ':stage',
              CompanyActionEnum.COMPANY_GROUP_PAGE,
            );
        },
      },
      [RoutesParamsEnum.STAGE]: {
        value: '',
        name: '',
      },
    };
  }, [company, companyId, onDropSelect, query?.characterization, query.docId]);

  const rawRoutes = useMemo(() => {
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

    if (
      routesPath.length <= 1 &&
      routeMap[RoutesParamsEnum.BRAND] &&
      !isCompanyFlowPathname(pathname)
    ) {
      routesPath.unshift(routeMap[RoutesParamsEnum.BRAND] as any);
    }

    const characterizationModule = {
      name: CHARACTERIZATION_MODULE_LABEL,
      value: CHARACTERIZATION_MODULE_ROUTE_VALUE,
      action: () => getCharacterizationSstPath(companyId),
    };

    const hideSegmentValues = new Set([
      'sst',
      'caracterizacao',
      'grupos-homogenios',
    ]);

    if (pathname === COMPANY_SST_PATHNAME && query.stage === 'sst') {
      const tab = parseCharacterizationActiveTab(query.active);
      const filtered = routesPath.filter((r) => !hideSegmentValues.has(r.value));
      const companyIdx = filtered.findIndex((r) => r.value === companyId);
      const insertAt = companyIdx >= 0 ? companyIdx + 1 : filtered.length;
      filtered.splice(insertAt, 0, characterizationModule, {
        name: getCharacterizationSubTabLabel(tab),
        value: `caracterizacao-${tab}`,
        action: () =>
          `${getCharacterizationSstPath(companyId)}?active=${tab}`,
      });
      return filtered;
    }

    if (pathname === CHARACTERIZATION_AMBIENTES_PATHNAME) {
      const filtered = routesPath.filter(
        (r) => r.value !== 'caracterizacao',
      );
      const companyIdx = filtered.findIndex((r) => r.value === companyId);
      const insertAt = companyIdx >= 0 ? companyIdx + 1 : filtered.length;
      filtered.splice(insertAt, 0, characterizationModule, {
        name: getCharacterizationSubTabLabel(1),
        value: 'caracterizacao-ambientes',
        action: () =>
          `${getCharacterizationSstPath(companyId)}?active=1`,
      });
      return filtered;
    }

    if (pathname === CHARACTERIZATION_GSE_PATHNAME) {
      const filtered = routesPath.filter(
        (r) => r.value !== 'grupos-homogenios',
      );
      const companyIdx = filtered.findIndex((r) => r.value === companyId);
      const insertAt = companyIdx >= 0 ? companyIdx + 1 : filtered.length;
      filtered.splice(insertAt, 0, characterizationModule, {
        name: getCharacterizationSubTabLabel(2),
        value: 'caracterizacao-gse',
        action: () =>
          `${getCharacterizationSstPath(companyId)}?active=2`,
      });
      return filtered;
    }

    const insertAfterCompany = (
      segments: IRouteMapValue[],
      extra: IRouteMapValue[],
    ) => {
      const companyIdx = segments.findIndex((r) => r.value === companyId);
      const insertAt = companyIdx >= 0 ? companyIdx + 1 : segments.length;
      segments.splice(insertAt, 0, ...extra);
      return segments;
    };

    if (pathname === COMPANY_HOME_PATHNAME) {
      const stage = query.stage as string | undefined;
      const stageConfig = stage ? COMPANY_STAGE_BREADCRUMB[stage] : undefined;
      const hideStageValues = new Set([
        'sst',
        'empregados',
        'empresa',
        'documentos',
      ]);
      const filtered = routesPath.filter(
        (r) => !hideStageValues.has(r.value),
      );

      if (stage === CompanyActionEnum.DOCUMENTS_GROUP_PAGE) {
        const active = Number(query.active ?? 0);
        const activeLabel =
          DOCUMENT_TYPE_BREADCRUMB_LABELS[active] ??
          DOCUMENT_TYPE_BREADCRUMB_LABELS[0];

        return insertAfterCompany(filtered, [
          {
            name: 'Documentos',
            value: DOCUMENTS_MODULE_ROUTE_VALUE,
            action: () => getDocumentsStagePath(companyId, 0),
          },
          {
            name: activeLabel,
            value: `documentos-tipo-${active}`,
            action: () => getDocumentsStagePath(companyId, active),
          },
        ]);
      }

      if (stageConfig) {
        return insertAfterCompany(filtered, [
          {
            name: stageConfig.label,
            value: `company-stage-${stage}`,
            action: () => stageConfig.getPath(companyId),
          },
        ]);
      }
      return filtered;
    }

    if (pathname === ABSENTEEISM_TAB_PATHNAME) {
      const tab = query.absenteeismsTab as string | undefined;
      const filtered = routesPath.filter(
        (r) => !['absenteismo', 'lista', 'metricas'].includes(r.value),
      );
      const segments = insertAfterCompany(filtered, [
        {
          name: 'Absenteísmo',
          value: 'absenteismo-modulo',
          action: () => getAbsenteeismListPath(companyId),
        },
      ]);
      if (tab === 'metricas') {
        segments.push({
          name: 'Métricas',
          value: 'absenteismo-metricas',
          action: () => getAbsenteeismMetricsPath(companyId),
        });
      }
      return segments;
    }

    if (pathname === ACTION_PLAN_PATHNAME) {
      const filtered = routesPath.filter((r) => r.value !== 'plano-de-acao');
      return insertAfterCompany(filtered, [
        {
          name: 'Plano de Ação',
          value: 'plano-de-acao-modulo',
          action: () =>
            RoutesEnum.ACTION_PLAN.replace(':companyId', companyId),
        },
      ]);
    }

    if (pathname === FORMS_TAB_PATHNAME) {
      const formTab = query.formTab as string | undefined;
      const filtered = routesPath.filter(
        (r) => r.value !== 'formularios' && r.value !== formTab,
      );
      const segments = insertAfterCompany(filtered, [
        {
          name: 'Formulários',
          value: FORMS_MODULE_ROUTE_VALUE,
          action: () => getFormsAppliedListPath(companyId),
        },
      ]);
      const tabLabel = formTab ? FORM_TAB_BREADCRUMB_LABELS[formTab] : undefined;
      if (tabLabel) {
        segments.push({
          name: tabLabel,
          value: `formularios-${formTab}`,
          action: () =>
            PageRoutes.FORMS.FORMS_APPLICATION.LIST.replace(
              '[companyId]',
              companyId,
            ).replace('[formTab]', formTab || FORM_TAB_ENUM.APPLIED),
        });
      }
      return segments;
    }

    if (
      pathname.startsWith('/dashboard/empresas/') &&
      pathname.includes('/formularios/') &&
      pathname !== FORMS_TAB_PATHNAME
    ) {
      const filtered = routesPath.filter(
        (r) =>
          ![
            'formularios',
            'aplicados',
            'modelos',
            'biblioteca-preliminar',
            'add',
            'edit',
          ].includes(r.value),
      );
      return insertAfterCompany(filtered, [
        {
          name: 'Formulários',
          value: FORMS_MODULE_ROUTE_VALUE,
          action: () => getFormsAppliedListPath(companyId),
        },
      ]);
    }

    return routesPath;
  }, [
    companyId,
    pathname,
    query.absenteeismsTab,
    query.active,
    query.formTab,
    query.stage,
    routeMap,
  ]);

  const routes = useMemo(
    () => normalizeCompanyFlowBreadcrumbs(rawRoutes, pathname),
    [rawRoutes, pathname],
  );

  const getRoutePath = (routeValue: IRouteMapValue, index: number) => {
    if (routeValue?.action) {
      const path = routeValue.action();
      if (path) return path.replace(/^\//, '');
    }

    const route = routes
      .map((r) => r.value)
      .slice(0, index + 1)
      .filter((i) => i)
      .join('/');

    return route;
  };

  const companyBreadcrumbIndex = useMemo(
    () => routes.findIndex((r) => r.value === companyId),
    [routes, companyId],
  );

  const showCompanyAreaMenu = useMemo(
    () =>
      companyBreadcrumbIndex >= 0 &&
      pathname.includes('/empresas/') &&
      !company.isClinic,
    [company.isClinic, companyBreadcrumbIndex, pathname],
  );

  const characterizationBreadcrumbIndex = useMemo(
    () =>
      routes.findIndex((r) => r.value === CHARACTERIZATION_MODULE_ROUTE_VALUE),
    [routes],
  );

  const showCharacterizationSubareaMenu = useMemo(
    () => characterizationBreadcrumbIndex >= 0,
    [characterizationBreadcrumbIndex],
  );

  const formsBreadcrumbIndex = useMemo(
    () => routes.findIndex((r) => r.value === FORMS_MODULE_ROUTE_VALUE),
    [routes],
  );

  const showFormsSubareaMenu = useMemo(
    () =>
      formsBreadcrumbIndex >= 0 &&
      pathname.includes('/formularios'),
    [formsBreadcrumbIndex, pathname],
  );

  const documentsBreadcrumbIndex = useMemo(
    () => routes.findIndex((r) => r.value === DOCUMENTS_MODULE_ROUTE_VALUE),
    [routes],
  );

  const showDocumentsSubareaMenu = useMemo(
    () =>
      documentsBreadcrumbIndex >= 0 &&
      pathname === COMPANY_HOME_PATHNAME &&
      query.stage === CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
    [documentsBreadcrumbIndex, pathname, query.stage],
  );

  return {
    getRoutePath,
    routes,
    companyBreadcrumbIndex,
    showCompanyAreaMenu,
    characterizationBreadcrumbIndex,
    showCharacterizationSubareaMenu,
    formsBreadcrumbIndex,
    showFormsSubareaMenu,
    documentsBreadcrumbIndex,
    showDocumentsSubareaMenu,
    companyId,
  };
};
