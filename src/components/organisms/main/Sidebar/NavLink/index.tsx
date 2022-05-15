import { styled, Typography, Box, Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { SActiveLink } from '../../../../atoms/SActiveLink';
import { LinkStyle } from './styles';
import { INavLinkProps } from './types';

const SText = styled(Typography)``;

export function NavLink({
  href,
  icon,
  text,
  description,
  shouldMatchExactHref,
  ...rest
}: INavLinkProps): JSX.Element {
  const { isOpen } = useSidebarDrawer();
  return (
    <Box>
      <STooltip
        withWrapper
        title={description}
        placement="right"
        enterDelay={700}
        arrow
      >
        <SActiveLink
          shouldMatchExactHref={shouldMatchExactHref}
          href={href}
          passHref
        >
          <LinkStyle py="0.45rem" px={8} {...rest}>
            <Icon
              component={icon}
              sx={{ fontSize: 20, alignSelf: 'center', ml: isOpen ? 0 : 2 }}
            />
            <Box>
              <SText
                ml={8}
                fontSize={'0.875rem'}
                fontWeight="medium"
                align="left"
                sx={{
                  width: '11.8rem',
                  height: isOpen ? 'fit-content' : '6',
                  opacity: isOpen ? '1' : '0',
                  transition: 'all 0.5s ease-in-out',
                }}
              >
                {text}
              </SText>
            </Box>
          </LinkStyle>
        </SActiveLink>
      </STooltip>
    </Box>
  );
}
