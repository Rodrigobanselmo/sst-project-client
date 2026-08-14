import { MouseEvent } from 'react';

import AddIcon from '@mui/icons-material/Add';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

type CharacterizationQuickCountCellProps = {
  count: number;
  disabled?: boolean;
  disabledReason?: string;
  emptyLabel?: string;
  emptyTooltip: string;
  countTooltip: string;
  addTooltip: string;
  onOpen: () => void;
  onAdd: () => void;
  /** Remoção rápida quando há exatamente 1 vínculo ativo removível. */
  showQuickUnlink?: boolean;
  quickUnlinkTooltip?: string;
  quickUnlinkDisabledReason?: string;
  onQuickUnlink?: () => void;
  quickUnlinkLoading?: boolean;
  /** GSE: exibe 0 em vez do rótulo de vazio; o atalho continua clicável. */
  showZeroCount?: boolean;
};

/**
 * Contagem clicável + atalho de adição para ações rápidas da tabela.
 * stopPropagation evita abrir a edição completa ao clicar na célula.
 */
export function CharacterizationQuickCountCell({
  count,
  disabled = false,
  disabledReason,
  emptyLabel = '+ Adicionar',
  emptyTooltip,
  countTooltip,
  addTooltip,
  onOpen,
  onAdd,
  showQuickUnlink = false,
  quickUnlinkTooltip = 'Remover vínculo do cargo',
  quickUnlinkDisabledReason,
  onQuickUnlink,
  quickUnlinkLoading = false,
  showZeroCount = false,
}: CharacterizationQuickCountCellProps) {
  const blockReason = disabled
    ? disabledReason || 'Ação indisponível'
    : undefined;

  const handleOpen = (e: MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onOpen();
  };

  const handleAdd = (e: MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onAdd();
  };

  const handleQuickUnlink = (e: MouseEvent) => {
    e.stopPropagation();
    if (disabled || quickUnlinkDisabledReason || quickUnlinkLoading) return;
    onQuickUnlink?.();
  };

  if (count <= 0 && !showZeroCount) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title={blockReason || emptyTooltip}>
          <span>
            <Typography
              component="button"
              type="button"
              onClick={handleOpen}
              disabled={disabled}
              sx={{
                border: 0,
                background: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled ? 'text.disabled' : 'success.main',
                fontSize: 12,
                fontWeight: 600,
                p: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {emptyLabel}
            </Typography>
          </span>
        </Tooltip>
      </Box>
    );
  }

  const unlinkBlocked = Boolean(quickUnlinkDisabledReason);
  const unlinkTooltip =
    blockReason ||
    quickUnlinkDisabledReason ||
    quickUnlinkTooltip;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={0.25}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip title={blockReason || countTooltip}>
        <span>
          <Typography
            component="button"
            type="button"
            onClick={handleOpen}
            disabled={disabled}
            sx={{
              border: 0,
              background: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: disabled ? 'text.disabled' : 'primary.main',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: disabled ? 'none' : 'underline',
              p: 0,
              minWidth: 16,
            }}
          >
            {count}
          </Typography>
        </span>
      </Tooltip>
      {showQuickUnlink && onQuickUnlink ? (
        <Tooltip title={unlinkTooltip}>
          <span>
            <IconButton
              size="small"
              onClick={handleQuickUnlink}
              disabled={disabled || unlinkBlocked || quickUnlinkLoading}
              aria-label={quickUnlinkTooltip}
              sx={{ p: 0.25 }}
            >
              <LinkOffIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
      <Tooltip title={blockReason || addTooltip}>
        <span>
          <IconButton
            size="small"
            onClick={handleAdd}
            disabled={disabled}
            aria-label={addTooltip}
            sx={{ p: 0.25 }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
