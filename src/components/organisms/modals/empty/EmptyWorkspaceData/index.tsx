import React, { FC } from 'react';

import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';

interface EmptyProps {
  text?: string;
}

export const EmptyWorkspaceData: FC<EmptyProps> = ({ text }) => {
  const { onOpenModal } = useModal();

  const handleAddMissingData = () => {
    onOpenModal(ModalEnum.WORKSPACE_ADD);
  };

  return (
    <Box>
      <SText mt={-4} maxWidth="400px">
        {text ||
          'Nenhum estabelecimento cadastrado, por favor cadastre antes continuar'}
      </SText>
      <SButton onClick={handleAddMissingData} color="secondary" sx={{ mt: 5 }}>
        Cadastrar Estabelecimento
      </SButton>
    </Box>
  );
};
