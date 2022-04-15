import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { brandNameConstant } from '../../../../core/constants/brand.constant';
import { useSidebarDrawer } from '../../../../core/contexts/SidebarContext';

export function Location(): JSX.Element {
  const { isTablet } = useSidebarDrawer();
  const { asPath, query } = useRouter();
  const { data: company } = useQueryCompany();

  const companyId = query.companyId as string;

  const routes = asPath
    .split('?')[0]
    .split('/')
    .filter((route) => route)
    .map((route) => (route === companyId ? company?.name ?? 'empresa' : route));

  const routesToMap = [...routes];

  if (routes.length <= 1) {
    routesToMap.unshift(brandNameConstant.toLowerCase());
  }

  const handleChangeRoute = (route: string, index: number) => {
    if (companyId && (route === 'empresa' || route === company?.name))
      return `/${routes.slice(0, index).join('/')}/${companyId}`;

    return `/${routes.slice(0, index + 1).join('/')}`;
  };

  return (
    <Box>
      <Typography color="text.main" fontSize={['18px', '20px', '22px']}>
        Dashboard
      </Typography>
      {!isTablet && (
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            marginTop: -3,
          }}
          separator={
            <NavigateNextIcon
              sx={{ color: 'gray.500', ml: -2, mr: -4, fontSize: '20px' }}
            />
          }
        >
          {routesToMap.map((route, index) => {
            return (
              <NextLink
                key={index}
                href={handleChangeRoute(route, index)}
                passHref
              >
                <Link fontSize="0.875rem" color="gray.500" underline="hover">
                  {route}
                </Link>
              </NextLink>
            );
          })}
        </Breadcrumbs>
      )}
    </Box>
  );
}
