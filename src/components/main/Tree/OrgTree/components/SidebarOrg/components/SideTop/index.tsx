/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STag } from 'components/atoms/STag';
import SText from 'components/atoms/SText';
import { RiskSelect } from 'components/tagSelects/RiskSelect';
import { setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
  setRiskAddInit,
  setRiskAddState,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SExpandIcon from 'assets/icons/SExpandIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { SideTopProps } from './types';

export const SideTop: FC<SideTopProps> = ({ riskInit, handleSelectGHO }) => {
  const dispatch = useAppDispatch();
  const selectedRisk = useAppSelector(selectRisk);

  const handleSelectRisk = (options: IRiskFactors) => {
    if (options.id) dispatch(setRiskAddState({ risk: options }));
  };

  return (
    <SFlex align="center" gap="1" mb={2}>
      <SIconButton
        onClick={() => {
          dispatch(setGhoOpen());
          dispatch(setRiskAddInit());
          handleSelectGHO(null, []);
        }}
        size="small"
      >
        <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
      </SIconButton>
      <SText fontSize="0.9rem" color="GrayText">
        G.H.E
      </SText>
      {riskInit && (
        <SFlex center sx={{ ml: 'auto' }}>
          {selectedRisk?.severity && (
            <>
              <SText fontSize={15} color="text.light" mr={2}>
                Severidade
              </SText>
              <STag
                sx={{ px: 4, mr: 15, fontWeight: 'bold' }}
                text={String(selectedRisk?.severity)}
                action={String(selectedRisk?.severity) as any}
              />
            </>
          )}
          <RiskSelect
            sx={{ minWidth: 230, mr: 5 }}
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

          <SIconButton
            onClick={() => {
              dispatch(setRiskAddToggleExpand());
            }}
            size="small"
          >
            <Icon component={SExpandIcon} sx={{ fontSize: '1.2rem' }} />
          </SIconButton>
        </SFlex>
      )}
    </SFlex>
  );
};