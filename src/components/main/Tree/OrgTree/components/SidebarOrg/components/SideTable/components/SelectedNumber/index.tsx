import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';

import { STSFlex, STText } from './styles';
import { SelectedNumberProps } from './types';

export const SelectedNumber: FC<SelectedNumberProps> = ({
  handleSelect,
  selectedNumber,
}) => {
  return (
    <SFlex center>
      {[1, 2, 3, 4, 5].map((number) => {
        return (
          <STSFlex
            selected={selectedNumber === number ? 1 : 0}
            onClick={() => handleSelect && handleSelect(number)}
            key={number}
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
