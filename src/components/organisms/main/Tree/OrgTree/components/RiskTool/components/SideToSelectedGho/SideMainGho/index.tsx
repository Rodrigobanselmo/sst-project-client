import React, { FC } from 'react';

import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import { Checkbox } from '@mui/material';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { STBoxItem } from './styles';
import { SideItemsProps } from './types';

export const SideMainGho: FC<SideItemsProps> = ({
  data,
  handleSelect,
  isSelected,
  handleEndSelect,
  isEndSelect,
}) => {
  const handleClickBox = () => {
    const id = !isEndSelect ? data.id : data.id + '-end';
    document.getElementById(id)?.click();
  };

  return (
    <STBoxItem
      overflow="hidden"
      disabled={isEndSelect ? 1 : 0}
      onClick={handleClickBox}
    >
      {!isEndSelect && (
        <Checkbox
          id={data.id}
          checked={isSelected}
          onClick={handleSelect}
          onChange={() => console.log()}
          size="small"
          sx={{
            'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
              color: 'grey.400',
            },
          }}
        />
      )}
      <STooltip withWrapper minLength={15} enterDelay={1000} title={data.name}>
        <SText sx={{ width: '100%' }} lineNumber={2}>
          {data.name}
        </SText>
      </STooltip>
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
  );
};
