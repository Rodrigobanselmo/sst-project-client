import { FC } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { IIconProps } from '@v2/types/icon-props.types';
import SFlex from 'components/atoms/SFlex';

export const SIconUnfolderMore: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <SFlex flexDirection="column" gap={0} center>
      <KeyboardArrowUpIcon
        sx={{
          fontSize: fontSize || '10px',
          color: color || 'inherit',
          mb: '-2.5px',
        }}
      />
      <KeyboardArrowDownIcon
        sx={{
          fontSize: fontSize || '10px',
          color: color || 'inherit',
          mt: '-2.5px',
        }}
      />
    </SFlex>
  );
};
