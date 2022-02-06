import { useMemo } from 'react';

import { useTreeActions } from '../../../../../../core/contexts/TreeActionsContextProvider';
import { useAppDispatch } from '../../../../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../../../../core/hooks/useAppSelector';
import {
  selectAllTreeNodes,
  selectTreeSelectItem,
  setEditSelectItem,
} from '../../../../../../store/reducers/tree/treeSlice';
import { ITreeSelectedItem } from '../../../interfaces';
export const useModalCard = () => {
  const { getPathById } = useTreeActions();
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(selectTreeSelectItem);
  const allTreeNodes = useAppSelector(selectAllTreeNodes);

  const nodePath = useMemo(() => {
    if (selectedNode?.id) {
      const paths = getPathById(selectedNode?.id);
      const nodePath = paths.map((path) => allTreeNodes[path].label);

      if (nodePath.length > 4) {
        return [...nodePath.slice(0, 2), '...', ...nodePath.slice(-2)];
      }

      return nodePath;
    }
    return [];
  }, [allTreeNodes, getPathById, selectedNode?.id]);

  const setEditNodeSelectedItem = (node: Partial<ITreeSelectedItem> | null) => {
    dispatch(setEditSelectItem({ ...node }));
  };

  return { nodePath, selectedNode, setEditNodeSelectedItem };
};
