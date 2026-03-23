import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';

import { characterizationMap } from 'core/constants/maps/characterization.map';
import { environmentMap } from 'core/constants/maps/environment.map';

import { nodeTypesConstant } from '../../../../constants/node-type.constant';
import { ViewsDataEnum } from '../../utils/view-data-type.constant';
import { STBoxItemContainer } from './styles';
import { SideItemsProps } from './types';

export const SideRowGho: FC<{ children?: any } & SideItemsProps> = ({
  data,
  isSelected,
  isDeleteLoading,
  handleDeleteGHO,
  handleEditGHO,
  hide,
  viewDataType,
  riskData,
}) => {
  const isHierarchy = 'childrenIds' in data;

  const getTopText = () => {
    if (viewDataType == ViewsDataEnum.GSE) return;
    if (isHierarchy) return nodeTypesConstant[data.type].name;

    if (data.description) {
      const splitValues = data.description.split('(//)');
      if (splitValues[1]) {
        if (viewDataType == ViewsDataEnum.ENVIRONMENT)
          return (environmentMap as any)[splitValues[1]]?.name;
        if (viewDataType == ViewsDataEnum.CHARACTERIZATION)
          return (characterizationMap as any)[splitValues[1]]?.name;
      }
    }

    return;
  };

  const getName = () => {
    if (isHierarchy) return data.name;

    if (data.description) {
      const splitValues = data.description.split('(//)');
      if (splitValues[1]) {
        return splitValues[0];
      }
    }

    return data.name;
  };

  const topText = getTopText();
  const name = getName();

  return (
    <Box>
      <STooltip
        placement="right"
        title={(isHierarchy ? data.parentsName + ' > ' : '') + name}
      >
        <STBoxItemContainer
          sx={{
            border: isSelected ? ' 2px solid' : ' 1px solid',
            borderColor: isSelected ? 'info.main' : 'background.divider',
            minHeight: '46px',
          }}
        >
          <Box
            // width="75%"
            overflow="hidden"
          >
            <Box
              sx={{
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              <SText lineNumber={2} fontSize="13px">
                {name}
              </SText>
            </Box>
            {topText && (
              <SText fontWeight="500" color="text.light" fontSize={12}>
                {topText}
              </SText>
            )}
          </Box>
          <SFlex>
            {!hide && (
              <>
                {/* <STooltip withWrapper title={'Limpar dados'}>
                  <SIconButton
                    loading={isDeleteLoading}
                    onClick={() => handleDeleteGHO(String(riskData.id), data)}
                    size="small"
                  >
                    <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
                  </SIconButton>
                </STooltip> */}
                {/* <STooltip withWrapper title={'Editar'}>
                <SIconButton onClick={() => handleEditGHO(data)} size="small">
                  <Icon component={SEditIcon} sx={{ fontSize: '1.2rem' }} />
                </SIconButton>
              </STooltip> */}
              </>
            )}
          </SFlex>
        </STBoxItemContainer>
      </STooltip>
    </Box>
  );
};
