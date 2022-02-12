/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { firstNodeId } from 'core/constants/first-node-id.constant';

import { IOrgTreeNodeProps } from '../interfaces';
import { RenderNode } from './RenderNode';

export const TreeNode = (props: IOrgTreeNodeProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <RenderNode id={firstNodeId} prop={props} first />
    </DndProvider>
  );
};
