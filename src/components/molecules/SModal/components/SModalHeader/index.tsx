import { FC } from 'react';

import { Box, Icon } from '@mui/material';
import { RiCloseFill } from '@react-icons/all-files/ri/RiCloseFill';

import { useModal } from '../../../../../core/contexts/ModalContext';
import SIconButton from '../../../../atoms/SIconButton';
import SText from '../../../../atoms/SText';
import { SModalHeaderProps } from './types';

export const SModalHeader: FC<SModalHeaderProps> = ({
  title,
  subtitle,
  modalName,
  onClose,
  ...props
}) => {
  const { onCloseModal } = useModal();

  const onCloseAction = () => {
    onClose && onClose();
    onCloseModal(modalName);
  };

  return (
    <Box
      display="flex"
      width="100%"
      justifyContent="space-between"
      alignItems="flex-start"
      mb={5}
      {...props}
    >
      {subtitle && (
        <Box>
          <SText variant="h4">{title}</SText>
          <SText lineHeight="1px">{subtitle}</SText>
        </Box>
      )}
      {!subtitle && <SText variant="h4">{title}</SText>}
      <SIconButton
        sx={{ ml: [10, 10, 50], mt: -4, mr: -4 }}
        onClick={onCloseAction}
      >
        <Icon sx={{ fontSize: 30 }} component={RiCloseFill} />
      </SIconButton>
    </Box>
  );
};
