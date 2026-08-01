/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect, useMemo } from 'react';

import { Stack } from '@mui/material';
import { useRouter } from 'next/router';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  type SidebarSectionId,
  useSidebarSectionExpansion,
} from 'core/hooks/useSidebarSectionExpansion';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { LogoNavbar } from '../Logo';
import { NavLink } from '../NavLink';
import { NavSection } from '../NavSection';
import { SearchBox } from '../SearchBox';
import { IDrawerItems, useDrawerItems } from './hooks/useDrawerItems';
import { BoxContainerStyled, BoxSectionStyled } from './styles';

export function SideBarNav(): JSX.Element {
  const { isTablet, open, close, isAlwaysClose } = useSidebarDrawer();
  const { companyId, userCompanyId } = useGetCompanyId();
  const { sections } = useDrawerItems();
  const {
    hydrated,
    isExpanded,
    toggleExpanded,
    ensureExpanded,
  } = useSidebarSectionExpansion();
  const router = useRouter();
  const { query } = router;
  const effectiveCompanyId = companyId || userCompanyId || '';

  const resolveHref = (href?: string) => {
    if (!href) return undefined;

    // Sem empresa efetiva: não materializa rotas quebradas com companyId vazio.
    if (!effectiveCompanyId && href.includes(':companyId')) {
      return undefined;
    }

    return (
      href
        .replace(':companyId', effectiveCompanyId)
        // Default canônico (Dados da Empresa) — evita stage inválido "0".
        .replace(':stage', (query.stage as string) || 'empresa') || undefined
    );
  };

  const currentPath = router.asPath.split('?')[0];

  const resolveActivePrefix = (activePrefix?: string) =>
    activePrefix
      ?.replace(':companyId', effectiveCompanyId)
      // Alinha com resolveHref: fallback canônico é "empresa", não "0".
      ?.replace(':stage', (query.stage as string) || 'empresa') || undefined;

  const isItemOrDescendantActive = (item: IDrawerItems): boolean => {
    const itemHref = resolveHref(item.href);
    const itemPrefix = resolveActivePrefix(item.activePrefix);

    if (itemPrefix && currentPath.startsWith(itemPrefix.split('?')[0])) {
      return true;
    }
    if (itemHref && currentPath.startsWith(itemHref.split('?')[0])) {
      return true;
    }

    return item.items?.some(isItemOrDescendantActive) ?? false;
  };

  const shouldExpandSubItems = (items?: IDrawerItems[]) =>
    items?.some(isItemOrDescendantActive) ?? false;

  /**
   * Seções que contêm a rota ativa. Dependência estável por ids — permite
   * o usuário recolher na mesma rota sem a auto-expansão reabrir na hora;
   * refresh / URL direta / troca de rota continuam forçando abertura.
   */
  const activeCollapsibleSectionIds = useMemo(() => {
    const ids: SidebarSectionId[] = [];
    for (const category of sections) {
      const sectionId = category.data.id;
      if (!sectionId || category.data.standalone) continue;
      if (category.items.some(isItemOrDescendantActive)) {
        ids.push(sectionId);
      }
    }
    return ids.join(',');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, currentPath, effectiveCompanyId, query.stage]);

  useEffect(() => {
    if (!hydrated || !activeCollapsibleSectionIds) return;

    for (const id of activeCollapsibleSectionIds.split(',')) {
      ensureExpanded(id as SidebarSectionId);
    }
  }, [hydrated, activeCollapsibleSectionIds, ensureExpanded]);

  const renderSubItems = (items?: IDrawerItems[]) =>
    items?.map((child) => (
      <NavLink
        isAlwaysClose={isAlwaysClose}
        image={child.image}
        imageType={child.imageType}
        key={child.text}
        onClick={child.onClick}
        activePrefix={resolveActivePrefix(child.activePrefix)}
        href={resolveHref(child.href)}
        icon={child.Icon}
        text={child.text}
        isMenuPeer
        expandToggleOffset={false}
        canOpen={Boolean(child.items?.length)}
        forceShowSubItems={shouldExpandSubItems(child.items)}
        description={child.description}
        shouldMatchExactHref={child.shouldMatchExactHref}
      >
        {child.items?.map((grandChild) => (
          <NavLink
            isAlwaysClose={isAlwaysClose}
            image={grandChild.image}
            imageType={grandChild.imageType}
            key={grandChild.text}
            deep={1}
            onClick={grandChild.onClick}
            activePrefix={resolveActivePrefix(grandChild.activePrefix)}
            href={resolveHref(grandChild.href)}
            icon={grandChild.Icon}
            text={grandChild.text}
            description={grandChild.description}
            shouldMatchExactHref={grandChild.shouldMatchExactHref}
          />
        ))}
      </NavLink>
    ));

  return (
    <BoxContainerStyled
      onMouseEnter={isTablet ? () => {} : open}
      onMouseLeave={isTablet ? () => {} : close}
      py={12}
    >
      <Stack mb={0} px={8} spacing={4}>
        <LogoNavbar />
        <SearchBox />
      </Stack>
      <BoxSectionStyled pt={10}>
        <Stack px={0} spacing={8}>
          {sections.map((category) => {
            if (category.items.length === 0) return null;

            const sectionId = category.data.id;
            const standalone = Boolean(category.data.standalone);
            const collapsible = Boolean(sectionId) && !standalone;
            const sectionKey = standalone
              ? `standalone-${category.data.text}`
              : sectionId || category.data.text;

            return (
              <NavSection
                key={sectionKey}
                title={category.data.text}
                hideTitle={standalone}
                collapsible={collapsible}
                sectionId={sectionId}
                expanded={sectionId ? isExpanded(sectionId) : true}
                onToggleExpand={
                  sectionId ? () => toggleExpanded(sectionId) : undefined
                }
              >
                {category.items.map((item) => {
                  if (item.items && item.items.length === 0) return null;

                  return (
                    <NavLink
                      isAlwaysClose={isAlwaysClose}
                      image={item.image}
                      imageType={item.imageType}
                      key={item.text}
                      onClick={item.onClick}
                      activePrefix={resolveActivePrefix(item.activePrefix)}
                      href={resolveHref(item.href)}
                      icon={item.Icon}
                      text={item.text}
                      canOpen={Boolean(item.items?.length)}
                      forceShowSubItems={shouldExpandSubItems(item.items)}
                      expandToggleOffset={false}
                      description={item.description}
                      shouldMatchExactHref={item.shouldMatchExactHref}
                    >
                      {renderSubItems(item.items)}
                    </NavLink>
                  );
                })}
              </NavSection>
            );
          })}
        </Stack>
      </BoxSectionStyled>
    </BoxContainerStyled>
  );
}
