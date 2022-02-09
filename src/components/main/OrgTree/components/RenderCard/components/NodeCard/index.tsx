import React, { FC, MouseEvent } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, Stack } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { useModal } from 'core/hooks/useModal';

import { ModalEnum } from '../../../../../../../core/enums/modal.enums';
import { TreeTypeEnum } from '../../../../../../../core/enums/tree-type.enums';
import { useTreeActions } from '../../../../../../../core/hooks/useTreeActions';
import { STagButton } from '../../../../../../atoms/STagButton';
import SText from '../../../../../../atoms/SText';
import { ITreeSelectedItem } from '../../../../interfaces';
import { MedSelect } from '../../../Selects/MedSelect';
import { RecSelect } from '../../../Selects/RecSelect';
import { RiskSelect } from '../../../Selects/RiskSelect';
import { TypeSelect } from '../../../Selects/TypeSelect';
import { INodeCardProps } from './types';

const NodeLabel: FC<{ label: string; type: TreeTypeEnum }> = ({
  label,
  type,
}) => {
  const hasLabel = [TreeTypeEnum.OPTION, TreeTypeEnum.QUESTION].includes(type);
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

export const NodeCard: FC<INodeCardProps> = ({ node }) => {
  const { onOpenModal } = useModal();
  const { editNodes, createEmptyCard } = useTreeActions();

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    createEmptyCard(node.id);
    onOpenModal(ModalEnum.TREE_CARD);
    e.stopPropagation();
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          {node.id !== 'mock_id' && (
            <SText
              className="node-tree-text-id"
              lineHeight="15px"
              fontSize="12px"
              color="text.light"
              mb={2}
            >
              {node.id}
            </SText>
          )}
          <NodeLabel label={node.label} type={node.type} />
        </Box>
        <STagButton sx={{ px: 2 }} onClick={handleAddCard} icon={AddIcon} />
      </Box>
      <Stack spacing={2} mt={3} direction="row">
        <TypeSelect
          node={node as ITreeSelectedItem}
          parentId={node?.parentId || 'no-node'}
          handleSelect={(option) =>
            editNodes([{ id: node.id, type: option.value as TreeTypeEnum }])
          }
        />
        {node.type === TreeTypeEnum.OPTION && (
          <>
            <RiskSelect node={node as ITreeSelectedItem} />
            <MedSelect node={node as ITreeSelectedItem} />
            <RecSelect node={node as ITreeSelectedItem} />
          </>
        )}
      </Stack>
    </>
  );
};
