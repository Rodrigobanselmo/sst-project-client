import React, { FC } from 'react';

import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import { Checkbox } from '@mui/material';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';

import { characterizationMap } from 'core/constants/maps/characterization.map';
import { environmentMap } from 'core/constants/maps/environment.map';

import { ViewsDataEnum } from '../../../utils/view-data-type.constant';
import { STBoxContainer, STBoxItem } from './styles';
import { SideItemsProps } from './types';

export const SideMainGho: FC<SideItemsProps> = ({
  data,
  handleSelect,
  isSelected,
  handleEndSelect,
  isEndSelect,
  viewDataType,
}) => {
  const handleClickBox = () => {
    const id = !isEndSelect ? data.id : data.id + '-end';
    document.getElementById(id)?.click();
  };

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
    <STooltip
      withWrapper
      minLength={15}
      title={(isHierarchy ? data.parentsName + ' > ' : '') + name}
    >
      <STBoxContainer
        overflow="hidden"
        disabled={isEndSelect ? 1 : 0}
        onClick={handleClickBox}
      >
        {topText && (
          <SText
            sx={{
              backgroundColor: isEndSelect ? 'grey.400' : 'gray.200',
              borderRadius: '4px',
              pl: 4,
            }}
            fontSize={12}
          >
            {topText}
          </SText>
        )}

        <STBoxItem overflow="hidden" disabled={isEndSelect ? 1 : 0}>
          {!isEndSelect && (
            <Checkbox
              id={data.id}
              checked={isSelected}
              onClick={handleSelect}
              size="small"
              sx={{
                'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                  color: 'grey.400',
                },
              }}
            />
          )}

          <SText sx={{ width: '100%' }} lineNumber={2}>
            {name}
          </SText>
          {handleEndSelect && (
            <STooltip
              withWrapper
              title={'Desabilitar a inclusão de dados ao salvar'}
            >
              <Checkbox
                id={data.id + '-end'}
                checked={isEndSelect}
                onClick={handleEndSelect}
                color="default"
                size="small"
                checkedIcon={<DisabledByDefaultOutlinedIcon />}
                sx={{
                  svg: {
                    color: isEndSelect ? 'grey.400' : 'grey.400',
                  },
                }}
              />
            </STooltip>
          )}
        </STBoxItem>
      </STBoxContainer>
    </STooltip>
  );
};
