import { FC } from 'react';
import { RiCloseFill } from 'react-icons/ri';

import { Box, Icon } from '@mui/material';

import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { SModalHeaderProps } from './SModalHeader.types';

export const SModalHeader: FC<SModalHeaderProps> = ({ title, onClose }) => {
  const onCloseAction = () => {
    onClose();
  };

  return (
    <Box
      display="flex"
      width="100%"
      justifyContent="space-between"
      alignItems="flex-start"
      mb={16}
    >
      {typeof title === 'string' && (
        <SText width="70%" fontWeight="500" fontSize={[12, 15, 20]}>
          {title}
        </SText>
      )}

      {!(typeof title === 'string') && title}

      <SIconButton
        onClick={onCloseAction}
        iconButtonProps={{
          sx: {
            position: 'absolute',
            right: 10,
            top: 10,
          },
        }}
      >
        <Icon sx={{ fontSize: 25 }} component={RiCloseFill} />
      </SIconButton>
    </Box>
  );
};
