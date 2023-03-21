/* eslint-disable @typescript-eslint/no-empty-function */
import { Stack } from '@mui/material';
import { useRouter } from 'next/router';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { LogoNavbar } from '../Logo';
import { NavLink } from '../NavLink';
import { NavSection } from '../NavSection';
import { SearchBox } from '../SearchBox';
import { useDrawerItems } from './hooks/useDrawerItems';
import { BoxContainerStyled, BoxSectionStyled } from './styles';

export function SideBarNav(): JSX.Element {
  const { isTablet, open, close, isAlwaysClose } = useSidebarDrawer();
  const { userCompanyId } = useGetCompanyId();
  const { sections } = useDrawerItems();
  const { query } = useRouter();

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
                      href={
                        item?.href
                          ?.replace(':companyId', userCompanyId || '')
                          ?.replace(':stage', (query.stage as string) || '0') ||
                        ''
                      }
                      icon={item.Icon}
                      text={item.text}
                      canOpen={item.items && item.items?.length > 0}
                      description={item.description}
                      shouldMatchExactHref={item.shouldMatchExactHref}
                    >
                      {item.items &&
                        item.items.map((item) => {
                          return (
                            <NavLink
                              isAlwaysClose={isAlwaysClose}
                              image={item.image}
                              imageType={item.imageType}
                              key={item.text}
                              deep={1}
                              onClick={item.onClick}
                              href={
                                item?.href?.replace(
                                  ':companyId',
                                  userCompanyId || '',
                                ) || ''
                              }
                              icon={item.Icon}
                              text={item.text}
                              description={item.description}
                              shouldMatchExactHref={item.shouldMatchExactHref}
                            />
                          );
                        })}
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
