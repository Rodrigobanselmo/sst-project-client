import React, { FC } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Box, SxProps, Theme } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STableAddButton as V2STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { brandIdentityToolbarSquareSx } from 'configs/theme/brand-identity-fill';

import SReloadIcon from 'assets/icons/SReloadIcon';

import { STableButton } from '../STableButton';
import { STableExport } from '../STableExport';
import { STableFilterIcon } from '../STableFilter/STableFilterIcon/STableFilterIcon';
import { STableSearchProps } from './types';

export const STableAddButton: FC<{ children?: any } & STableSearchProps> = ({
  onAddClick,
  addText,
  identitySquareActions,
}) => {
  if (!onAddClick) return null;

  const text =
    typeof addText === 'string' ? addText.trim() || 'Adicionar' : 'Adicionar';

  return (
    <Box sx={{ ml: 2 }}>
      <V2STableAddButton
        onClick={onAddClick}
        text={text}
        identityFill={identitySquareActions}
      />
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
  toolbarAfterAdd,
  toolbarAfterReload,
  pinToolbarWithFilter,
  identitySquareActions,
  filterButtonSx,
  filterProps,
  mb = 10,
  ...props
}) => {
  const filterControl = filterProps ? (
    <STableFilterIcon
      {...filterProps}
      boxProps={pinToolbarWithFilter ? { ml: 0 } : { ml: 'auto' }}
      buttonSx={
        {
          ...(pinToolbarWithFilter ? { ml: 0 } : {}),
          ...(filterButtonSx &&
          typeof filterButtonSx === 'object' &&
          !Array.isArray(filterButtonSx)
            ? filterButtonSx
            : {}),
        } as SxProps<Theme>
      }
    />
  ) : null;

  const rightCluster =
    pinToolbarWithFilter && (toolbarBeforeFilter || filterControl) ? (
      <SFlex ml="auto" align="center" gap={1} sx={{ flexShrink: 0 }}>
        {toolbarBeforeFilter}
        {filterControl}
      </SFlex>
    ) : null;

  return (
    <SFlex mb={mb} align="center">
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
        <STableAddButton
          onAddClick={onAddClick}
          addText={addText}
          identitySquareActions={identitySquareActions}
        />
      )}
      {toolbarAfterAdd}
      {onReloadClick && (
        <STableButton
          tooltip="autualizar"
          onClick={onReloadClick}
          loading={loadingReload}
          icon={SReloadIcon}
          variant={identitySquareActions ? 'outlined' : undefined}
          color={identitySquareActions ? 'transparent' : 'grey.500'}
          iconColor={identitySquareActions ? 'grey.600' : undefined}
          sx={identitySquareActions ? brandIdentityToolbarSquareSx : undefined}
        />
      )}
      {(onExportClick || onImportClick) && (
        <STableExport
          onExportClick={onExportClick}
          onInportClick={onImportClick}
          variant={identitySquareActions ? 'outlined' : undefined}
          iconColor={identitySquareActions ? 'grey.600' : undefined}
          sx={identitySquareActions ? brandIdentityToolbarSquareSx : undefined}
        />
      )}
      {toolbarAfterReload}
      {!pinToolbarWithFilter && toolbarBeforeFilter}
      {rightCluster}
      {!pinToolbarWithFilter && filterControl}

      {children}
    </SFlex>
  );
};

export default STableSearch;
