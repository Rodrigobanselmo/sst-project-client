import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, ButtonBase } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
  getCompanyWorkspaceContextualNavItemSx,
  getCompanyWorkspaceContextualNavMarkerSx,
} from 'components/organisms/main/CompanyFlow/company-workspace-contextual-nav.styles';
import { COMPANY_FLOW_STICKY_SUBHEADER_Z_INDEX } from 'components/organisms/main/CompanyFlow/company-flow-layout.constants';
import {
  getCompanyWorkspaceContextualNavItems,
  resolveCompanyWorkspaceContextualActiveId,
  type CompanyWorkspaceContextualNavGroup,
} from 'core/constants/company-primary-navigation.constants';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';

type Props = {
  companyId?: string;
};

/**
 * Navegação contextual rápida do workspace da empresa.
 * Independente de Detalhes e de Mostrar/Ocultar cards.
 */
export function CompanyWorkspaceContextualNav({ companyId }: Props) {
  const router = useRouter();
  const { workspaceId: tabWorkspaceId } = useTabWorkspaceId();
  const effectiveCompanyId =
    companyId || (router.query.companyId as string | undefined) || '';

  if (!effectiveCompanyId) return null;

  const items = getCompanyWorkspaceContextualNavItems({
    companyId: effectiveCompanyId,
    tabWorkspaceId: tabWorkspaceId || undefined,
  });

  const activeId = resolveCompanyWorkspaceContextualActiveId({
    pathname: router.pathname,
    asPath: router.asPath,
    companyId: effectiveCompanyId,
    stage: typeof router.query.stage === 'string' ? router.query.stage : null,
  });

  const itemSx = getCompanyWorkspaceContextualNavItemSx();

  const renderGroup = (group: CompanyWorkspaceContextualNavGroup) => {
    const groupItems = items.filter((item) => item.group === group);
    return groupItems.map((item) => {
      const isActive = item.id === activeId;
      return (
        <ButtonBase
          key={item.id}
          component={NextLink}
          href={item.href}
          disableRipple
          data-nav-id={item.id}
          data-nav-active={isActive ? 'true' : 'false'}
          aria-current={isActive ? 'page' : undefined}
          sx={itemSx}
        >
          <Box component="span" data-nav-label>
            {item.label}
          </Box>
          <Box
            component="span"
            aria-hidden
            data-nav-marker
            data-nav-marker-active={isActive ? 'true' : 'false'}
            sx={getCompanyWorkspaceContextualNavMarkerSx(isActive)}
          />
        </ButtonBase>
      );
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        // Acima do subheader sticky das abas internas (z-index 10), sem alterar as abas.
        zIndex: COMPANY_FLOW_STICKY_SUBHEADER_Z_INDEX + 1,
        width: '100%',
        overflowX: 'auto',
        overflowY: 'visible',
        pb: 0.25,
        scrollbarWidth: 'thin',
        bgcolor: 'transparent',
      }}
    >
      <SFlex
        align="center"
        gap={1.25}
        sx={{ minWidth: 'max-content', py: 0.5 }}
      >
        {renderGroup('management')}
        <Box
          aria-hidden
          data-testid="company-workspace-nav-group-separator"
          sx={{
            width: '2px',
            alignSelf: 'center',
            height: 28,
            mx: 2,
            bgcolor: 'grey.400',
            borderRadius: 1,
            flexShrink: 0,
            opacity: 0.9,
          }}
        />
        {renderGroup('operations')}
      </SFlex>
    </Box>
  );
}
