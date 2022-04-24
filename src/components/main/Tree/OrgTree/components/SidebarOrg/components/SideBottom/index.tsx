/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { RiskSelect } from 'components/tagSelects/RiskSelect';
import {
  selectRisk,
  setRiskAddState,
} from 'store/reducers/hierarchy/riskAddSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { SideBottomProps } from './types';

export const SideBottom: FC<SideBottomProps> = ({ riskInit }) => {
  const dispatch = useAppDispatch();
  const selectedRisk = useAppSelector(selectRisk);

  const handleSelectRisk = (options: IRiskFactors) => {
    if (options.id) dispatch(setRiskAddState({ risk: options }));
  };

  return (
    <>
      {riskInit && (
        <SFlex justify="flex-end">
          <RiskSelect
            large
            active={!!selectedRisk?.type}
            bg={
              selectedRisk?.type
                ? `risk.${selectedRisk.type.toLocaleLowerCase()}`
                : undefined
            }
            handleSelect={(options) =>
              handleSelectRisk(options as IRiskFactors)
            }
            text={selectedRisk ? selectedRisk.name : 'selecione um risco'}
            multiple={false}
          />
        </SFlex>
      )}
    </>
  );
};
