import { useState } from 'react';

import CircleIcon from '@mui/icons-material/Circle';
import { styled, Typography, Box, Icon, Link } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { SActiveLink } from '../../../../atoms/SActiveLink';
import { LinkStyle, StyledNavImage } from './styles';
import { INavLinkProps } from './types';

const SText = styled(Typography)``;

export function NavLink({
  href,
  activePrefix,
  image,
  icon,
  text,
  description,
  shouldMatchExactHref,
  isAlwaysClose,
  imageType,
  onClick,
  children,
  canOpen,
  showSubItemsAlways,
  deep,
  ...rest
}: INavLinkProps): JSX.Element {
  const { isOpen } = useSidebarDrawer();
  const [open, setOpen] = useState(false);
  const shouldShowChildren = showSubItemsAlways || open;

  return (
    <>
      <Box maxWidth={!isAlwaysClose ? '100%' : '70px'}>
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
            activePrefix={activePrefix}
            passHref
            onClick={onClick}
            canOpen={canOpen}
            isOpen={shouldShowChildren}
            {...(canOpen && {
              onClick: (e) => {
                setOpen(!open);
                onClick?.(e);
              },
            })}
          >
            <LinkStyle
              py="0.45rem"
              px={8}
              sx={deep === 2 ? { pl: isOpen ? 24 : 16 } : undefined}
              {...rest}
            >
              {(icon || deep) && (
                <Icon
                  component={icon}
                  sx={{
                    fontSize: 20,
                    alignSelf: 'center',
                    ml: isOpen ? 0 : 2,
                    ...(deep === 1 && {
                      fontSize: 6,
                      ml: isOpen ? 0 : 4,
                    }),
                    ...(deep === 2 && {
                      fontSize: 6,
                      ml: isOpen ? 0 : 6,
                    }),
                  }}
                  {...(deep && { component: CircleIcon })}
                />
              )}
              {image && (
                <StyledNavImage
                  type={imageType}
                  alt={description}
                  src={image}
                  open={isOpen ? 1 : 0}
                />
              )}
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
      {shouldShowChildren && children}
    </>
  );
}
