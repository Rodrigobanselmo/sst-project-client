import React from 'react';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import {
  DndProvider,
  getBackendOptions,
  MultiBackend,
  Tree,
} from '../../../dnd-tree/Main';
import { useTreeDocumentModel } from './hooks/useTreeDocumentModel';
import useTreeOpenHandler from './hooks/useTreeOpenHandler';
import Placeholder from './Placeholder/Placeholder';
import { StructNode } from './StructNode/StructNode';
import { STStructContainer } from './styles';
import { theme } from './theme';

export function DocumentModelTree(props: {
  model: IDocumentModelFull | undefined;
  loading?: boolean;
}) {
  const { ref, getPipeHeight, toggle } = useTreeOpenHandler();
  const { treeData, handleDrop, handleSelect } = useTreeDocumentModel(
    props.model,
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <STStructContainer>
        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
          <div className={'wrapper'}>
            {!!props.model && !!treeData && !!treeData.length && (
              <Tree
                ref={ref}
                classes={{
                  root: 'treeRoot',
                  placeholder: 'placeholder',
                  dropTarget: 'dropTarget',
                  listItem: 'listItem',
                }}
                initialOpen={true}
                tree={treeData}
                sort={false}
                loading={props.loading}
                rootId={0}
                insertDroppableFirst={false}
                onDrop={handleDrop}
                canDrop={() => true}
                dropTargetOffset={5}
                placeholderRender={(node, { depth }) => (
                  <Placeholder node={node} depth={depth} />
                )}
                render={(node, { depth, isOpen, isDropTarget }) => (
                  <StructNode
                    getPipeHeight={getPipeHeight}
                    node={node}
                    depth={depth}
                    isOpen={isOpen}
                    onSelect={handleSelect}
                    onToggle={toggle}
                    isDropTarget={isDropTarget}
                    treeData={treeData}
                  />
                )}
              />
            )}
          </div>
        </DndProvider>
      </STStructContainer>
    </ThemeProvider>
  );
}
