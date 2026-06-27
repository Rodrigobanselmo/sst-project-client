import { useEffect, useState } from 'react';

import CircleIcon from '@mui/icons-material/Circle';
import RemoveIcon from '@mui/icons-material/Remove';
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
  forceShowSubItems,
  isMenuPeer,
  expandToggleOffset,
  deep,
  ...rest
}: INavLinkProps): JSX.Element {
  const { isOpen } = useSidebarDrawer();
  const [open, setOpen] = useState(Boolean(forceShowSubItems));

  useEffect(() => {
    if (forceShowSubItems != null) {
      setOpen(forceShowSubItems);
    }
  }, [forceShowSubItems]);

  const shouldShowChildren = open;

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
            expandToggleOffset={expandToggleOffset}
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
              sx={{
                // Recuo progressivo por nível, aplicado apenas com a sidebar
                // aberta para não prejudicar a sidebar recolhida (rail).
                // Nível 1 (Banco de dados): 1rem (padrão do px=8).
                // Nível 2 (isMenuPeer): ~3rem, com marcador bullet (•).
                // Nível 3 (deep): ~4.5rem, com marcador dash (–), claramente
                // mais à direita do pai.
                ...(isMenuPeer && isOpen && { pl: 24 }),
                ...(deep === 1 && { pl: isOpen ? 36 : 16 }),
              }}
              {...rest}
            >
              {(icon || deep) && (
                <Icon
                  component={icon}
                  sx={{
                    fontSize: 20,
                    alignSelf: 'center',
                    ...(isMenuPeer && {
                      width: 20,
                      minWidth: 20,
                      ml: 0,
                    }),
                    ...(!isMenuPeer && {
                      ml: isOpen ? 0 : 2,
                    }),
                    // Nível 2 aberto: bullet discreto no lugar do ícone genérico.
                    ...(isMenuPeer &&
                      isOpen && {
                        fontSize: 8,
                        width: 8,
                        minWidth: 8,
                        ml: 0,
                        color: 'grey.500',
                      }),
                    // Nível 3 recolhido: bullet pequeno (comportamento original).
                    ...(deep === 1 && {
                      fontSize: 6,
                      width: 6,
                      minWidth: 6,
                      ml: isOpen ? 0 : 6,
                    }),
                    // Nível 3 aberto: dash discreto, distinto do bullet do nível 2.
                    ...(deep === 1 &&
                      isOpen && {
                        fontSize: 14,
                        width: 14,
                        minWidth: 14,
                        ml: 0,
                        color: 'grey.500',
                      }),
                  }}
                  {...(isMenuPeer && isOpen && { component: CircleIcon })}
                  {...(deep === 1 && {
                    component: isOpen ? RemoveIcon : CircleIcon,
                  })}
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
                    // Níveis aninhados usam texto um pouco mais estreito para
                    // absorver o recuo maior sem estourar a largura aberta.
                    // Largura acompanha a sidebar para manter rótulos longos
                    // (ex.: "eSocial T-27 — Procedimentos curados") em até 2 linhas.
                    width: isMenuPeer || deep ? '11.6rem' : '12rem',
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
