import { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import { SPopperArrow } from '../../../../../molecules/SPopperArrow';
import { FilterFieldEnum } from '../constants/filter.map';
import { STableFilterBox } from '../STableFilterBox/STableFilterBox';
import { IFilterPopperProps } from './types';

export const STableFilterPopper: FC<
  { children?: any } & IFilterPopperProps
> = ({ anchorEl, isOpen, close, filterProps }) => {
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
      {/* <SText color="text.light" fontWeight={'600'} fontSize={13}>
        Filtrar por:
      </SText> */}
      <STableFilterBox closePopper={close} filterProps={filterProps} />
    </SPopperArrow>
  );
};
