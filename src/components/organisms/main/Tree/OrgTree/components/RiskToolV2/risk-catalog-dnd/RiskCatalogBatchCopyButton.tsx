import React, { FC } from 'react';

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { Box, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { useRiskCatalogDndOptional } from './RiskCatalogDndProvider';
import {
  RISK_CATALOG_BATCH_COPY_TOOLTIP,
  RISK_CATALOG_BATCH_EMPTY_MESSAGE,
  RiskCatalogDndDragItem,
  RiskCatalogDndKind,
} from './risk-catalog-dnd.types';
import { dedupeRiskCatalogDragItems } from './find-risk-catalog-item-match.util';

type RiskCatalogBatchCopyButtonProps = {
  kind: RiskCatalogDndKind;
  risk?: IRiskFactors | null;
  items: RiskCatalogDndDragItem[];
};

export const RiskCatalogBatchCopyButton: FC<RiskCatalogBatchCopyButtonProps> = ({
  kind,
  risk,
  items,
}) => {
  const dnd = useRiskCatalogDndOptional();
  const { enqueueSnackbar } = useSnackbar();

  if (!dnd || !risk?.id) return null;

  const uniqueItems = dedupeRiskCatalogDragItems(
    items.filter((i) => i.kind === kind && !!i.name?.trim()),
  );
  const count = uniqueItems.length;

  const isActive =
    dnd.batchSession?.sourceRiskId === risk.id &&
    dnd.batchSession?.kind === kind;

  const tooltip = isActive
    ? 'Cancelar cópia em lote (Esc)'
    : RISK_CATALOG_BATCH_COPY_TOOLTIP[kind];

  return (
    <STooltip title={tooltip}>
      <Box
        data-risk-catalog-batch-btn
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          ml: 0.5,
          gap: 0.25,
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          if (isActive) {
            dnd.clearBatchCopy();
            return;
          }

          if (dnd.isDragging) return;

          if (!count) {
            enqueueSnackbar(RISK_CATALOG_BATCH_EMPTY_MESSAGE[kind], {
              variant: 'info',
            });
            return;
          }

          dnd.startBatchCopy({
            kind,
            sourceRiskId: risk.id,
            sourceRiskName: risk.name || '',
            items: uniqueItems,
          });
          enqueueSnackbar(
            'Selecione o fator de destino. Esc cancela.',
            { variant: 'info', autoHideDuration: 3500 },
          );
        }}
      >
        <SIconButton
          size="small"
          data-risk-catalog-batch-btn
          sx={{
            maxWidth: 22,
            maxHeight: 22,
            color: isActive ? 'primary.main' : 'text.secondary',
            opacity: isActive ? 1 : count ? 0.75 : 0.45,
            '&:hover': { opacity: 1 },
          }}
        >
          <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
        </SIconButton>
        <Typography
          component="span"
          data-risk-catalog-batch-btn
          sx={{
            fontSize: 11,
            lineHeight: 1,
            color: isActive ? 'primary.main' : 'text.secondary',
            fontWeight: 600,
            minWidth: 10,
            userSelect: 'none',
          }}
        >
          {count}
        </Typography>
      </Box>
    </STooltip>
  );
};
