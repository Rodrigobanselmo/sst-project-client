import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SHierarchyIcon from 'assets/icons/SHierarchyIcon';

import { STBoxItem } from './styles';
import { RowItemsProps } from './types';

export const Row: FC<RowItemsProps> = ({
  data,
  isSelected,
  isDeleteLoading,
  handleDeleteGHO,
  handleSelectGHO,
  handleEditGHO,
  hide,
}) => {
  const hierarchies = data.hierarchies
    ? data.hierarchies.map((value) => value.id + '//' + value.workspaceId)
    : [];

  return (
    <STBoxItem
      sx={{
        border: isSelected ? ' 2px solid' : ' 1px solid',
        borderColor: isSelected ? 'info.main' : 'background.divider',
        minHeight: '46px',
      }}
    >
      <STooltip minLength={15} enterDelay={1000} title={data.name}>
        <Box sx={{ display: 'flex', maxWidth: '75%', overflow: 'hidden' }}>
          <SText lineNumber={2}>{data.name}</SText>
        </Box>
      </STooltip>
      <SFlex>
        {!hide && (
          <>
            <STooltip withWrapper title={'Deletar'}>
              <SIconButton
                loading={isDeleteLoading}
                onClick={() => handleDeleteGHO(data.id)}
                size="small"
              >
                <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
              </SIconButton>
            </STooltip>
            <STooltip withWrapper title={'Editar'}>
              <SIconButton onClick={() => handleEditGHO(data)} size="small">
                <Icon component={SEditIcon} sx={{ fontSize: '1.2rem' }} />
              </SIconButton>
            </STooltip>
            <STooltip withWrapper title={'Adicionar setores e cargos ao grupo'}>
              <SIconButton
                onClick={() =>
                  handleSelectGHO(isSelected ? null : data, hierarchies)
                }
                size="small"
              >
                <Icon
                  component={isSelected ? SCloseIcon : SHierarchyIcon}
                  sx={{
                    fontSize: '1.2rem',
                    color: isSelected ? 'info.main' : '',
                  }}
                />
              </SIconButton>
            </STooltip>
          </>
        )}
      </SFlex>
    </STBoxItem>
  );
};
