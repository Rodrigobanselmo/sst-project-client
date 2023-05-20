import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { SPopperHelper } from 'components/molecules/SPopperArrow/SPopperHelper';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SHierarchyIcon from 'assets/icons/SHierarchyIcon';

import { STBoxItem } from './styles';
import { RowItemsProps } from './types';

export const Row: FC<{ children?: any } & RowItemsProps> = ({
  data,
  isSelected,
  isDeleteLoading,
  handleDeleteGHO,
  handleSelectGHO,
  handleEditGHO,
  hide,
  isFirst,
  anchorEl,
}) => {
  const hierarchies = data.hierarchies
    ? data.hierarchies
        .map((value) =>
          data?.workspaceIds?.map(
            (workspaceId) => value.id + '//' + workspaceId,
          ),
        )
        .flat(1)
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
                onClick={() => handleDeleteGHO(data.id, data)}
                size="small"
              >
                <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
              </SIconButton>
            </STooltip>
            {handleEditGHO && (
              <STooltip withWrapper title={'Editar'}>
                <SIconButton onClick={() => handleEditGHO?.(data)} size="small">
                  <Icon component={SEditIcon} sx={{ fontSize: '1.2rem' }} />
                </SIconButton>
              </STooltip>
            )}
            <STooltip withWrapper title={'Adicionar cargos ao GSE'}>
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
        <div style={{ backgroundColor: 'red', width: 0 }} ref={anchorEl}></div>
      </SFlex>
    </STBoxItem>
  );
};
