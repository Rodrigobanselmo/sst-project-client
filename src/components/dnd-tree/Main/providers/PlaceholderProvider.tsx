import React, { useState, createContext } from 'react';
import { useStore } from 'react-redux';

import {
  IDocumentSlice,
  setDocumentDragItem,
} from 'store/reducers/document/documentSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';

import { NodeModel, PlaceholderState } from '../types';

export const PlaceholderContext = createContext<PlaceholderState>(
  {} as PlaceholderState,
);

const initialState = {
  dropTargetId: undefined,
  index: undefined,
};

export const PlaceholderProvider: React.FC<{ children: React.ReactNode }> = (
  props,
) => {
  const store = useStore();
  const dispatch = useAppDispatch();

  const index = () => {
    const dragItem = store.getState().document
      .dragItem as IDocumentSlice['dragItem'];

    return dragItem.index;
  };

  const dropTargetId = () => {
    const dragItem = store.getState().document
      .dragItem as IDocumentSlice['dragItem'];

    return dragItem.dropTargetId;
  };

  const showPlaceholder = (
    dropTargetId: NodeModel['id'],
    index: number,
  ): void => {
    dispatch(
      setDocumentDragItem({
        dropTargetId,
        index,
      }),
    );
  };

  const hidePlaceholder = () => {
    dispatch(
      setDocumentDragItem({
        dropTargetId: initialState.dropTargetId,
        index: initialState.index,
      }),
    );
  };

  return (
    <PlaceholderContext.Provider
      value={{
        getDropTargetId: dropTargetId,
        getIndex: index,
        showPlaceholder,
        hidePlaceholder,
      }}
    >
      {props.children}
    </PlaceholderContext.Provider>
  );
};
