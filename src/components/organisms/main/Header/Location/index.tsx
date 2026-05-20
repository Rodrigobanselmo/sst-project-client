import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import NextLink from 'next/link';

import { CharacterizationBreadcrumbSubareaMenu } from './components/CharacterizationBreadcrumbSubareaMenu';
import { CompanyBreadcrumbAreaMenu } from './components/CompanyBreadcrumbAreaMenu';
import { DocumentsBreadcrumbSubareaMenu } from './components/DocumentsBreadcrumbSubareaMenu';
import { FormsBreadcrumbSubareaMenu } from './components/FormsBreadcrumbSubareaMenu';
import { useLocation } from './hooks/useLocation';

export function Location(): JSX.Element {
  const { isTablet } = useSidebarDrawer();
  const {
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
  } = useLocation();

  return (
    <Box>
      <Typography color="text.main" fontSize={['18px', '20px', '22px']}>
        Dashboard
      </Typography>
      {!isTablet && (
        <Breadcrumbs
          aria-label="breadcrumb"
          maxItems={8}
          itemsBeforeCollapse={2}
          itemsAfterCollapse={1}
          sx={{
            marginTop: -3,
          }}
          separator={false}
        >
          {routes.map((route, index) => {
            if (!route.name) return null;
            if (
              route.name.substring(0, 1) == '[' &&
              route.name.substring(route.name.length - 1) == ']'
            )
              return null;

            const prevIndex = index - 1;
            const separator =
              index > 0 ? (
                showCompanyAreaMenu && prevIndex === companyBreadcrumbIndex ? (
                  <CompanyBreadcrumbAreaMenu
                    key={`company-area-menu-${index}`}
                    companyId={companyId}
                  />
                ) : showCharacterizationSubareaMenu &&
                  prevIndex === characterizationBreadcrumbIndex ? (
                  <CharacterizationBreadcrumbSubareaMenu
                    key={`characterization-subarea-menu-${index}`}
                    companyId={companyId}
                  />
                ) : showDocumentsSubareaMenu &&
                  prevIndex === documentsBreadcrumbIndex ? (
                  <DocumentsBreadcrumbSubareaMenu
                    key={`documents-subarea-menu-${index}`}
                    companyId={companyId}
                  />
                ) : showFormsSubareaMenu && prevIndex === formsBreadcrumbIndex ? (
                  <FormsBreadcrumbSubareaMenu
                    key={`forms-subarea-menu-${index}`}
                    companyId={companyId}
                  />
                ) : (
                  <NavigateNextIcon
                    key={`breadcrumb-sep-${index}`}
                    sx={{
                      color: 'gray.500',
                      ml: -2,
                      mr: -4,
                      fontSize: '20px',
                    }}
                  />
                )
              ) : null;

            return (
              <SFlex align="center" gap={3} key={`${route.value}-${index}`}>
                {separator}
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
