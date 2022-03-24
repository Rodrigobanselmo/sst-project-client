import React, { FC, MouseEvent } from 'react';

import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { Box, Stack } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';

import { useModal } from 'core/hooks/useModal';

import { ModalEnum } from '../../../../../../../../core/enums/modal.enums';
import { useHierarchyTreeActions } from '../../../../../../../../core/hooks/useHierarchyTreeActions';
import { STagButton } from '../../../../../../../atoms/STagButton';
import SText from '../../../../../../../atoms/SText';
import { TreeTypeEnum } from '../../../../enums/tree-type.enums';
import { ITreeSelectedItem } from '../../../../interfaces';
import { OptionsHelpSelect } from '../../../Selects/OptionsHelpSelect';
import { TypeSelect } from '../../../Selects/TypeSelect';
import { INodeCardProps } from './types';

const NodeLabel: FC<{ label: string; type: TreeTypeEnum }> = ({
  label,
  type,
}) => {
  const hasLabel = [TreeTypeEnum.OFFICE, TreeTypeEnum.SECTOR].includes(type);
  return (
    <STooltip
      minLength={60}
      withWrapper
      enterDelay={600}
      title={hasLabel ? label : ''}
    >
      <SText
        sx={{
          pr: 10,
          width: '100%',
          fontSize: '15px',
          lineHeight: '18px',
        }}
        lineNumber={2}
      >
        {label}
      </SText>
    </STooltip>
  );
};

export const NodeCard: FC<INodeCardProps> = ({ node, menuRef }) => {
  const { onOpenModal } = useModal();
  const { editNodes, createEmptyCard, reorderNodes } =
    useHierarchyTreeActions();

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    createEmptyCard(node.id);
    onOpenModal(ModalEnum.HIERARCHY_TREE_CARD);
  };

  const handleMoveCard = (
    e: MouseEvent<HTMLDivElement>,
    move: 'up' | 'down',
  ) => {
    e.stopPropagation();
    reorderNodes(node.id, move);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <NodeLabel label={node.label} type={node.type} />
        </Box>
        <SFlex>
          <STagButton
            sx={{ pr: 1, pl: 2 }}
            onClick={(e) => handleMoveCard(e, 'up')}
            icon={KeyboardArrowUpOutlinedIcon}
          />
          <STagButton
            sx={{ pr: 1, pl: 2 }}
            onClick={(e) => handleMoveCard(e, 'down')}
            icon={KeyboardArrowDownOutlinedIcon}
          />
          <STagButton
            sx={{ pr: 1, pl: 2 }}
            onClick={handleAddCard}
            icon={AddIcon}
          />
        </SFlex>
      </Box>
      <Stack spacing={2} mt={3} direction="row">
        <TypeSelect
          node={node as ITreeSelectedItem}
          parentId={node?.parentId || 'no-node'}
          handleSelect={(option) =>
            editNodes([{ id: node.id, type: option.value as TreeTypeEnum }])
          }
        />
        <OptionsHelpSelect menuRef={menuRef} node={node} />
      </Stack>
    </>
  );
};
