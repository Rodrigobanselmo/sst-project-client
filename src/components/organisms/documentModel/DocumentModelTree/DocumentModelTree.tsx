import React from 'react';

import { ThemeProvider, CssBaseline } from '@mui/material';
import clone from 'clone';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { setDocumentSelectItem } from 'store/reducers/document/documentSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import {
  DndProvider,
  DropOptions,
  getBackendOptions,
  getDescendants,
  MultiBackend,
  Tree,
} from '../../../dnd-tree/Main';
import { useTreeDocumentModel } from './hooks/useTreeDocumentModel';
import useTreeOpenHandler from './hooks/useTreeOpenHandler';
import Placeholder from './Placeholder/Placeholder';
import { StructNode } from './StructNode/StructNode';
import { STStructContainer } from './styles';
import { theme } from './theme';
import { NodeDocumentModel } from './types/types';

const reorderArray = (
  array: NodeDocumentModel[],
  sourceIndex: number,
  targetIndex: number,
) => {
  const newArray = [...array];
  const element = newArray.splice(sourceIndex, 1)[0];
  newArray.splice(targetIndex, 0, element);
  return newArray;
};

export function DocumentModelTree(props: {
  model: IDocumentModelFull | undefined;
  loading?: boolean;
}) {
  const { ref, getPipeHeight, toggle } = useTreeOpenHandler();
  const { treeData, setTreeData } = useTreeDocumentModel(props.model);
  const dispatch = useAppDispatch();

  const handleDrop = (newTree: NodeDocumentModel[], e: DropOptions) => {
    const { dragSourceId, dropTargetId, destinationIndex } = e;

    if (
      typeof dragSourceId === 'undefined' ||
      typeof dropTargetId === 'undefined'
    )
      return;
    const start = treeData.find((v) => v.id === dragSourceId);
    const end = treeData.find((v) => v.id === dropTargetId);

    // console.error(start);
    // console.error(end);

    if (
      start?.parent === dropTargetId &&
      start &&
      typeof destinationIndex === 'number'
    ) {
      setTreeData((treeData) => {
        const output = reorderArray(
          treeData,
          treeData.indexOf(start),
          destinationIndex,
        );
        return output;
      });
    }

    if (
      start?.parent !== dropTargetId &&
      start &&
      typeof destinationIndex === 'number'
    ) {
      if (
        getDescendants(treeData, dragSourceId).find(
          (el) => el.id === dropTargetId,
        ) ||
        dropTargetId === dragSourceId ||
        (end && !end?.droppable)
      )
        return;
      setTreeData((treeData) => {
        const output = reorderArray(
          treeData,
          treeData.indexOf(start),
          destinationIndex,
        );

        const outputCopy = clone(output);
        const movedElement = outputCopy.find((el) => el.id === dragSourceId);
        if (movedElement) movedElement.parent = dropTargetId;
        return outputCopy;
      });
    }
  };

  const handleSelect = (node: NodeDocumentModel) =>
    dispatch(setDocumentSelectItem(node));

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
