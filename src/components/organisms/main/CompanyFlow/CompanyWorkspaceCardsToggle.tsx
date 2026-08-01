import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

import { useCompanyWorkspaceCardsCollapsed } from 'core/hooks/useCompanyWorkspaceCardsCollapsed';

type Props = {
  /** Empurra o controle para a direita do container. */
  align?: 'start' | 'end';
};

/**
 * Controle dos cards superiores do workspace da empresa.
 * Não confundir com a seção "Detalhes" do cabeçalho.
 */
export function CompanyWorkspaceCardsToggle({ align = 'end' }: Props) {
  const { collapsed, toggleCollapsed, toggleLabel } =
    useCompanyWorkspaceCardsCollapsed();

  return (
    <SFlex
      justify={align === 'end' ? 'flex-end' : 'flex-start'}
      align="center"
      sx={{ flexShrink: 0 }}
    >
      <Button
        size="small"
        color="inherit"
        variant="text"
        onClick={toggleCollapsed}
        endIcon={collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        aria-label={toggleLabel}
        aria-expanded={!collapsed}
        title={toggleLabel}
        sx={{
          textTransform: 'none',
          color: 'text.secondary',
          fontWeight: 500,
          px: 1,
          minHeight: 32,
          whiteSpace: 'nowrap',
        }}
      >
        {toggleLabel}
      </Button>
    </SFlex>
  );
}

/** @deprecated Prefer CompanyWorkspaceCardsToggle */
export const CharacterizationSummaryToggle = CompanyWorkspaceCardsToggle;
