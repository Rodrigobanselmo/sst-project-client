/* eslint-disable @typescript-eslint/no-empty-function */
import { Stack } from '@mui/material';

import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { Drawer_Links } from '../constants';
import { LogoNavbar } from '../Logo';
import { NavLink } from '../NavLink';
import { NavSection } from '../NavSection';
import { SearchBox } from '../SearchBox';
import { BoxContainerStyled, BoxSectionStyled } from './styles';

export function SideBarNav(): JSX.Element {
  const { isTablet, open, close, isAlwaysClose } = useSidebarDrawer();
  const { isValidRoles, isToRemoveWithRoles } = useAccess();
  const { userCompanyId } = useGetCompanyId();
  const { data: company } = useQueryCompany(userCompanyId);

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
            if (isToRemoveWithRoles(category.data?.removeWithRoles))
              return null;

            return (
              <NavSection key={category.data.id} title={category.data.text}>
                {category.items.map((item) => {
                  if (!isValidRoles(item?.roles)) return null;
                  if (isToRemoveWithRoles(item?.removeWithRoles)) return null;
                  if (item.showIf) {
                    let show = false;
                    // eslint-disable-next-line prettier/prettier
                    if (!show) show = !!(item.showIf.isClinic && company.isClinic);
                    // eslint-disable-next-line prettier/prettier
                    if (!show)  show = !!(item.showIf.isConsulting && company.isConsulting );
                    // eslint-disable-next-line prettier/prettier
                    if (!show) show = !!(item.showIf.isCompany && !company.isConsulting && !company.isClinic );

                    if (!show) return null;
                  }

                  return (
                    <NavLink
                      isAlwaysClose={isAlwaysClose}
                      image={item.image}
                      key={item.id}
                      href={item.href.replace(
                        ':companyId',
                        userCompanyId || '',
                      )}
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
