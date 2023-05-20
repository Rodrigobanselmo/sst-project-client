import { useEffect, useRef } from 'react';
import { RiNotificationLine } from 'react-icons/ri';

import { Badge } from '@mui/material';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';

import SFilterIcon from 'assets/icons/SFilterIcon';

import { useDisclosure } from 'core/hooks/useDisclosure';
import { useQueryNotifications } from 'core/services/hooks/queries/useQueryNotifications/useQueryNotifications';

import { STableButton } from '../../STableButton';
import { STableFilterPopper } from '../STableFilterPopper/STableFilterPopper';
import { IFilterIconProps } from './types';

export const STableFilterIcon: React.FC<
  { children?: any } & IFilterIconProps
> = (filterProps) => {
  const { isOpen, toggle, close } = useDisclosure();

  const anchorEl = useRef<null | HTMLButtonElement>(null);

  const handleClick = () => {
    toggle();
  };

  return (
    <>
      <STableButton
        boxProps={{ ml: 'auto' }}
        variant="outlined"
        iconColor="gray.600"
        sx={{
          minWidth: 120,
          borderRadius: 3,
          color: 'text.primary',
          borderColor: 'gray.600',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: '#00000011',
            borderColor: 'gray.600',
            filter: 'brightness(0.8)',
          },
        }}
        sm
        tooltip="Filtro"
        ref={anchorEl}
        onClick={handleClick}
        icon={SFilterIcon}
        color="gray.600"
        text={'Filtrar'}
      />

      <STableFilterPopper
        isOpen={isOpen}
        anchorEl={anchorEl}
        close={close}
        filterProps={filterProps}
      />
    </>
  );
};
