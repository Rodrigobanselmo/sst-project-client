/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import { selectGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import { selectAllParentTreeData } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { ITreeMapObject } from '../../../../../interfaces';
import { GhoSelect } from '../../../../Selects/GhoSelect';

export interface GhoSelectCardProps extends BoxProps {
  node: ITreeMapObject;
}

export const GhoSelectCard: FC<{ children?: any } & GhoSelectCardProps> = ({
  node,
}) => {
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const parentNodesTree = useAppSelector(
    selectAllParentTreeData(node.id || ''),
  );

  const nodeData: ITreeMapObject = { ...node };

  Object.values(parentNodesTree).forEach((parentNode) => {
    nodeData.ghos = [...(nodeData.ghos || []), ...(parentNode.ghos || [])];
  });

  return <GhoSelect node={nodeData} showAll={!!isGhoOpen} />;
};
