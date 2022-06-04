/* eslint-disable @typescript-eslint/no-empty-function */
import { Stack } from '@mui/material';

import { useAccess } from 'core/hooks/useAccess';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { Drawer_Links } from '../constants';
import { LogoNavbar } from '../Logo';
import { NavLink } from '../NavLink';
import { NavSection } from '../NavSection';
import { SearchBox } from '../SearchBox';
import { BoxContainerStyled, BoxSectionStyled } from './styles';

export function SideBarNav(): JSX.Element {
  const { isTablet, open, close } = useSidebarDrawer();
  const { isValidRoles } = useAccess();

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
          {Drawer_Links.map((category) => {
            if (!isValidRoles(category.data?.roles)) return null;

            return (
              <NavSection key={category.data.id} title={category.data.text}>
                {category.items.map((item) => {
                  if (!isValidRoles(item?.roles)) return null;

                  return (
                    <NavLink
                      key={item.id}
                      href={item.href}
                      icon={item.Icon}
                      text={item.text}
                      description={item.description}
                      shouldMatchExactHref={item.shouldMatchExactHref}
                    />
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
