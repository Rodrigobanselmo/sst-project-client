import React, { FC, MouseEvent } from 'react';

import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Box, Icon, Stack } from '@mui/material';

import { useModal } from '../../../../../../../core/contexts/ModalContext';
import { useTreeActions } from '../../../../../../../core/contexts/TreeActionsContextProvider';
import { ModalEnum } from '../../../../../../../core/enums/modal.enums';
import SText from '../../../../../../atoms/SText';
import { STSBoxButton } from './styles';
import { INodeCardProps } from './types';

export const NodeCard: FC<INodeCardProps> = ({ node }) => {
  const { onOpenModal } = useModal();
  const { setSelectedItem } = useTreeActions();

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    onOpenModal(ModalEnum.TREE_CARD);
    setSelectedItem(node, 'add');
    e.stopPropagation();
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <SText lineHeight="15px" fontSize="12px" color="text.light" mb={2}>
            Categoria
          </SText>
          <SText
            sx={{ pr: 10, width: '100%', fontSize: '15px', lineHeight: '18px' }}
            lineNumber={2}
          >
            {node.label}
          </SText>
        </Box>
        <STSBoxButton onClick={handleAddCard}>
          <Icon sx={{ fontSize: 14 }} component={AddIcon} />
        </STSBoxButton>
      </Box>
      <Stack spacing={2} mt={3} direction="row">
        <STSBoxButton onClick={handleAddCard}>
          <Icon sx={{ fontSize: 14 }} component={MoreHorizIcon} />
        </STSBoxButton>
        <STSBoxButton onClick={handleAddCard}>
          <Icon sx={{ fontSize: 14 }} component={AddIcon} />
        </STSBoxButton>
      </Stack>
    </>
  );
};
