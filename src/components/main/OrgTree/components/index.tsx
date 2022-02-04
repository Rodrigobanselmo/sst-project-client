/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { IOrgTreeNodeProps } from '../interfaces';
import { RenderNode } from './RenderNode';

export const TreeNode = (props: IOrgTreeNodeProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <RenderNode id={'seed'} prop={props} first />
    </DndProvider>
  );
};
