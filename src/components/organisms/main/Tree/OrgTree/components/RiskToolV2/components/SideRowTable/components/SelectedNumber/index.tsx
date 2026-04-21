import React, { FC } from 'react';
import { useSnackbar } from 'notistack';

import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';

import { STSFlex, STText } from './styles';
import { SelectedNumberProps } from './types';

export const SelectedNumber: FC<{ children?: any } & SelectedNumberProps> = ({
  handleSelect,
  selectedNumber,
  disabledGtEqual = 7,
  handleHelp,
  disabledReason,
  getDisabledReason,
  disabledNumbers,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <SFlex maxHeight={24} center>
      {[1, 2, 3, 4, 5, 6].map((number) => {
        const isDisabledByThreshold = number >= disabledGtEqual;
        const isDisabledByList = disabledNumbers?.includes(number) || false;
        const isDisabled = isDisabledByThreshold || isDisabledByList;
        const blockedReason = getDisabledReason?.(number) || disabledReason;
        const tooltipTitle =
          isDisabled && blockedReason
            ? blockedReason
            : number === 6
              ? 'Interronper atividades'
              : '';

        return (
          <STooltip
            key={number}
            title={tooltipTitle}
          >
            <STSFlex
              selected={selectedNumber === number ? 1 : 0}
              onClick={() => {
                if (isDisabled) {
                  if (blockedReason) {
                    enqueueSnackbar(blockedReason, { variant: 'info' });
                  }
                  return;
                }

                if (handleSelect)
                  handleSelect(number);
              }}
              disabled={isDisabled ? 1 : 0}
              center
            >
              <STText selected={selectedNumber === number ? 1 : 0}>
                {number === 6 ? '!' : number}
              </STText>
            </STSFlex>
          </STooltip>
        );
      })}
      {handleHelp && (
        <STooltip title="Precisando de ajuda?">
          <STSFlex
            onClick={handleHelp}
            sx={{ backgroundColor: 'grey.600' }}
            center
          >
            <STText sx={{ color: 'white' }}>?</STText>
          </STSFlex>
        </STooltip>
      )}
    </SFlex>
  );
};
