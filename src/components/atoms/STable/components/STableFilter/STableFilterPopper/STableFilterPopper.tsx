import { FC } from 'react';

import { Button } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

import { SPopperArrow } from '../../../../../molecules/SPopperArrow';
import { STableFilterBox } from '../STableFilterBox/STableFilterBox';
import { IFilterPopperProps } from './types';

export const STableFilterPopper: FC<
  { children?: any } & IFilterPopperProps
> = ({ anchorEl, isOpen, close, filterProps, showApplyClearActions }) => {
  return (
    <SPopperArrow
      anchorEl={anchorEl}
      isOpen={isOpen}
      close={close}
      color="paper"
      placement="bottom-start"
      popperProps={{ disablePortal: true }}
      sx={{
        transform: 'translate(6px, 15px)',
        width: ['90%', 400],
        px: 5,
        py: 5,
        pb: 7,
        color: 'text.main',
      }}
    >
      <STableFilterBox closePopper={close} filterProps={filterProps} />
      {showApplyClearActions && (
        <SFlex
          justify="flex-end"
          gap={2}
          mt={6}
          pt={4}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => filterProps.clearFilter()}
            sx={{ textTransform: 'none' }}
          >
            Limpar filtro
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => close()}
            sx={{ textTransform: 'none' }}
          >
            Aplicar filtro
          </Button>
        </SFlex>
      )}
    </SPopperArrow>
  );
};
