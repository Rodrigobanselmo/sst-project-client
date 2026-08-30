import { useRef } from 'react';

import { BoxProps, SxProps, Theme } from '@mui/material';

import SFilterIcon from 'assets/icons/SFilterIcon';

import { useDisclosure } from 'core/hooks/useDisclosure';

import { STableButton } from '../../STableButton';
import { STableFilterPopper } from '../STableFilterPopper/STableFilterPopper';
import { IFilterIconProps } from './types';

export const STableFilterIcon: React.FC<
  { children?: any } & IFilterIconProps & {
    boxProps?: BoxProps;
    buttonSx?: SxProps<Theme>;
    showApplyClearActions?: boolean;
  }
> = ({ boxProps, buttonSx, showApplyClearActions, ...filterProps }) => {
  const { isOpen, toggle, close } = useDisclosure();

  const anchorEl = useRef<null | HTMLButtonElement>(null);

  const handleClick = () => {
    toggle();
  };

  return (
    <>
      <STableButton
        boxProps={{ ml: 'auto', ...boxProps }}
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
          ...buttonSx,
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
        showApplyClearActions={showApplyClearActions}
      />
    </>
  );
};
