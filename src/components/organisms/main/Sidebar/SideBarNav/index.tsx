/* eslint-disable @typescript-eslint/no-empty-function */
import { Stack } from '@mui/material';
import { useRouter } from 'next/router';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

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
  const { query } = useRouter();
  const effectiveCompanyId = companyId || userCompanyId || '';

  const resolveHref = (href?: string) =>
    href
      ?.replace(':companyId', effectiveCompanyId)
      ?.replace(':stage', (query.stage as string) || '0') || '';

  const resolveActivePrefix = (activePrefix?: string) =>
    activePrefix
      ?.replace(':companyId', effectiveCompanyId)
      ?.replace(':stage', (query.stage as string) || '0') || undefined;

  const renderSubItems = (items?: IDrawerItems[]) =>
    items?.map((child) => (
      <NavLink
        isAlwaysClose={isAlwaysClose}
        image={child.image}
        imageType={child.imageType}
        key={child.text}
        deep={1}
        onClick={child.onClick}
        activePrefix={resolveActivePrefix(child.activePrefix)}
        href={resolveHref(child.href)}
        icon={child.Icon}
        text={child.text}
        canOpen={Boolean(child.items?.length && !child.alwaysShowSubItems)}
        showSubItemsAlways={child.alwaysShowSubItems}
        description={child.description}
        shouldMatchExactHref={child.shouldMatchExactHref}
      >
        {child.items?.map((grandChild) => (
          <NavLink
            isAlwaysClose={isAlwaysClose}
            image={grandChild.image}
            imageType={grandChild.imageType}
            key={grandChild.text}
            deep={2}
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
            return (
              <NavSection key={category.data.text} title={category.data.text}>
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
