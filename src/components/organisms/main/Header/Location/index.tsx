import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import SText from 'components/atoms/SText';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { brandNameConstant } from '../../../../../core/constants/brand.constant';
import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';

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

  const handleChangeRoute = (index: number) => {
    const route = routes.slice(0, index + 1).join('/');
    console.log(route.replace(company?.name || 'empresa', companyId || ''));

    return `/${route.replace(company?.name || 'empresa', companyId || '')}`;
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
            if (route.split('-').length > 2) return null;
            return (
              <NextLink key={index} href={handleChangeRoute(index)} passHref>
                <Link underline="hover">
                  <SText
                    sx={{ textTransform: 'capitalize' }}
                    maxWidth="150px"
                    fontSize="0.825rem"
                    color="gray.500"
                    lineNumber={1}
                  >
                    {route}
                  </SText>
                </Link>
              </NextLink>
            );
          })}
        </Breadcrumbs>
      )}
    </Box>
  );
}
