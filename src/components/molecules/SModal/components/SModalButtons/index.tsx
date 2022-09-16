import { FC } from 'react';

import { Box } from '@mui/material';

import SArrowNextIcon from 'assets/icons/SArrowNextIcon';

import { useModal } from 'core/hooks/useModal';

import { SButton } from '../../../../atoms/SButton';
import { IModalButton, SModalHeaderProps } from './types';

export const SModalButtons: FC<SModalHeaderProps> = ({
  buttons = [{} as IModalButton, {} as IModalButton],
  modalName,
  onClose: close,
  loading,
  children,
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
      {children}
      {buttons.map(
        ({ text, variant, arrowBack, arrowNext, ...buttonProps }, index) => {
          const isFirst = index === 0;
          const isLast = index === buttons.length - 1;
          return (
            <SButton
              loading={loading && isLast}
              key={`${index}-button`}
              variant={variant ? variant : isFirst ? 'outlined' : 'contained'}
              onClick={onClose}
              style={{ minWidth: 100 }}
              {...buttonProps}
            >
              {arrowBack && (
                <SArrowNextIcon
                  sx={{
                    fontSize: 13,
                    mr: 2,
                    ml: -4,
                    transform: 'rotate(180deg)',
                  }}
                />
              )}
              {text || (isFirst ? 'Cancelar' : 'Confirmar')}
              {arrowNext && (
                <SArrowNextIcon sx={{ fontSize: 13, ml: 1, mr: -2 }} />
              )}
            </SButton>
          );
        },
      )}
    </Box>
  );
};
