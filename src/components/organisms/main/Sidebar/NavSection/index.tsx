import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Stack } from '@mui/material';

import {
  getSidebarSectionToggleLabel,
  sidebarSectionPanelId,
} from 'core/hooks/useSidebarSectionExpansion.util';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { BoxStyledTitle, TextStyled } from './styles';
import { INavSectionProps } from './types';

export function NavSection({
  title,
  children,
  hideTitle,
  collapsible,
  expanded = true,
  onToggleExpand,
  sectionId,
  ...rest
}: INavSectionProps): JSX.Element {
  const { isOpen } = useSidebarDrawer();

  const showTitle = !hideTitle;
  const isCollapsible = Boolean(collapsible && sectionId && onToggleExpand);
  /**
   * No rail, preserva ícones de todas as seções (preferência só afeta a
   * sidebar expandida). Com sidebar aberta, respeita expansão.
   */
  const showItems = !isCollapsible || expanded || !isOpen;
  const panelId = sectionId ? sidebarSectionPanelId(sectionId) : undefined;
  const toggleLabel =
    isCollapsible && title
      ? getSidebarSectionToggleLabel(title, expanded)
      : undefined;

  return (
    <Box width="100%" minWidth={0} {...rest}>
      {showTitle && (
        <BoxStyledTitle
          color={isOpen ? 'transparent' : 'background.divider'}
          /**
           * Não usar mx + width 100%: a soma estoura o pai com overflow-x
           * hidden e clipa o chevron / comprime o texto.
           * Alinhamento lateral = padding do botão (igual aos NavLinks).
           */
          sx={{
            width: isOpen ? '100%' : 0,
            maxWidth: '100%',
            minWidth: 0,
            mx: 0,
            px: 0,
            boxSizing: 'border-box',
          }}
        >
          {isCollapsible && isOpen ? (
            <Box
              component="button"
              type="button"
              onClick={onToggleExpand}
              aria-expanded={expanded}
              aria-controls={panelId}
              aria-label={toggleLabel}
              title={title}
              sx={{
                all: 'unset',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 4,
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                px: 8,
                py: 2,
                cursor: 'pointer',
                borderRadius: 1,
                color: 'text.medium',
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.main',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
            >
              <TextStyled
                align="left"
                color="inherit"
                fontSize={13}
                lineHeight={1.25}
                sx={{
                  opacity: 1,
                  // 1 1 0% + minWidth 0: permite ellipsis dentro do flex.
                  flex: '1 1 0%',
                  minWidth: 0,
                  maxWidth: '100%',
                }}
              >
                {title}
              </TextStyled>
              <ExpandMoreIcon
                aria-hidden
                sx={{
                  fontSize: 16,
                  width: 16,
                  height: 16,
                  flex: '0 0 16px',
                  ml: 4,
                  transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </Box>
          ) : (
            <TextStyled
              align="left"
              color="text.medium"
              fontSize={13}
              lineHeight={1.25}
              px={8}
              sx={{
                opacity: isOpen ? 1 : 0,
                height: isOpen ? 'auto' : 2,
                width: isOpen ? '100%' : 0,
                display: 'block',
              }}
            >
              {title}
            </TextStyled>
          )}
        </BoxStyledTitle>
      )}
      <Stack
        spacing={0}
        mt={hideTitle ? 0 : 6}
        pt={hideTitle ? 0 : 2}
        id={panelId}
        role={isCollapsible ? 'region' : undefined}
        hidden={isCollapsible && isOpen && !expanded ? true : undefined}
        sx={{
          display: showItems ? undefined : 'none',
          width: '100%',
          minWidth: 0,
        }}
      >
        {showItems ? children : null}
      </Stack>
    </Box>
  );
}
