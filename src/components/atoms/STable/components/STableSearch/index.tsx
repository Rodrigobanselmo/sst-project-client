import React, { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';

import { STableSearchProps } from './types';

const STableSearch: FC<STableSearchProps> = ({ onAddClick, ...props }) => (
  <SFlex ml={-2} mb={10} align="center">
    <SInput
      startAdornment={<SearchIcon sx={{ fontSize: '22px', mt: 0 }} />}
      size="small"
      variant="outlined"
      placeholder={'Pesquisar...'}
      subVariant="search"
      {...props}
    />
    {onAddClick && (
      <SButton
        onClick={onAddClick}
        color="success"
        shadow
        sx={{
          height: 38,
          minWidth: 38,
          maxWidth: 38,
          m: 0,
          ml: 1,
        }}
      >
        <AddIcon />
      </SButton>
    )}
  </SFlex>
);

export default STableSearch;
