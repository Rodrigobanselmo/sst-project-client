import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';

import { nodeTypesConstant } from '../../../../constants/node-type.constant';
import { STBoxItem, STBoxItemContainer } from './styles';
import { SideItemsProps } from './types';

export const SideRowGho: FC<SideItemsProps> = ({
  data,
  isSelected,
  isDeleteLoading,
  handleDeleteGHO,
  handleEditGHO,
  hide,
}) => {
  const isHierarchy = 'childrenIds' in data;

  return (
    <STBoxItemContainer
      sx={{
        border: isSelected ? ' 2px solid' : ' 1px solid',
        borderColor: isSelected ? 'info.main' : 'background.divider',
        minHeight: '46px',
      }}
    >
      <STBoxItem
        sx={{
          border: isSelected ? ' 2px solid' : ' 3px solid',
          borderColor: isSelected ? 'info.main' : 'background.divider',
          minHeight: '46px',
        }}
      >
        <STooltip minLength={15} enterDelay={1000} title={data.name}>
          <Box width="75%" overflow="hidden">
            <Box sx={{ display: 'flex', maxWidth: '75%', overflow: 'hidden' }}>
              <SText lineNumber={2}>{data.name}</SText>
            </Box>
            {isHierarchy && (
              <SText fontWeight="500" color="text.light" fontSize={12}>
                {nodeTypesConstant[data.type].name}
              </SText>
            )}
          </Box>
        </STooltip>
        <SFlex>
          {!hide && (
            <>
              <STooltip withWrapper title={'Limpar dados'}>
                <SIconButton
                  loading={isDeleteLoading}
                  onClick={() => handleDeleteGHO(String(data.id), data)}
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
            </>
          )}
        </SFlex>
      </STBoxItem>
      {isHierarchy && (
        <SText color="text.light" fontSize={12}>
          {data.parentsName}
        </SText>
      )}
    </STBoxItemContainer>
  );
};
