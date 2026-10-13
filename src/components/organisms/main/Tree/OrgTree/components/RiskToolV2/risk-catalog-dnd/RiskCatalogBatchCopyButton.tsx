import React, { FC } from 'react';

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { Box, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { useRiskCatalogDndOptional } from './RiskCatalogDndProvider';
import { useRiskCatalogRecordScope } from './RiskCatalogRecordScope';
import { withRecordCopySource } from './risk-catalog-record-copy.util';
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
  const recordScope = useRiskCatalogRecordScope();
  const { enqueueSnackbar } = useSnackbar();

  if (!dnd || !risk?.id) return null;

  const scopedItems = recordScope
    ? items.map((i) => withRecordCopySource(i, recordScope.riskData))
    : items;
  const candidateItems = dedupeRiskCatalogDragItems(
    scopedItems.filter((i) => i.kind === kind && !!i.name?.trim()),
  );
  const uniqueItems = recordScope
    ? candidateItems.filter((i) => !i.recordCopyBlockedReason)
    : candidateItems;
  const blockedCount = candidateItems.length - uniqueItems.length;
  const count = uniqueItems.length;
  const sourceRiskDataId = recordScope?.riskData.id;

  const isActive =
    dnd.batchSession?.sourceRiskId === risk.id &&
    dnd.batchSession?.kind === kind &&
    (!recordScope || dnd.batchSession?.sourceRiskDataId === sourceRiskDataId);

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
            enqueueSnackbar(
              blockedCount
                ? (candidateItems[0]?.recordCopyBlockedReason as string)
                : RISK_CATALOG_BATCH_EMPTY_MESSAGE[kind],
              { variant: blockedCount ? 'warning' : 'info' },
            );
            return;
          }

          dnd.startBatchCopy({
            kind,
            sourceRiskId: risk.id,
            sourceRiskName: risk.name || '',
            ...(sourceRiskDataId ? { sourceRiskDataId } : {}),
            items: uniqueItems,
          });
          enqueueSnackbar(
            recordScope
              ? `Selecione o GSE de destino. Esc cancela.${
                  blockedCount
                    ? `\n${blockedCount} item(ns) não entram na cópia (correspondência informativa ou medida derivada do Plano).`
                    : ''
                }`
              : 'Selecione o fator de destino. Esc cancela.',
            {
              variant: 'info',
              autoHideDuration: 3500,
              style: { whiteSpace: 'pre-line' },
            },
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
