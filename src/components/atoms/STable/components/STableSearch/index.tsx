import React, { FC } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STableAddButton as V2STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';

import SReloadIcon from 'assets/icons/SReloadIcon';

import { STableButton } from '../STableButton';
import { STableExport } from '../STableExport';
import { STableFilterIcon } from '../STableFilter/STableFilterIcon/STableFilterIcon';
import { STableSearchProps } from './types';

export const STableAddButton: FC<{ children?: any } & STableSearchProps> = ({
  onAddClick,
  addText,
}) => {
  if (!onAddClick) return null;

  const text =
    typeof addText === 'string' ? addText.trim() || 'Adicionar' : 'Adicionar';

  return (
    <Box sx={{ ml: 2 }}>
      <V2STableAddButton onClick={onAddClick} text={text} />
    </Box>
  );
};

const STableSearch: FC<{ children?: any } & STableSearchProps> = ({
  onAddClick,
  onExportClick,
  onImportClick,
  onReloadClick,
  loadingReload,
  children,
  addText,
  boxProps,
  toolbarBeforeFilter,
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
    {toolbarBeforeFilter}
    {filterProps && <STableFilterIcon {...filterProps} />}

    {children}
  </SFlex>
);

export default STableSearch;
