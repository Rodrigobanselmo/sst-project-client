import React from 'react';

import { NodeModel, useDragOver } from '@minoru/react-dnd-treeview';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Typography from '@mui/material/Typography';

import { CustomData } from '../types/types';
import { TypeIcon } from '../CustomIcon/TypeIcon';
import { STCustomNode } from './styles';

type Props = {
  node: NodeModel<CustomData>;
  depth: number;
  isOpen: boolean;
  isSelected: boolean;
  onToggle: (id: NodeModel['id']) => void;
  onSelect: (node: NodeModel<CustomData>) => void;
};

export const CustomNode: React.FC<Props> = (props) => {
  const { id, droppable, data } = props.node;
  const indent = props.depth * 24;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onToggle(props.node.id);
  };

  const handleSelect = () => props.onSelect(props.node);

  const dragOverProps = useDragOver(id, props.isOpen, props.onToggle);

  return (
    <STCustomNode
      className={'tree-node'}
      selected={props.isSelected ? 1 : 0}
      style={{ paddingInlineStart: indent }}
      {...dragOverProps}
      onClick={handleSelect}
    >
      <div className={`expandIconWrapper ${props.isOpen ? 'isOpen' : ''}`}>
        {props.node.droppable && (
          <div onClick={handleToggle}>
            <ArrowRightIcon />
          </div>
        )}
      </div>
      <div>
        <TypeIcon droppable={droppable} fileType={data?.fileType} />
      </div>
      <div className={'labelGridItem'}>
        <Typography variant="body2">{props.node.text}</Typography>
      </div>
    </STCustomNode>
  );
};
