import { MouseEvent } from 'react';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { brandIdentityQuantityColor } from 'configs/theme/brand-identity-fill';

type CharacterizationRisksQuickCellProps = {
  count: number;
  countTooltip: string;
  /** Clique na quantidade → Fatores de Risco (sempre permitido para visualizar). */
  onOpenFactors: () => void;
  /** Ícone IA → aba Análise de Riscos IA (bloqueado se inactive). */
  onOpenAiAnalysis: () => void;
  aiDisabled?: boolean;
  aiDisabledReason?: string;
  aiTooltip?: string;
};

/**
 * Coluna Riscos: contagem → Fatores de Riscos; ícone IA → Análise de Riscos IA.
 * Evita a duplicidade do antigo "+" que abria a mesma aba.
 */
export function CharacterizationRisksQuickCell({
  count,
  countTooltip,
  onOpenFactors,
  onOpenAiAnalysis,
  aiDisabled = false,
  aiDisabledReason,
  aiTooltip = 'Analisar riscos com IA',
}: CharacterizationRisksQuickCellProps) {
  const handleOpenFactors = (e: MouseEvent) => {
    e.stopPropagation();
    onOpenFactors();
  };

  const handleOpenAi = (e: MouseEvent) => {
    e.stopPropagation();
    if (aiDisabled) return;
    onOpenAiAnalysis();
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={0.25}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip title={countTooltip}>
        <span>
          <Typography
            component="button"
            type="button"
            onClick={handleOpenFactors}
            sx={{
              border: 0,
              background: 'none',
              cursor: 'pointer',
              color: brandIdentityQuantityColor,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'underline',
              p: 0,
              minWidth: 16,
            }}
          >
            {count}
          </Typography>
        </span>
      </Tooltip>
      <Tooltip title={aiDisabled ? aiDisabledReason || aiTooltip : aiTooltip}>
        <span>
          <IconButton
            size="small"
            onClick={handleOpenAi}
            disabled={aiDisabled}
            aria-label={aiTooltip}
            sx={{ p: 0.25 }}
          >
            <AutoFixHighOutlinedIcon
              sx={{
                fontSize: 16,
                color: aiDisabled
                  ? 'text.disabled'
                  : brandIdentityQuantityColor,
              }}
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
