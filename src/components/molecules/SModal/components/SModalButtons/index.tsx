import { FC } from 'react';

import { Box } from '@mui/material';

import { useModal } from '../../../../../core/contexts/ModalContext';
import { SButton } from '../../../../atoms/SButton';
import { SModalHeaderProps, IModalButton } from './types';

export const SModalButtons: FC<SModalHeaderProps> = ({
  buttons = [{} as IModalButton, {} as IModalButton],
  modalName,
  ...props
}) => {
  const { onCloseModal } = useModal();

  const onClose = () => {
    onCloseModal(modalName);
  };

  return (
    <Box
      mt={8}
      display="flex"
      width="100%"
      justifyContent="flex-end"
      gap={5}
      {...props}
    >
      {buttons.map(({ text, ...buttonProps }, index) => {
        const isFirst = index === 0;
        return (
          <SButton
            key={`${index}-button`}
            size={'large'}
            variant={isFirst ? 'outlined' : 'contained'}
            onClick={onClose}
            {...buttonProps}
          >
            {text || (isFirst ? 'Cancelar' : 'Confirmar')}
          </SButton>
        );
      })}
    </Box>
  );
};
