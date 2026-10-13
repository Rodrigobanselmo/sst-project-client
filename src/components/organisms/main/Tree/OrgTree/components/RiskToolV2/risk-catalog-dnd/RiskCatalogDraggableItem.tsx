import React, { FC, ReactNode, useMemo } from 'react';

import { Box } from '@mui/material';
import { useDrag } from 'react-dnd';

import { useRiskCatalogDndOptional } from './RiskCatalogDndProvider';
import { useRiskCatalogRecordScope } from './RiskCatalogRecordScope';
import {
  RISK_CATALOG_DND_ITEM_TYPE,
  RiskCatalogDndDragItem,
} from './risk-catalog-dnd.types';
import { withRecordCopySource } from './risk-catalog-record-copy.util';

type RiskCatalogDraggableItemProps = {
  item: RiskCatalogDndDragItem;
  children: ReactNode;
  disabled?: boolean;
};

export const RiskCatalogDraggableItem: FC<RiskCatalogDraggableItemProps> = ({
  item,
  children,
  disabled,
}) => {
  const dnd = useRiskCatalogDndOptional();
  const recordScope = useRiskCatalogRecordScope();

  const dragItem = useMemo(
    () =>
      recordScope ? withRecordCopySource(item, recordScope.riskData) : item,
    [item, recordScope],
  );
  const blockedReason = recordScope ? dragItem.recordCopyBlockedReason : undefined;
  const dragDisabled = !!disabled || !!blockedReason;

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RISK_CATALOG_DND_ITEM_TYPE,
      item: () => {
        dnd?.setActiveKind(dragItem.kind);
        return dragItem;
      },
      canDrag:
        !dragDisabled &&
        Boolean(dragItem.name?.trim()) &&
        Boolean(dragItem.sourceRiskId),
      end: () => {
        dnd?.setActiveKind(null);
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [dragItem, dragDisabled, dnd],
  );

  if (!dnd) {
    return <>{children}</>;
  }

  return (
    <Box
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      title={blockedReason}
      sx={{
        opacity: isDragging ? 0.45 : 1,
        cursor: dragDisabled ? 'default' : 'grab',
        '&:active': { cursor: dragDisabled ? 'default' : 'grabbing' },
      }}
    >
      {children}
    </Box>
  );
};
