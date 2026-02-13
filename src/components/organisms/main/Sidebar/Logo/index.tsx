import { RiCloseFill, RiMenu3Fill } from 'react-icons/ri';

import { Box, Icon, Typography, useTheme } from '@mui/material';

import { useAuth } from 'core/contexts/AuthContext';
import { useFetchVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/hooks/useFetchVisualIdentity';
import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import SIconButton from '../../../../atoms/SIconButton';
import { STStack, STTypography, STLogoSimple, STCompanyLogo } from './styles';

export function LogoNavbar(): JSX.Element {
  const { isOpen, open, close, setAlwaysOpen, alwaysOpen, isTablet } =
    useSidebarDrawer();
  const { user } = useAuth();
  const { visualIdentity } = useFetchVisualIdentity({
    companyId: user?.companyId || '',
  });

  const hasCustomIdentity =
    visualIdentity?.visualIdentityEnabled && visualIdentity?.shortName;
  // Prioriza customLogoUrl, depois logoUrl
  const customLogo =
    visualIdentity?.visualIdentityEnabled &&
    (visualIdentity?.customLogoUrl || visualIdentity?.logoUrl);

  return (
    <STStack direction="row">
      {customLogo ? (
        <STCompanyLogo
          src={visualIdentity.customLogoUrl || visualIdentity.logoUrl!}
          alt={visualIdentity.shortName || 'Logo'}
          onClick={isOpen ? close : open}
        />
      ) : (
        <STLogoSimple onClick={isOpen ? close : open} />
      )}
      {hasCustomIdentity ? (
        <Box
          onClick={isOpen ? close : open}
          sx={{
            ml: 2,
            cursor: 'pointer',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <Typography
            fontSize={20}
            fontWeight="500"
            noWrap
            sx={{
              maxWidth: 160,
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.5s ease',
              transitionDelay: isOpen ? '0.5s' : '0',
              color: 'grey.100',
            }}
          >
            {visualIdentity.shortName}
          </Typography>
        </Box>
      ) : (
        <STTypography
          onClick={isOpen ? close : open}
          ml={2}
          align="left"
          noWrap
        >
          Simple
          <Typography
            color={'primary.main'}
            fontSize={24}
            fontWeight="bold"
            ml={1}
            component="span"
          >
            SST
          </Typography>
        </STTypography>
      )}
      <SIconButton
        color="info"
        onClick={() => (isTablet ? close() : setAlwaysOpen(!alwaysOpen))}
      >
        <Icon
          component={alwaysOpen ? RiCloseFill : RiMenu3Fill}
          sx={{
            opacity: isOpen ? '1' : '0',
            transition: 'opacity 0.5s ease',
            transitionDelay: isOpen ? '0.5s' : '0',
            alignSelf: 'center',
            fontSize: '20',
            color: 'grey.400',
          }}
        />
      </SIconButton>
    </STStack>
  );
}
