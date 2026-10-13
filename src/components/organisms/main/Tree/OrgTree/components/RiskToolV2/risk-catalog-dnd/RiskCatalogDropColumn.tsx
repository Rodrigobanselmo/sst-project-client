import React, { FC, ReactNode, useCallback } from 'react';

import { Box, Typography } from '@mui/material';
import { useDrop } from 'react-dnd';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { IRiskDataRow } from '../components/SideRowTable/types';
import {
  useRiskCatalogDndOptional,
  useRiskCatalogDropLock,
} from './RiskCatalogDndProvider';
import { useRiskCatalogRecordScope } from './RiskCatalogRecordScope';
import {
  RISK_CATALOG_DND_ITEM_TYPE,
  RISK_CATALOG_DND_KIND_LABEL_PLURAL,
  RiskCatalogDndDragItem,
  RiskCatalogDndKind,
} from './risk-catalog-dnd.types';
import { isRiskCatalogSourceSameAsDestination } from './risk-catalog-record-copy.util';
import { useRiskCatalogDndCopy } from './useRiskCatalogDndCopy';

type RiskCatalogDropColumnProps = {
  kind: RiskCatalogDndKind;
  risk: IRiskFactors | null | undefined;
  riskData?: IRiskDataRow | null;
  handleSelect: (values: Partial<IUpsertRiskData>, ...args: any[]) => any;
  children: ReactNode;
};

export const RiskCatalogDropColumn: FC<RiskCatalogDropColumnProps> = ({
  kind,
  risk,
  riskData,
  handleSelect,
  children,
}) => {
  const dnd = useRiskCatalogDndOptional();
  const dropLocked = useRiskCatalogDropLock();
  const recordScope = useRiskCatalogRecordScope();
  const { onDropCatalogItem, onBatchCopyToDestination } = useRiskCatalogDndCopy();

  const recordScoped = !!recordScope;
  const destinationRiskDataId = recordScoped
    ? recordScope.riskData.id
    : riskData?.id;
  const destination = {
    riskId: risk?.id,
    riskDataId: destinationRiskDataId,
    recordScoped,
  };
  const isOwnSource = (source?: {
    sourceRiskId: string;
    sourceRiskDataId?: string;
  } | null) => !!source && isRiskCatalogSourceSameAsDestination(source, destination);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: RISK_CATALOG_DND_ITEM_TYPE,
      canDrop: (item: RiskCatalogDndDragItem) => {
        if (dropLocked) return false;
        if (!risk?.id) return false;
        if (item.kind !== kind) return false;
        if (isRiskCatalogSourceSameAsDestination(item, destination)) return false;
        if (recordScoped && item.recordCopyBlockedReason) return false;
        return true;
      },
      drop: async (item: RiskCatalogDndDragItem) => {
        if (!risk?.id) return;
        await onDropCatalogItem(item, {
          risk,
          riskData: riskData as any,
          recordScoped,
          label: recordScope?.label,
          handleSelect: async (values) => {
            await handleSelect(values);
          },
        });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [
      kind,
      risk,
      riskData,
      handleSelect,
      onDropCatalogItem,
      dropLocked,
      recordScoped,
      destinationRiskDataId,
      recordScope?.label,
    ],
  );

  const handleBatchDestinationClick = useCallback(
    (event: React.MouseEvent) => {
      if (dropLocked) return;
      if (!dnd?.batchSession || !risk?.id) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest?.('[data-risk-catalog-batch-btn]')) return;

      const session = dnd.batchSession;
      if (session.kind !== kind) return;

      if (
        isRiskCatalogSourceSameAsDestination(session, {
          riskId: risk.id,
          riskDataId: destinationRiskDataId,
          recordScoped,
        })
      ) {
        dnd.clearBatchCopy();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      void onBatchCopyToDestination(
        session.items,
        {
          risk,
          riskData: riskData as any,
          recordScoped,
          label: recordScope?.label,
          handleSelect: async (values) => {
            await handleSelect(values);
          },
        },
        {
          onFinished: () => {
            dnd.triggerPulse({
              riskId: risk.id,
              kind,
              ...(recordScoped && destinationRiskDataId
                ? { riskDataId: destinationRiskDataId }
                : {}),
            });
            dnd.clearBatchCopy();
          },
        },
      );
    },
    [
      dnd,
      dropLocked,
      handleSelect,
      kind,
      onBatchCopyToDestination,
      risk,
      riskData,
      recordScoped,
      destinationRiskDataId,
      recordScope?.label,
    ],
  );

  if (!dnd) {
    return <>{children}</>;
  }

  const batchSession = dnd.batchSession;
  const highlightKind = dnd.highlightKind;
  const lockedRecord = recordScoped && dropLocked;
  const isBatchDestination =
    !!batchSession &&
    batchSession.kind === kind &&
    !!risk?.id &&
    !lockedRecord &&
    !isOwnSource(batchSession);
  const isBatchSource =
    !!batchSession &&
    batchSession.kind === kind &&
    !!risk?.id &&
    isOwnSource(batchSession);
  const highlightCompatible =
    highlightKind === kind &&
    !!risk?.id &&
    !lockedRecord &&
    (!batchSession || !isOwnSource(batchSession));
  const dimIncompatible =
    highlightKind != null && highlightKind !== kind;
  const shouldPulse =
    dnd.pulseTarget?.riskId === risk?.id &&
    dnd.pulseTarget?.kind === kind &&
    (!dnd.pulseTarget?.riskDataId ||
      dnd.pulseTarget.riskDataId === destinationRiskDataId);
  const batchCount = batchSession?.items.length ?? 0;
  const pluralLabel = RISK_CATALOG_DND_KIND_LABEL_PLURAL[kind];

  return (
    <Box
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      onClickCapture={
        dnd.isSelectingDestination ? handleBatchDestinationClick : undefined
      }
      sx={{
        position: 'relative',
        minHeight: '100%',
        borderRadius: 1,
        transition:
          'background-color 120ms ease, outline 120ms ease, box-shadow 120ms ease',
        cursor: isBatchDestination
          ? 'copy'
          : dimIncompatible && dnd.isSelectingDestination
            ? 'not-allowed'
            : isOver && canDrop
              ? 'copy'
              : undefined,
        ...(highlightCompatible && !batchSession
          ? {
              outline: '1px dashed',
              outlineColor: 'primary.light',
              backgroundColor: 'action.hover',
            }
          : {}),
        ...(isOver && canDrop
          ? {
              outline: '2px solid',
              outlineColor: 'primary.main',
              backgroundColor: 'primary.lighter',
            }
          : {}),
        ...(isBatchDestination
          ? {
              outline: '2px solid',
              outlineColor: 'primary.main',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              boxShadow: 'inset 0 0 0 1px rgba(25, 118, 210, 0.2)',
            }
          : {}),
        ...(isBatchSource
          ? {
              outline: '1px dashed',
              outlineColor: 'warning.main',
              opacity: 1,
              pointerEvents: 'auto',
            }
          : {}),
        ...(dimIncompatible
          ? {
              opacity: 0.35,
              cursor: dnd.isSelectingDestination ? 'not-allowed' : undefined,
              pointerEvents: dnd.isSelectingDestination ? 'auto' : 'none',
            }
          : {}),
        ...(shouldPulse
          ? {
              animation: 'riskCatalogBatchPulse 0.85s ease',
              '@keyframes riskCatalogBatchPulse': {
                '0%': {
                  backgroundColor: 'rgba(46, 125, 50, 0.22)',
                  outline: '2px solid',
                  outlineColor: 'success.main',
                },
                '100%': {
                  backgroundColor: 'transparent',
                  outlineColor: 'transparent',
                },
              },
            }
          : {}),
      }}
    >
      {children}

      {isBatchDestination && (
        <Box
          data-risk-catalog-batch-overlay
          sx={{
            position: 'absolute',
            inset: 4,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            px: 1,
            py: 1.5,
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'primary.main',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(1px)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: 'primary.main',
              lineHeight: 1.2,
            }}
          >
            {recordScoped ? 'Copiar para este GSE' : 'Copiar para este fator'}
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              color: 'text.secondary',
              lineHeight: 1.2,
            }}
          >
            ({batchCount} {pluralLabel})
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'primary.dark',
              lineHeight: 1.2,
              mt: 0.25,
            }}
          >
            Clique aqui
          </Typography>
        </Box>
      )}
    </Box>
  );
};
