import { MouseEvent } from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';

import {
  canGenerateInventorySummary,
  INVENTORY_SUMMARY_DISABLED_TOOLTIP,
} from './technical-content.util';
import { INACTIVE_ACTION_TOOLTIP } from './invalidate-characterization-inventory';

type IndicatorProps = {
  label: string;
  filled: boolean;
  preview?: string;
};

function TechnicalIndicator({ label, filled, preview }: IndicatorProps) {
  const mark = filled ? '✓' : '○';
  const title = filled
    ? `${label}\n\n${preview || '(sem prévia)'}`
    : `${label}\n\n(vazio)`;

  return (
    <Tooltip
      title={
        <Box sx={{ whiteSpace: 'pre-wrap', maxWidth: 280, fontSize: 12 }}>
          {title}
        </Box>
      }
      arrow
      enterDelay={200}
    >
      <Typography
        component="span"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: filled ? 'success.main' : 'text.disabled',
          cursor: 'pointer',
          userSelect: 'none',
          lineHeight: 1.2,
        }}
        aria-label={`${label}: ${filled ? 'preenchido' : 'vazio'}`}
      >
        {mark}
        <Box
          component="span"
          sx={{
            ml: 0.25,
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: 0.2,
            textTransform: 'uppercase',
          }}
        >
          {label.slice(0, 3)}
        </Box>
      </Typography>
    </Tooltip>
  );
}

type CharacterizationTechnicalContentCellProps = {
  row: CharacterizationBrowseResultModel;
  /** Abre o modal de Conteúdo Técnico (cockpit). */
  onOpen: () => void;
  /** Atalho: modal + Assistente IA. */
  onOpenAssist: () => void;
  /** Atalho: modal + Resumo IA. */
  onOpenSummary: () => void;
};

/**
 * Coluna compacta: indicadores + atalhos. Fase 2C abre modal próprio (não o editor).
 */
export function CharacterizationTechnicalContentCell({
  row,
  onOpen,
  onOpenAssist,
  onOpenSummary,
}: CharacterizationTechnicalContentCellProps) {
  const inactive = row.isInactive;
  const canSummary =
    !inactive &&
    canGenerateInventorySummary({
      hasDescription: row.hasDescription,
      hasProcesses: row.hasProcesses,
      hasConsiderations: row.hasConsiderations,
    });

  const stop = (e: MouseEvent) => e.stopPropagation();

  const assistDisabled = inactive;
  const summaryDisabled = !canSummary;
  const summaryTooltip = inactive
    ? INACTIVE_ACTION_TOOLTIP
    : canSummary
      ? 'Gerar resumo para o inventário de riscos'
      : INVENTORY_SUMMARY_DISABLED_TOOLTIP;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={0.5}
      onClick={(e) => {
        stop(e);
        if (!inactive) onOpen();
      }}
      sx={{
        py: 0.25,
        minWidth: 108,
        cursor: inactive ? 'default' : 'pointer',
        opacity: inactive ? 0.7 : 1,
      }}
      title={inactive ? INACTIVE_ACTION_TOOLTIP : 'Abrir Conteúdo Técnico'}
    >
      <Box display="flex" gap={0.6} flexWrap="wrap" justifyContent="center">
        <TechnicalIndicator
          label="Descrição"
          filled={row.hasDescription}
          preview={row.descriptionPreview}
        />
        <TechnicalIndicator
          label="Processos"
          filled={row.hasProcesses}
          preview={row.processesPreview}
        />
        <TechnicalIndicator
          label="Considerações"
          filled={row.hasConsiderations}
          preview={row.considerationsPreview}
        />
        <TechnicalIndicator
          label="Resumo"
          filled={row.hasInventorySummary}
          preview={row.inventorySummaryPreview}
        />
      </Box>
      <Box display="flex" gap={0.25} alignItems="center">
        <Tooltip
          title={
            assistDisabled
              ? INACTIVE_ACTION_TOOLTIP
              : 'Assistente IA da Caracterização'
          }
        >
          <span>
            <IconButton
              size="small"
              disabled={assistDisabled}
              onClick={(e) => {
                stop(e);
                if (!assistDisabled) onOpenAssist();
              }}
              aria-label="Assistente IA da Caracterização"
              sx={{ p: 0.25 }}
            >
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={summaryTooltip}>
          <span>
            <IconButton
              size="small"
              disabled={summaryDisabled}
              onClick={(e) => {
                stop(e);
                if (!summaryDisabled) onOpenSummary();
              }}
              aria-label="Gerar resumo para o inventário de riscos"
              sx={{ p: 0.25 }}
            >
              <AutoFixHighOutlinedIcon
                sx={{
                  fontSize: 15,
                  color: summaryDisabled ? undefined : 'primary.main',
                }}
              />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
