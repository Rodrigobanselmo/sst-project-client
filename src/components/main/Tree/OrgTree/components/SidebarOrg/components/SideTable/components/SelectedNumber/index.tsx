import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';

import { STSFlex, STText } from './styles';
import { SelectedNumberProps } from './types';

export const SelectedNumber: FC<SelectedNumberProps> = ({
  handleSelect,
  selectedNumber,
  disabledGtEqual = 6,
}) => {
  return (
    <SFlex maxHeight={24} center>
      {[1, 2, 3, 4, 5].map((number) => {
        return (
          <STSFlex
            selected={selectedNumber === number ? 1 : 0}
            onClick={() => {
              if (handleSelect && number < disabledGtEqual)
                handleSelect(number);
            }}
            key={number}
            disabled={number >= disabledGtEqual ? 1 : 0}
            center
          >
            <STText selected={selectedNumber === number ? 1 : 0}>
              {number}
            </STText>
          </STSFlex>
        );
      })}
    </SFlex>
  );
};
