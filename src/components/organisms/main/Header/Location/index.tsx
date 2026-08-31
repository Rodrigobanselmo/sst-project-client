import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { isCompanyFlowPathname } from 'core/constants/company-breadcrumb.constants';
import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import { useTheme } from '@mui/material/styles';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { CharacterizationBreadcrumbSubareaMenu } from './components/CharacterizationBreadcrumbSubareaMenu';
import { CompanyBreadcrumbAreaMenu } from './components/CompanyBreadcrumbAreaMenu';
import { DocumentsBreadcrumbSubareaMenu } from './components/DocumentsBreadcrumbSubareaMenu';
import { FormsBreadcrumbSubareaMenu } from './components/FormsBreadcrumbSubareaMenu';
import { useLocation } from './hooks/useLocation';

export function Location(): JSX.Element {
  const { pathname } = useRouter();
  const { isTablet } = useSidebarDrawer();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const isCompanyFlow = isCompanyFlowPathname(pathname);
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

  if (isTablet || (isCompanyFlow && !routes.some((r) => r.name))) {
    return <Box />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
      <Breadcrumbs
        aria-label="breadcrumb"
        maxItems={8}
        itemsBeforeCollapse={2}
        itemsAfterCollapse={1}
        sx={{
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap',
          },
          ...(companyBreadcrumbIndex >= 0 && {
            '& .MuiBreadcrumbs-li [data-breadcrumb-emphasis="context"], & .MuiBreadcrumbs-li [data-breadcrumb-emphasis="context"] .MuiLink-root, & .MuiBreadcrumbs-li [data-breadcrumb-emphasis="context"] .MuiTypography-root':
              {
                color: 'text.main',
                fontWeight: 500,
              },
            '& .MuiBreadcrumbs-li [data-breadcrumb-emphasis="active"], & .MuiBreadcrumbs-li [data-breadcrumb-emphasis="active"] .MuiLink-root, & .MuiBreadcrumbs-li [data-breadcrumb-emphasis="active"] .MuiTypography-root':
              {
                color: isLight ? 'text.primary' : 'primary.main',
                fontWeight: 700,
              },
          }),
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
                      color: 'inherit',
                      opacity: 0.72,
                      ml: -2,
                      mr: -4,
                      fontSize: '20px',
                    }}
                  />
                )
              ) : null;

            const label =
              route.name.length > 20
                ? `${route.name.slice(0, 20)}...`
                : route.name;
            const isClickable = Boolean(route.action);
            const isCompanyWorkspace = companyBreadcrumbIndex >= 0;
            const isActiveNav =
              isCompanyWorkspace && index > companyBreadcrumbIndex;
            const itemColor = isCompanyWorkspace
              ? isActiveNav
                ? isLight
                  ? 'text.primary'
                  : 'primary.main'
                : 'text.main'
              : 'inherit';
            const itemWeight = isCompanyWorkspace && isActiveNav ? 700 : 500;

            return (
              <SFlex
                align="center"
                gap={3}
                key={`${route.value}-${index}`}
                data-breadcrumb-emphasis={
                  isCompanyWorkspace
                    ? isActiveNav
                      ? 'active'
                      : 'context'
                    : undefined
                }
              >
                {separator}
                {isClickable ? (
                  <NextLink href={'/' + getRoutePath(route, index)} passHref>
                    <Link underline="hover" sx={{ color: 'inherit' }}>
                      <SText
                        sx={{ textTransform: 'capitalize' }}
                        fontSize="0.825rem"
                        fontWeight={itemWeight}
                        color={itemColor}
                      >
                        {label}
                      </SText>
                    </Link>
                  </NextLink>
                ) : (
                  <SText
                    sx={{ textTransform: 'capitalize' }}
                    fontSize="0.825rem"
                    fontWeight={itemWeight}
                    color={itemColor}
                  >
                    {label}
                  </SText>
                )}
              </SFlex>
            );
          })}
      </Breadcrumbs>
    </Box>
  );
}
