import React, { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import STooltip from 'components/atoms/STooltip';

import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { STableButtonProps, STableSearchProps } from './types';

export const STableAddButton: FC<STableSearchProps> = ({
  onAddClick,
  addText,
}) => {
  return (
    <STooltip title={addText ? '' : 'Adicionar'}>
      <Box>
        <SButton
          onClick={onAddClick}
          color="success"
          sx={{
            height: 38,
            minWidth: 38,
            borderRadius: 1,
            m: 0,
            ml: 2,
            px: 4,
          }}
        >
          <Icon
            component={AddIcon}
            sx={{
              fontSize: ['1.4rem'],
              color: 'common.white',
            }}
          />
          {addText && <Box mr={3}>{addText}</Box>}
        </SButton>
      </Box>
    </STooltip>
  );
};

export const STableButton: FC<STableButtonProps> = ({
  addText,
  icon = AddIcon,
  color = 'success.main',
  tooltip,
  ...props
}) => {
  return (
    <STooltip title={tooltip || addText}>
      <div>
        <SButton
          {...props}
          sx={{
            height: 38,
            minWidth: 38,
            borderRadius: 1,
            m: 0,
            ml: 2,
            px: 4,
            backgroundColor: color,
            '&:hover': {
              backgroundColor: color,
              filter: 'brightness(0.8)',
            },
            ...props?.sx,
          }}
        >
          <Icon
            component={icon}
            sx={{
              fontSize: ['1.2rem'],
              color: 'common.white',
            }}
          />
          {addText && (
            <Box mr={3} ml={2}>
              {addText}
            </Box>
          )}
        </SButton>
      </div>
    </STooltip>
  );
};

const STableSearch: FC<STableSearchProps> = ({
  onAddClick,
  onExportClick,
  children,
  addText,
  boxProps,
  ...props
}) => (
  <SFlex mb={10} align="center">
    <Box {...boxProps}>
      <SInput
        startAdornment={<SearchIcon sx={{ fontSize: '22px', mt: 0 }} />}
        size="small"
        variant="outlined"
        placeholder={'Pesquisar...'}
        subVariant="search"
        autoFocus
        fullWidth
        {...props}
      />
    </Box>
    {onAddClick && (
      <STableAddButton onAddClick={onAddClick} addText={addText} />
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
    {children}
  </SFlex>
);

export default STableSearch;
