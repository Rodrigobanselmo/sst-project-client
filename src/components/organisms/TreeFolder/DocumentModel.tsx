import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';

import {
  Tree,
  NodeModel,
  MultiBackend,
  getBackendOptions,
} from '@minoru/react-dnd-treeview';
import { ThemeProvider, CssBaseline } from '@mui/material';

import { CustomNode } from './CustomNode/CustomNode';
import { STDocumentModelBox } from './styles';
import { theme } from './theme';
import { CustomData } from './types/types';

const json = [
  {
    id: 1,
    parent: 0,
    droppable: true,
    text: 'Folder 1',
  },
  {
    id: 2,
    parent: 1,
    droppable: false,
    text: 'File 1-1',
    data: {
      fileType: 'csv',
      fileSize: '0.5MB',
    },
  },
  {
    id: 3,
    parent: 1,
    droppable: false,
    text: 'File 1-2',
    data: {
      fileType: 'text',
      fileSize: '4.8MB',
    },
  },
  {
    id: 4,
    parent: 0,
    droppable: true,
    text: 'Folder 2',
  },
  {
    id: 5,
    parent: 4,
    droppable: true,
    text: 'Folder 2-1',
  },
  {
    id: 6,
    parent: 5,
    droppable: false,
    text: 'File 2-1-1',
    data: {
      fileType: 'image',
      fileSize: '2.1MB',
    },
  },
  {
    id: 7,
    parent: 0,
    droppable: false,
    text: 'File 3',
    data: {
      fileType: 'image',
      fileSize: '0.8MB',
    },
  },
];

export const DocumentModel = () => {
  const [treeData, setTreeData] = useState<NodeModel<CustomData>[]>(json);
  const handleDrop = (newTree: NodeModel<CustomData>[]) => setTreeData(newTree);
  const [selectedNode, setSelectedNode] =
    useState<NodeModel<CustomData> | null>(null);
  const handleSelect = (node: NodeModel<CustomData>) => setSelectedNode(node);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <STDocumentModelBox>
          <Tree<CustomData>
            tree={treeData}
            rootId={0}
            render={(node, { depth, isOpen, onToggle }) => (
              <CustomNode
                node={node}
                depth={depth}
                isOpen={isOpen}
                isSelected={node.id === selectedNode?.id}
                onSelect={handleSelect}
                onToggle={onToggle}
              />
            )}
            enableAnimateExpand={true}
            onDrop={handleDrop}
            classes={{
              root: 'treeRoot',
              draggingSource: 'draggingSource',
              dropTarget: 'dropTarget',
            }}
          />
        </STDocumentModelBox>
      </DndProvider>
    </ThemeProvider>
  );
};
