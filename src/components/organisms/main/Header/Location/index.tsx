import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { SArrowUpFilterIcon } from 'assets/icons/SArrowUpFilterIcon';

import { ICompany } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { brandNameConstant } from '../../../../../core/constants/brand.constant';
import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { useLocation } from './hooks/useLocation';

export function Location(): JSX.Element {
  const { isTablet } = useSidebarDrawer();
  const { getRoutePath, routes } = useLocation();
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
          {routes.map((route, index) => {
            if (!route.name) return null;
            if (
              route.name.substring(0, 1) == '[' &&
              route.name.substring(route.name.length - 1) == ']'
            )
              return null;

            return (
              <SFlex align="center" gap={3} key={index}>
                {/* {route.onDropSelect && (
                  <STagButton
                    sx={{
                      minHeight: '15px',
                      maxHeight: '15px',
                      minWidth: '90px',
                      maxWidth: '90px',
                      // minWidth: '20px',
                      // maxWidth: '20px',
                      p: 0,
                    }}
                    onClick={() => route?.onDropSelect?.()}
                    iconProps={{
                      sx: {
                        transform: 'rotate(-180deg)',
                        m: 0,
                        p: 0,
                        fontSize: 12,
                      },
                    }}
                    textProps={{
                      sx: {
                        m: 0,
                        p: 0,
                        fontSize: 12,
                      },
                    }}
                    icon={SArrowUpFilterIcon}
                    text={'empresas'}
                  />
                )} */}
                <NextLink href={'/' + getRoutePath(route, index)} passHref>
                  <Link underline="hover">
                    <SText
                      sx={{ textTransform: 'capitalize' }}
                      fontSize="0.825rem"
                      color="gray.500"
                    >
                      {route.name.length > 20
                        ? `${route.name.slice(0, 20)}...`
                        : route.name}
                    </SText>
                  </Link>
                </NextLink>
              </SFlex>
            );
          })}
        </Breadcrumbs>
      )}
    </Box>
  );
}
