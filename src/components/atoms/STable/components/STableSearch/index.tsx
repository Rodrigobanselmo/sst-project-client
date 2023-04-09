import React, { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import STooltip from 'components/atoms/STooltip';

import SReloadIcon from 'assets/icons/SReloadIcon';
import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { STableButton } from '../STableButton';
import { STableExport } from '../STableExport';
import { STableFilterIcon } from '../STableFilter/STableFilterIcon/STableFilterIcon';
import { STableButtonProps, STableSearchProps } from './types';

export const STableAddButton: FC<STableSearchProps> = ({
  onAddClick,
  addText,
  sm,
}) => {
  return (
    <STooltip title={addText ? '' : 'Adicionar'}>
      <Box>
        <SButton
          onClick={onAddClick}
          color="success"
          sx={{
            height: sm ? 30 : [30, 30, 38],
            minWidth: sm ? 30 : [30, 30, 38],
            borderRadius: 1,
            m: 0,
            ml: 2,
            px: 4,
          }}
        >
          <Icon
            component={AddIcon}
            sx={{
              fontSize: [
                sm
                  ? ['0.9rem', '0.9rem', '1rem']
                  : ['1.1rem', '1.1rem', '1.4rem'],
              ],
              color: 'common.white',
            }}
          />
          {addText && <Box mr={3}>{addText}</Box>}
        </SButton>
      </Box>
    </STooltip>
  );
};

const STableSearch: FC<STableSearchProps> = ({
  onAddClick,
  onExportClick,
  onImportClick,
  onReloadClick,
  loadingReload,
  children,
  addText,
  boxProps,
  filterProps,
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
    {onReloadClick && (
      <STableButton
        tooltip="autualizar"
        onClick={onReloadClick}
        loading={loadingReload}
        icon={SReloadIcon}
        color="grey.500"
      />
    )}
    {(onExportClick || onImportClick) && (
      <STableExport
        onExportClick={onExportClick}
        onInportClick={onImportClick}
      />
    )}
    {filterProps && <STableFilterIcon {...filterProps} />}

    {children}
  </SFlex>
);

export default STableSearch;
