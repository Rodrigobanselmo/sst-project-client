import { MouseEvent } from 'react';

import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';

import { INACTIVE_ACTION_TOOLTIP } from './invalidate-characterization-inventory';
import {
  countEnvironmentalParametersFilled,
  formatEnvironmentalParametersCompact,
  formatEnvironmentalParametersTooltip,
  resolveEnvironmentalFillStatus,
  type EnvironmentalParameterValues,
} from './environmental-parameters.util';

type Props = {
  row: CharacterizationBrowseResultModel;
  onOpen: () => void;
};

function valuesFromRow(
  row: CharacterizationBrowseResultModel,
): EnvironmentalParameterValues {
  return {
    temperature: row.temperature,
    moisturePercentage: row.moisturePercentage,
    noiseValue: row.noiseValue,
    luminosity: row.luminosity,
  };
}

/**
 * Coluna compacta: T/U/R/L + badge n/4. Clique abre o modal (não o editor).
 */
export function CharacterizationEnvironmentalParamsCell({
  row,
  onOpen,
}: Props) {
  const inactive = row.isInactive;
  const values = valuesFromRow(row);
  const { filled, total } = countEnvironmentalParametersFilled(values);
  const status = resolveEnvironmentalFillStatus(filled, total);
  const compact = formatEnvironmentalParametersCompact(values);
  const tooltip = formatEnvironmentalParametersTooltip(values);

  const stop = (e: MouseEvent) => e.stopPropagation();

  const chipColor =
    status === 'complete' ? 'success' : status === 'partial' ? 'warning' : 'default';

  return (
    <Tooltip
      title={
        <Box sx={{ whiteSpace: 'pre-wrap', maxWidth: 260, fontSize: 12 }}>
          {tooltip}
        </Box>
      }
      arrow
      enterDelay={250}
    >
      <Box
        onClick={(e) => {
          stop(e);
          if (!inactive) onOpen();
        }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={0.4}
        sx={{
          py: 0.25,
          px: 0.5,
          minWidth: 96,
          maxWidth: 148,
          cursor: inactive ? 'default' : 'pointer',
          opacity: inactive ? 0.65 : 1,
        }}
        title={inactive ? INACTIVE_ACTION_TOOLTIP : 'Editar parâmetros ambientais'}
        aria-label="Parâmetros Ambientais"
      >
        <Chip
          size="small"
          label={`${filled}/${total}`}
          color={chipColor}
          variant={status === 'empty' ? 'outlined' : 'filled'}
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 700,
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
        {compact ? (
          <Typography
            component="span"
            sx={{
              fontSize: 10.5,
              lineHeight: 1.25,
              textAlign: 'center',
              color: 'text.secondary',
              fontWeight: 500,
              wordBreak: 'break-word',
            }}
          >
            {compact}
          </Typography>
        ) : (
          <Typography
            component="span"
            sx={{
              fontSize: 12,
              color: 'text.disabled',
              fontWeight: 500,
            }}
          >
            —
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
