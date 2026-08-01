import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

import { useCharacterizationSummaryCollapsed } from 'core/hooks/useCharacterizationSummaryCollapsed';

type Props = {
  /** Empurra o controle para a direita do container. */
  align?: 'start' | 'end';
};

/**
 * Controle dos cards superiores da Caracterização.
 * Não confundir com a seção "Detalhes" do cabeçalho da empresa.
 */
export function CharacterizationSummaryToggle({ align = 'end' }: Props) {
  const { collapsed, toggleCollapsed, toggleLabel } =
    useCharacterizationSummaryCollapsed();

  return (
    <SFlex
      justify={align === 'end' ? 'flex-end' : 'flex-start'}
      align="center"
      sx={{ width: '100%', mb: 1 }}
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
        }}
      >
        {toggleLabel}
      </Button>
    </SFlex>
  );
}
