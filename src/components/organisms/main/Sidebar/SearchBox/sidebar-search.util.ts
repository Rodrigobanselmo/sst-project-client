import {
  ASSISTENTE_GSE_NAV_LABEL,
  CHARACTERIZATION_AI_PROFILES_NAV_LABEL,
  CHARACTERIZATION_MODULE_LABEL,
  CHARACTERIZATION_SUB_TAB_LABELS,
  CHEMICAL_PRODUCTS_NAV_LABEL,
  CharacterizationSubTabEnum,
  getAssistenteGseHref,
  getCharacterizationAiProfilesHref,
  getCharacterizationSstPath,
  getCharacterizationSubareaNavItems,
  getChemicalProductsHref,
} from 'core/constants/characterization-navigation.constants';
import {
  getDocumentsStagePath,
  getDocumentsSubareaNavItems,
} from 'core/constants/company-breadcrumb.constants';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { DrawerItemsEnum } from '../SideBarNav/hooks/drawer.enum';

export const SIDEBAR_SEARCH_LISTBOX_ID = 'sidebar-search-results';

export const GSE_RESULT_TITLE = 'GSE';
export const GSE_RESULT_TRAIL = 'Grupo Similar de Exposição';

export type SidebarSearchableItem = {
  text: string;
  search?: string;
  description?: string;
  href?: string;
  navId?: DrawerItemsEnum;
  items?: SidebarSearchableItem[];
};

export type SidebarSearchableSection = {
  data: { text: string; search?: string };
  items: SidebarSearchableItem[];
};

export type SidebarSearchFeature = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  keywords: string;
  navId?: DrawerItemsEnum;
};

export function matchesSearchQuery(
  query: string,
  ...fields: Array<string | undefined | null>
): boolean {
  const normalizedQuery = stringNormalize(query).trim();
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const haystack = stringNormalize(fields.filter(Boolean).join(' '));

  return tokens.every((token) => haystack.includes(token));
}

export function flattenDrawerFeatures(
  sections: SidebarSearchableSection[],
  resolveHref: (href?: string) => string | undefined,
): SidebarSearchFeature[] {
  const features: SidebarSearchFeature[] = [];

  const walk = (item: SidebarSearchableItem, trail: string[]) => {
    const href = resolveHref(item.href);
    const path = [...trail, item.text];

    if (href) {
      features.push({
        id: `nav:${item.navId ?? path.join('/')}:${href}`,
        title: item.text,
        subtitle: trail.length ? trail.join(' › ') : undefined,
        href,
        navId: item.navId,
        keywords: [item.text, item.description, item.search, ...trail]
          .filter(Boolean)
          .join(' '),
      });
    }

    item.items?.forEach((child) => walk(child, path));
  };

  sections.forEach((section) => {
    section.items.forEach((item) => walk(item, [section.data.text]));
  });

  return features;
}

export function collectVisibleNavIds(
  features: Array<{ navId?: DrawerItemsEnum }>,
): Set<DrawerItemsEnum> {
  const ids = new Set<DrawerItemsEnum>();
  features.forEach((feature) => {
    if (feature.navId) ids.add(feature.navId);
  });
  return ids;
}

export function buildDeepFeatures(params: {
  companyId: string;
  tabWorkspaceId?: string;
  visibleNavIds: Set<DrawerItemsEnum>;
}): SidebarSearchFeature[] {
  const { companyId, tabWorkspaceId, visibleNavIds } = params;
  if (!companyId) return [];

  const features: SidebarSearchFeature[] = [];
  const canSeeCharacterization = visibleNavIds.has(
    DrawerItemsEnum.companyManagementCharacterization,
  );
  const canSeeDocuments = visibleNavIds.has(
    DrawerItemsEnum.companyManagementDocuments,
  );

  if (canSeeCharacterization) {
    getCharacterizationSubareaNavItems().forEach((item) => {
      if (item.kind === 'tab') {
        const query = new URLSearchParams({
          active: String(item.tab),
        });
        if (tabWorkspaceId) query.set('tabWorkspaceId', tabWorkspaceId);

        const isGse = item.tab === CharacterizationSubTabEnum.GSE;
        const title = isGse
          ? GSE_RESULT_TITLE
          : CHARACTERIZATION_SUB_TAB_LABELS[item.tab];
        const trail = isGse
          ? GSE_RESULT_TRAIL
          : CHARACTERIZATION_SUB_TAB_LABELS[item.tab];

        features.push({
          id: `deep:characterization:${item.tab}`,
          title,
          subtitle: `${CHARACTERIZATION_MODULE_LABEL} › ${trail}`,
          href: `${getCharacterizationSstPath(companyId)}?${query.toString()}`,
          navId: DrawerItemsEnum.companyManagementCharacterization,
          keywords: [
            title,
            trail,
            CHARACTERIZATION_MODULE_LABEL,
            isGse
              ? 'gse gho grupos similares grupo similar exposicao homogeneos similidares'
              : '',
          ].join(' '),
        });
        return;
      }

      if (item.id === 'chemical-products') {
        features.push({
          id: 'deep:chemical-products',
          title: CHEMICAL_PRODUCTS_NAV_LABEL,
          subtitle: `${CHARACTERIZATION_MODULE_LABEL} › ${CHEMICAL_PRODUCTS_NAV_LABEL}`,
          href: getChemicalProductsHref({ companyId, tabWorkspaceId }),
          navId: DrawerItemsEnum.companyManagementCharacterization,
          keywords: `${CHEMICAL_PRODUCTS_NAV_LABEL} ${CHARACTERIZATION_MODULE_LABEL} quimicos`,
        });
      }

      if (item.id === 'assistente-gse') {
        features.push({
          id: 'deep:assistente-gse',
          title: ASSISTENTE_GSE_NAV_LABEL,
          subtitle: `${CHARACTERIZATION_MODULE_LABEL} › ${ASSISTENTE_GSE_NAV_LABEL}`,
          href: getAssistenteGseHref({ companyId, tabWorkspaceId }),
          navId: DrawerItemsEnum.companyManagementCharacterization,
          keywords: `${ASSISTENTE_GSE_NAV_LABEL} ${CHARACTERIZATION_MODULE_LABEL} gse gho`,
        });
      }

      if (item.id === 'characterization-ai-profiles') {
        features.push({
          id: 'deep:characterization-ai',
          title: CHARACTERIZATION_AI_PROFILES_NAV_LABEL,
          subtitle: `${CHARACTERIZATION_MODULE_LABEL} › ${CHARACTERIZATION_AI_PROFILES_NAV_LABEL}`,
          href: getCharacterizationAiProfilesHref({
            companyId,
            tabWorkspaceId,
          }),
          navId: DrawerItemsEnum.companyManagementCharacterization,
          keywords: `${CHARACTERIZATION_AI_PROFILES_NAV_LABEL} ${CHARACTERIZATION_MODULE_LABEL} ia`,
        });
      }
    });
  }

  if (canSeeDocuments) {
    getDocumentsSubareaNavItems().forEach((item) => {
      features.push({
        id: `deep:documents:${item.active}`,
        title: item.label,
        subtitle: `Programas e Laudos › ${item.label}`,
        href: getDocumentsStagePath(companyId, item.active, tabWorkspaceId),
        navId: DrawerItemsEnum.companyManagementDocuments,
        keywords: `${item.label} programas laudos`,
      });
    });
  }

  return features;
}

export function mergeSearchFeatures(
  drawerFeatures: SidebarSearchFeature[],
  deepFeatures: SidebarSearchFeature[],
): SidebarSearchFeature[] {
  const seen = new Set<string>();
  const merged: SidebarSearchFeature[] = [];

  [...drawerFeatures, ...deepFeatures].forEach((feature) => {
    const key = `${feature.id}|${feature.href}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(feature);
  });

  return merged;
}

export function rankFeatureMatch(
  feature: SidebarSearchFeature,
  query: string,
): number {
  const normalizedQuery = stringNormalize(query).trim();
  const title = stringNormalize(feature.title);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const isGseAliasQuery =
    tokens.some((token) => token === 'gse' || token === 'gho') ||
    (normalizedQuery.includes('grupo') &&
      normalizedQuery.includes('similar'));

  if (
    isGseAliasQuery &&
    feature.id === `deep:characterization:${CharacterizationSubTabEnum.GSE}`
  ) {
    return 0;
  }

  if (title === normalizedQuery) return 1;
  if (title.startsWith(normalizedQuery)) return 2;
  if (title.includes(normalizedQuery)) return 3;
  return 4;
}

export function filterSearchFeatures(
  features: SidebarSearchFeature[],
  query: string,
): SidebarSearchFeature[] {
  return features
    .filter((feature) =>
      matchesSearchQuery(query, feature.title, feature.subtitle, feature.keywords),
    )
    .sort(
      (a, b) =>
        rankFeatureMatch(a, query) - rankFeatureMatch(b, query) ||
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }),
    );
}

export function getSearchOptionId(index: number): string {
  return `${SIDEBAR_SEARCH_LISTBOX_ID}-option-${index}`;
}

export function moveActiveIndex(
  current: number,
  delta: number,
  length: number,
): number {
  if (length <= 0) return 0;
  const next = current + delta;
  if (next < 0) return 0;
  if (next > length - 1) return length - 1;
  return next;
}
