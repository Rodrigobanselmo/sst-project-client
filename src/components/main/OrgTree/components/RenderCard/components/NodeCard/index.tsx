import React, { FC, MouseEvent } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, Stack } from '@mui/material';

import { useModal } from '../../../../../../../core/contexts/ModalContext';
import { useTreeActions } from '../../../../../../../core/contexts/TreeActionsContextProvider';
import { ModalEnum } from '../../../../../../../core/enums/modal.enums';
import { TreeTypeEnum } from '../../../../../../../core/enums/tree-type.enums';
import { IRiskFactors } from '../../../../../../../core/interfaces/IRiskFactors';
import { STagButton } from '../../../../../../atoms/STagButton';
import SText from '../../../../../../atoms/SText';
import { ITreeSelectedItem } from '../../../../interfaces';
import { nodeTypesConstant } from '../../../ModalEditCard/utils/node-type.constant';
import { RiskSelect } from '../../../Selects/RiskSelect';
import { TypeSelect } from '../../../Selects/TypeSelect';
import { INodeCardProps } from './types';

export const NodeCard: FC<INodeCardProps> = ({ node }) => {
  const { onOpenModal } = useModal();
  const { setSelectedItem, addNodes, editNodes, getUniqueId } =
    useTreeActions();

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    onOpenModal(ModalEnum.TREE_CARD);

    const newNode = {
      id: getUniqueId(),
      childrenIds: [],
      type: nodeTypesConstant[node.type].childOptions[0],
      label: '',
      parentId: node.id,
      expand: false,
    };

    editNodes([{ id: node.id, expand: true }]);
    addNodes([newNode]);
    setSelectedItem(newNode, 'add');
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
          <SText
            sx={{ pr: 10, width: '100%', fontSize: '15px', lineHeight: '18px' }}
            lineNumber={2}
          >
            {node.label}
          </SText>
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
        <RiskSelect
          node={node as ITreeSelectedItem}
          handleSelect={(option: IRiskFactors) =>
            editNodes([{ id: node.id, risks: [option.id] }])
          }
        />
      </Stack>
    </>
  );
};
