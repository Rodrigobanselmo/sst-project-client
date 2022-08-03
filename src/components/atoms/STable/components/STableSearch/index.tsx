import React, { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import STooltip from 'components/atoms/STooltip';

import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { STableSearchProps } from './types';

const STableSearch: FC<STableSearchProps> = ({
  onAddClick,
  onExportClick,
  ...props
}) => (
  <SFlex mb={10} align="center">
    <SInput
      startAdornment={<SearchIcon sx={{ fontSize: '22px', mt: 0 }} />}
      size="small"
      variant="outlined"
      placeholder={'Pesquisar...'}
      subVariant="search"
      autoFocus
      {...props}
    />
    {onAddClick && (
      <STooltip title="Adicionar">
        <div>
          <SButton
            onClick={onAddClick}
            color="success"
            sx={{
              height: 38,
              minWidth: 38,
              maxWidth: 38,
              borderRadius: 1,
              m: 0,
              ml: 2,
            }}
          >
            <Icon
              component={AddIcon}
              sx={{
                fontSize: ['1.4rem'],
                color: 'common.white',
              }}
            />
          </SButton>
        </div>
      </STooltip>
    )}
    {onExportClick && (
      <STooltip title="Importar e Exportar">
        <div>
          <SButton
            onClick={onExportClick}
            sx={{
              height: 38,
              minWidth: 38,
              maxWidth: 38,
              borderRadius: 1,
              m: 0,
              backgroundColor: 'grey.700',
              '&:hover': {
                backgroundColor: 'grey.800',
              },
              ml: 1,
            }}
          >
            <Icon
              component={SUploadIcon}
              sx={{
                fontSize: ['1.2rem'],
                color: 'common.white',
              }}
            />
          </SButton>
        </div>
      </STooltip>
    )}
  </SFlex>
);

export default STableSearch;
