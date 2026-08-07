import React, { FC, ReactNode } from 'react';

import { Box } from '@mui/material';
import { useDrag } from 'react-dnd';

import { useRiskCatalogDndOptional } from './RiskCatalogDndProvider';
import {
  RISK_CATALOG_DND_ITEM_TYPE,
  RiskCatalogDndDragItem,
} from './risk-catalog-dnd.types';

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

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RISK_CATALOG_DND_ITEM_TYPE,
      item: () => {
        dnd?.setActiveKind(item.kind);
        return item;
      },
      canDrag:
        !disabled && Boolean(item.name?.trim()) && Boolean(item.sourceRiskId),
      end: () => {
        dnd?.setActiveKind(null);
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item, disabled, dnd],
  );

  if (!dnd) {
    return <>{children}</>;
  }

  return (
    <Box
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      sx={{
        opacity: isDragging ? 0.45 : 1,
        cursor: disabled ? 'default' : 'grab',
        '&:active': { cursor: disabled ? 'default' : 'grabbing' },
      }}
    >
      {children}
    </Box>
  );
};
