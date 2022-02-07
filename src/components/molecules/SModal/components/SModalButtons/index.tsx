import { FC } from 'react';

import { Box } from '@mui/material';

import { useModal } from '../../../../../core/contexts/ModalContext';
import { SButton } from '../../../../atoms/SButton';
import { SModalHeaderProps, IModalButton } from './types';

export const SModalButtons: FC<SModalHeaderProps> = ({
  buttons = [{} as IModalButton, {} as IModalButton],
  modalName,
  onClose: close,
  ...props
}) => {
  const { onCloseModal } = useModal();

  const onClose = () => {
    if (modalName) onCloseModal(modalName);
    if (close) close();
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
      {buttons.map(({ text, variant, ...buttonProps }, index) => {
        const isFirst = index === 0;
        return (
          <SButton
            key={`${index}-button`}
            variant={variant ? variant : isFirst ? 'outlined' : 'contained'}
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